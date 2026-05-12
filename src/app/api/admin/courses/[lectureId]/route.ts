import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, lectures } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { parseListInput, slugifyCourseTitle } from "@/lib/course-utils"

// GET: 강의 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const { lectureId } = await params
  const id = Number(lectureId)
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "invalid id" }, { status: 400 })
  }
  const lecture = await db.query.lectures.findFirst({
    where: and(eq(lectures.id, id), eq(lectures.instructorId, user.id)),
  })
  if (!lecture) return NextResponse.json({ message: "not found" }, { status: 404 })
  return NextResponse.json(lecture)
}

// PATCH: 강의 정보 수정 (title/description/price/isActive)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { lectureId } = await params
  const id = Number(lectureId)
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "invalid id" }, { status: 400 })
  }
  const owned = await db.query.lectures.findFirst({
    where: and(eq(lectures.id, id), eq(lectures.instructorId, user.id)),
    columns: { id: true },
  })
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const {
    title,
    slug,
    shortDescription,
    description,
    category,
    level,
    languageCode,
    tags,
    seoKeywords,
    targetAudience,
    requirements,
    learningOutcomes,
    metaTitle,
    metaDescription,
    ogImageUrl,
    canonicalUrl,
    price,
    isActive,
    discountPrice,
    imageUrl,
  } = body ?? {}
  const parsedTags = parseListInput(tags)
  const parsedSeoKeywords = parseListInput(seoKeywords)
  const parsedOutcomes = parseListInput(learningOutcomes)
  const updateValues = {
      title: typeof title === "string" ? title : undefined,
      slug:
        typeof slug === "string"
          ? slugifyCourseTitle(slug)
          : typeof title === "string"
            ? `${slugifyCourseTitle(title)}-${id}`
            : undefined,
      shortDescription: typeof shortDescription === "string" ? shortDescription : undefined,
      description: typeof description === "string" ? description : undefined,
      category: typeof category === "string" ? category : undefined,
      level: typeof level === "string" ? level : undefined,
      languageCode: typeof languageCode === "string" ? languageCode : undefined,
      tags: parsedTags,
      seoKeywords: parsedSeoKeywords,
      targetAudience: typeof targetAudience === "string" ? targetAudience : undefined,
      requirements: typeof requirements === "string" ? requirements : undefined,
      learningOutcomes: parsedOutcomes,
      metaTitle: typeof metaTitle === "string" ? metaTitle : undefined,
      metaDescription: typeof metaDescription === "string" ? metaDescription : undefined,
      ogImageUrl: typeof ogImageUrl === "string" ? ogImageUrl : undefined,
      canonicalUrl: typeof canonicalUrl === "string" ? canonicalUrl : undefined,
      price: typeof price === "number" && !Number.isNaN(price) ? price : undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
      discountPrice:
        typeof discountPrice === "number" && !Number.isNaN(discountPrice)
          ? discountPrice
          : discountPrice === null
            ? null
            : undefined,
      imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
    }
  const [updated] = await db.update(lectures).set(updateValues).where(eq(lectures.id, id)).returning()
  return NextResponse.json(updated)
}
