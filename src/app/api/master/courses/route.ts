import { NextRequest, NextResponse } from "next/server"
import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm"
import { db, enrollmentRequests, lectures, likes, purchases, reviews, users } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const kind = searchParams.get("kind") ?? "all"
  const q = searchParams.get("q")?.trim()
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 30) || 30))

  const filters: SQL[] = []
  if (kind === "seed") filters.push(eq(lectures.isSeedData, true))
  if (kind === "real") filters.push(eq(lectures.isSeedData, false))
  if (q) {
    const queryFilter = or(
      ilike(lectures.title, `%${q}%`),
      ilike(lectures.category, `%${q}%`),
      ilike(users.email, `%${q}%`),
      ilike(users.nickname, `%${q}%`),
    )
    if (queryFilter) filters.push(queryFilter)
  }
  const where = filters.length ? and(...filters) : undefined

  const purchaseCount = sql<number>`(select count(*)::int from ${purchases} where ${purchases.lectureId} = ${lectures.id})`
  const reviewCount = sql<number>`(select count(*)::int from ${reviews} where ${reviews.lectureId} = ${lectures.id} and ${reviews.isDeleted} = false)`
  const likeCount = sql<number>`(select count(*)::int from ${likes} where ${likes.lectureId} = ${lectures.id})`
  const enrollmentRequestCount = sql<number>`(select count(*)::int from ${enrollmentRequests} where ${enrollmentRequests.lectureId} = ${lectures.id})`

  const [{ total }] = await db
    .select({ total: count() })
    .from(lectures)
    .leftJoin(users, eq(lectures.instructorId, users.id))
    .where(where)

  const items = await db
    .select({
      id: lectures.id,
      title: lectures.title,
      slug: lectures.slug,
      shortDescription: lectures.shortDescription,
      category: lectures.category,
      level: lectures.level,
      price: lectures.price,
      discountPrice: lectures.discountPrice,
      isActive: lectures.isActive,
      isSeedData: lectures.isSeedData,
      enrollmentOpen: lectures.enrollmentOpen,
      enrollmentStartAt: lectures.enrollmentStartAt,
      enrollmentEndAt: lectures.enrollmentEndAt,
      enrollmentCapacity: lectures.enrollmentCapacity,
      imageUrl: lectures.imageUrl,
      createdAt: lectures.createdAt,
      updatedAt: lectures.updatedAt,
      instructorEmail: users.email,
      instructorNickname: users.nickname,
      purchaseCount,
      reviewCount,
      likeCount,
      enrollmentRequestCount,
    })
    .from(lectures)
    .leftJoin(users, eq(lectures.instructorId, users.id))
    .where(where)
    .orderBy(desc(lectures.isSeedData), desc(lectures.createdAt), desc(lectures.id))
    .offset((page - 1) * pageSize)
    .limit(pageSize)

  return NextResponse.json({
    page,
    pageSize,
    total,
    items: items.map((item) => ({
      ...item,
      instructor: {
        email: item.instructorEmail,
        nickname: item.instructorNickname,
      },
      instructorEmail: undefined,
      instructorNickname: undefined,
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const id = Number(body?.id)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "id required" }, { status: 400 })

  const current = await db.query.lectures.findFirst({
    where: eq(lectures.id, id),
    columns: { id: true, isSeedData: true },
  })
  if (!current) return NextResponse.json({ message: "course not found" }, { status: 404 })
  if (current.isSeedData && body?.isActive === true) {
    return NextResponse.json({ message: "시드 강의는 공개할 수 없습니다. 최고관리자 강의 관리에서만 확인됩니다." }, { status: 400 })
  }

  const updateValues = {
    isActive: typeof body?.isActive === "boolean" ? body.isActive : undefined,
    enrollmentOpen: typeof body?.enrollmentOpen === "boolean" ? body.enrollmentOpen : undefined,
    updatedAt: new Date(),
  }
  const [updated] = await db
    .update(lectures)
    .set(updateValues)
    .where(eq(lectures.id, id))
    .returning({
      id: lectures.id,
      isActive: lectures.isActive,
      enrollmentOpen: lectures.enrollmentOpen,
      isSeedData: lectures.isSeedData,
      updatedAt: lectures.updatedAt,
    })

  return NextResponse.json({ course: updated })
}
