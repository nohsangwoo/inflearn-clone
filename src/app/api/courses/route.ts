import { NextRequest, NextResponse } from "next/server"
import { and, asc, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db, lectures, purchases, reviews, users } from "@/db"

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, Number(sp.get("page") || 1))
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") || 12)))
  const sort = (sp.get("sort") || "latest").toLowerCase()
  const q = sp.get("q")?.trim()
  const category = sp.get("category")?.toLowerCase() || undefined

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

  const purchaseCount = sql<number>`count(distinct ${purchases.id})`
  const reviewCount = sql<number>`count(distinct ${reviews.id})`
  const effectivePrice = sql<number>`coalesce(${lectures.discountPrice}, ${lectures.price})`
  const orderBy = (() => {
    if (sort === "best") return [desc(purchaseCount), desc(lectures.createdAt)]
    if (sort === "priceasc") return [asc(effectivePrice), asc(lectures.price)]
    if (sort === "pricedesc") return [desc(effectivePrice), desc(lectures.price)]
    return [desc(lectures.createdAt)]
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
        imageUrl: lectures.imageUrl,
        createdAt: lectures.createdAt,
        instructorNickname: users.nickname,
        instructorEmail: users.email,
        purchaseCount,
        reviewCount,
      })
      .from(lectures)
      .leftJoin(users, eq(lectures.instructorId, users.id))
      .leftJoin(purchases, eq(purchases.lectureId, lectures.id))
      .leftJoin(reviews, eq(reviews.lectureId, lectures.id))
      .where(where)
      .groupBy(lectures.id, users.id)
      .orderBy(...orderBy)
      .offset((page - 1) * pageSize)
      .limit(pageSize)

    return NextResponse.json({
      page,
      pageSize,
      total,
      items: items.map((item) => ({
        ...item,
        instructor: { nickname: item.instructorNickname, email: item.instructorEmail },
        instructorNickname: undefined,
        instructorEmail: undefined,
      })),
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
