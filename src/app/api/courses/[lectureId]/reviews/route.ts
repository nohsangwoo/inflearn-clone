import { NextRequest, NextResponse } from "next/server"
import { and, asc, desc, eq, isNull } from "drizzle-orm"
import { db, lectures, reviews as reviewsTable, users } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { findMockCourse } from "@/lib/mock-courses"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  const lecture = await db.query.lectures.findFirst({ where: eq(lectures.id, id), columns: { id: true } }).catch(() => null)
  if (!lecture && findMockCourse(id)) return NextResponse.json([])
  if (!lecture) return NextResponse.json({ message: "lecture not found" }, { status: 404 })
  const reviewRows = await db
    .select({
      id: reviewsTable.id,
      content: reviewsTable.content,
      rating: reviewsTable.rating,
      createdAt: reviewsTable.createdAt,
      userId: reviewsTable.userId,
      user: { id: users.id, email: users.email, nickname: users.nickname },
    })
    .from(reviewsTable)
    .leftJoin(users, eq(reviewsTable.userId, users.id))
    .where(and(eq(reviewsTable.lectureId, id), eq(reviewsTable.isDeleted, false), isNull(reviewsTable.parentId)))
    .orderBy(desc(reviewsTable.id))
  const replyRows = reviewRows.length
    ? await db
        .select({
          id: reviewsTable.id,
          content: reviewsTable.content,
          rating: reviewsTable.rating,
          createdAt: reviewsTable.createdAt,
          userId: reviewsTable.userId,
          parentId: reviewsTable.parentId,
        })
        .from(reviewsTable)
        .where(and(eq(reviewsTable.lectureId, id), eq(reviewsTable.isDeleted, false)))
        .orderBy(asc(reviewsTable.id))
    : []
  return NextResponse.json(
    reviewRows.map((r) => ({
      id: r.id,
      content: r.content,
      rating: r.rating,
      createdAt: r.createdAt,
      user: r.user?.id ? r.user : undefined,
      replies: replyRows.filter((reply) => reply.parentId === r.id),
    })),
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  const lecture = await db.query.lectures.findFirst({ where: eq(lectures.id, id), columns: { id: true } }).catch(() => null)
  if (!lecture && findMockCourse(id)) return NextResponse.json({ message: "리뷰는 수강 승인 후 작성할 수 있습니다." }, { status: 400 })
  if (!lecture) return NextResponse.json({ message: "lecture not found" }, { status: 404 })
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const content: string | undefined = body?.content
  const rating: number = Number(body?.rating ?? 5)
  if (!content || typeof content !== "string") return NextResponse.json({ message: "content required" }, { status: 400 })
  await db.insert(reviewsTable).values({ content, rating, lectureId: id, userId: user.id })
  return NextResponse.json({ ok: true }, { status: 201 })
}
