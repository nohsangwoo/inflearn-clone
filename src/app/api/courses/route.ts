import { NextRequest, NextResponse } from "next/server"
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db, enrollmentRequests, lectures, likes, purchases, reviews, users } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { getEnrollmentAvailability } from "@/lib/enrollment-window"

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, Number(sp.get("page") || 1))
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") || 12)))
  const sort = (sp.get("sort") || "latest").toLowerCase()
  const q = sp.get("q")?.trim()
  const category = sp.get("category")?.toLowerCase() || undefined
  const authUser = await getAuthUserFromRequest(req).catch(() => null)

  const conditions = [eq(lectures.isActive, true)]
  if (q) {
    conditions.push(
      or(
        ilike(lectures.title, `%${q}%`),
        ilike(lectures.shortDescription, `%${q}%`),
        ilike(lectures.description, `%${q}%`),
        sql`${q} = ANY(${lectures.tags})`,
        sql`${q} = ANY(${lectures.seoKeywords})`,
      )!,
    )
  }
  if (category) {
    conditions.push(sql`lower(${lectures.category}) = ${category}`)
  }
  const where = and(...conditions)

  const purchaseCount = sql<number>`(select count(*)::int from ${purchases} where ${purchases.lectureId} = ${lectures.id})`
  const reviewCount = sql<number>`(select count(*)::int from ${reviews} where ${reviews.lectureId} = ${lectures.id} and ${reviews.isDeleted} = false)`
  const likeCount = sql<number>`(select count(*)::int from ${likes} where ${likes.lectureId} = ${lectures.id})`
  const liked = authUser
    ? sql<boolean>`exists(select 1 from ${likes} where ${likes.lectureId} = ${lectures.id} and ${likes.userId} = ${authUser.id})`
    : sql<boolean>`false`
  const enrollmentAppliedCount = sql<number>`(
    select count(*)::int
    from ${enrollmentRequests}
    where ${enrollmentRequests.lectureId} = ${lectures.id}
      and ${enrollmentRequests.status} in ('AWAITING_PLATFORM_FEE', 'APPROVED')
  )`
  const effectivePrice = sql<number>`coalesce(${lectures.discountPrice}, ${lectures.price})`
  const orderBy = (() => {
    if (sort === "best") return [desc(purchaseCount), desc(lectures.createdAt), desc(lectures.id)]
    if (sort === "priceasc") return [asc(effectivePrice), asc(lectures.price), desc(lectures.id)]
    if (sort === "pricedesc") return [desc(effectivePrice), desc(lectures.price), desc(lectures.id)]
    return [desc(lectures.createdAt), desc(lectures.id)]
  })()

  try {
    const [{ total }] = await db.select({ total: count() }).from(lectures).where(where)
    const items = await db
      .select({
        id: lectures.id,
        title: lectures.title,
        slug: lectures.slug,
        shortDescription: lectures.shortDescription,
        description: lectures.description,
        category: lectures.category,
        level: lectures.level,
        tags: lectures.tags,
        price: lectures.price,
        discountPrice: lectures.discountPrice,
        enrollmentOpen: lectures.enrollmentOpen,
        enrollmentStartAt: lectures.enrollmentStartAt,
        enrollmentEndAt: lectures.enrollmentEndAt,
        enrollmentCapacity: lectures.enrollmentCapacity,
        enrollmentAppliedCount,
        imageUrl: lectures.imageUrl,
        createdAt: lectures.createdAt,
        instructorNickname: users.nickname,
        instructorEmail: users.email,
        purchaseCount,
        reviewCount,
        likeCount,
        liked,
      })
      .from(lectures)
      .leftJoin(users, eq(lectures.instructorId, users.id))
      .where(where)
      .orderBy(...orderBy)
      .offset((page - 1) * pageSize)
      .limit(pageSize)

    return NextResponse.json({
      page,
      pageSize,
      total,
      items: items.map((item) => {
        const availability = getEnrollmentAvailability(item)
        return {
          ...item,
          enrollmentStatus: availability.status,
          enrollmentAvailable: availability.isAvailable,
          remainingSeats: availability.remainingSeats,
          instructor: { nickname: item.instructorNickname, email: item.instructorEmail },
          instructorNickname: undefined,
          instructorEmail: undefined,
        }
      }),
    })
  } catch {
    return NextResponse.json({
      page,
      pageSize,
      total: 0,
      items: [],
      degraded: true,
    })
  }
}
