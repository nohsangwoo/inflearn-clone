import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { db, lectures } from "@/db"
import { brand } from "@/lib/brand"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import {
  buildCoursePreviewCopy,
  buildCoursePreviewPrompt,
  composeCoursePreviewImage,
  COURSE_PREVIEW_MODEL_HEIGHT,
  COURSE_PREVIEW_WIDTH,
  coursePreviewVariants,
} from "@/lib/server/course-preview-images"

export const runtime = "nodejs"
export const maxDuration = 300

type OpenAIImageResponse = {
  data?: Array<{ b64_json?: string }>
  error?: { message?: string }
}

const bucket = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

function getS3Client() {
  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("aws_env_missing")
  }
  return new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  const lecture = await db.query.lectures.findFirst({
    where:
      user.role === "ADMIN"
        ? eq(lectures.id, id)
        : and(eq(lectures.id, id), eq(lectures.instructorId, user.id)),
    columns: {
      id: true,
      title: true,
      shortDescription: true,
      category: true,
      level: true,
      tags: true,
    },
  })

  if (!lecture) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ message: "openai_env_missing" }, { status: 500 })
  }

  try {
    getS3Client()
  } catch {
    return NextResponse.json({ message: "aws_env_missing" }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const topicInput = typeof body?.topic === "string" ? body.topic.trim().slice(0, 500) : ""
  const headlineInput = typeof body?.headline === "string" ? body.headline.trim().slice(0, 90) : ""
  const count = Math.min(4, Math.max(1, Number(body?.count ?? 3) || 3))
  const topic =
    topicInput ||
    [lecture.title, lecture.shortDescription, lecture.category, lecture.level, ...(lecture.tags ?? [])]
      .filter(Boolean)
      .join(" / ")

  const copy = buildCoursePreviewCopy({
    title: lecture.title,
    topic,
    headline: headlineInput,
    category: lecture.category,
    level: lecture.level,
  })

  try {
    const candidates = []
    for (let index = 0; index < count; index += 1) {
      const variant = coursePreviewVariants[index % coursePreviewVariants.length]
      const prompt = buildCoursePreviewPrompt(topic, variant)
      const background = await generateBackground(prompt)
      const image = await composeCoursePreviewImage(background, {
        headline: copy.headline,
        subline: copy.subline,
        label: copy.label,
        variant,
      })
      const key = `lectures/${user.id}/${id}/ai-previews/${Date.now()}-${index}-${Math.random()
        .toString(36)
        .slice(2)}.png`
      await uploadPreviewImage(key, image)
      candidates.push({
        id: `${index}-${variant.name}`,
        key,
        url: `${brand.cdnUrl.replace(/\/$/, "")}/${key}`,
        headline: copy.headline,
        label: copy.label,
        style: variant.name,
      })
    }

    return NextResponse.json({ candidates })
  } catch (error) {
    const message = error instanceof Error ? error.message : "preview_generation_failed"
    return NextResponse.json({ message }, { status: 500 })
  }
}

async function generateBackground(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-2",
      prompt,
      size: `${COURSE_PREVIEW_WIDTH}x${COURSE_PREVIEW_MODEL_HEIGHT}`,
      quality: "medium",
      output_format: "png",
      moderation: "auto",
    }),
    signal: AbortSignal.timeout(180_000),
  })

  const json = (await response.json().catch(() => null)) as OpenAIImageResponse | null
  if (!response.ok) {
    throw new Error(json?.error?.message || `OpenAI image generation failed: ${response.status}`)
  }

  const base64 = json?.data?.[0]?.b64_json
  if (!base64) throw new Error("OpenAI image generation returned no image")
  return Buffer.from(base64, "base64")
}

async function uploadPreviewImage(key: string, image: Buffer) {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      Body: image,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )
}
