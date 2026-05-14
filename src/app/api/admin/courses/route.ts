import { NextRequest, NextResponse } from "next/server"
import { countDistinct, desc, eq } from "drizzle-orm"
import { db, lectures, purchases, reviews } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { validateCoursePrice } from "@/lib/course-pricing"
import { slugifyCourseTitle } from "@/lib/course-utils"

// GET: 강의 목록 조회
export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const sellerLectures = await db
    .select({
      id: lectures.id,
      title: lectures.title,
      slug: lectures.slug,
      shortDescription: lectures.shortDescription,
      category: lectures.category,
      level: lectures.level,
      tags: lectures.tags,
      price: lectures.price,
      discountPrice: lectures.discountPrice,
      enrollmentOpen: lectures.enrollmentOpen,
      enrollmentStartAt: lectures.enrollmentStartAt,
      enrollmentEndAt: lectures.enrollmentEndAt,
      enrollmentCapacity: lectures.enrollmentCapacity,
      isActive: lectures.isActive,
      imageUrl: lectures.imageUrl,
      createdAt: lectures.createdAt,
      purchaseCount: countDistinct(purchases.id),
      reviewCount: countDistinct(reviews.id),
    })
    .from(lectures)
    .leftJoin(purchases, eq(purchases.lectureId, lectures.id))
    .leftJoin(reviews, eq(reviews.lectureId, lectures.id))
    .where(eq(lectures.instructorId, user.id))
    .groupBy(lectures.id)
    .orderBy(desc(lectures.id))
  return NextResponse.json(
    sellerLectures,
  )
}

// POST: 임시/초안 강의 생성 후 id 반환
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const title: string = body?.title ?? "새 강의"
  const price: number = Number(body?.price ?? 0)
  const priceError = validateCoursePrice(price)
  if (priceError) return NextResponse.json({ message: priceError }, { status: 400 })
  const slugBase = slugifyCourseTitle(title)
  const [created] = await db
    .insert(lectures)
    .values({
      title,
      price,
      slug: `${slugBase}-${Date.now().toString(36)}`,
      category: typeof body?.category === "string" ? body.category : "웹 개발",
      level: typeof body?.level === "string" ? body.level : "입문",
      isActive: false,
      instructorId: user.id,
    })
    .returning({ id: lectures.id })
  return NextResponse.json(created, { status: 201 })
}
