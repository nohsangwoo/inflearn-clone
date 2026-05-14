import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, curriculumSections, curriculums, languageEnum, lectures, videos, type Language } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

const languageValues = languageEnum.enumValues as readonly string[]

async function canEditVideo(userId: number, videoId: number) {
  return db
    .select({ id: videos.id })
    .from(videos)
    .innerJoin(curriculumSections, eq(videos.curriculumSectionId, curriculumSections.id))
    .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(and(eq(videos.id, videoId), eq(lectures.instructorId, userId)))
    .limit(1)
    .then((rows) => rows[0])
}

// PATCH: 비디오 레코드 수정 (제목/설명/썸네일/언어 등)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { videoId } = await params
  const id = Number(videoId)
  if (Number.isNaN(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  // owned 확인
  const owned = await canEditVideo(user.id, id)
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { title, description, thumbnailUrl, language, videoUrl, duration, isFreePreview } = body ?? {}
  const languageValue = typeof language === "string" && languageValues.includes(language)
    ? (language as Language)
    : undefined

  const [updated] = await db.update(videos).set({
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
      thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : undefined,
      language: languageValue,
      videoUrl: typeof videoUrl === "string" ? videoUrl : undefined,
      duration: typeof duration === "number" && !Number.isNaN(duration) ? duration : undefined,
      isFreePreview: typeof isFreePreview === "boolean" ? isFreePreview : undefined,
    }).where(eq(videos.id, id)).returning()
  return NextResponse.json(updated)
}

// DELETE: 비디오 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { videoId } = await params
  const id = Number(videoId)
  if (Number.isNaN(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  const owned = await canEditVideo(user.id, id)
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  await db.delete(videos).where(eq(videos.id, id))
  return NextResponse.json({ ok: true })
}
