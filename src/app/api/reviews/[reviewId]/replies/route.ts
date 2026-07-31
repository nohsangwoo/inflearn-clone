import { NextRequest, NextResponse } from "next/server"
import { and, eq, isNull } from "drizzle-orm"
import { db, lectures, reviews, users } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

const MIN_REPLY_LENGTH = 2
const MAX_REPLY_LENGTH = 1_500

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 })
  }

  const { reviewId } = await params
  const id = Number(reviewId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "올바르지 않은 리뷰 ID입니다." }, { status: 400 })
  }

  const [parent] = await db
    .select({
      id: reviews.id,
      lectureId: reviews.lectureId,
      instructorId: lectures.instructorId,
    })
    .from(reviews)
    .innerJoin(lectures, eq(reviews.lectureId, lectures.id))
    .where(
      and(
        eq(reviews.id, id),
        eq(reviews.isDeleted, false),
        isNull(reviews.parentId),
        eq(lectures.isActive, true),
      ),
    )
    .limit(1)

  if (!parent || typeof parent.lectureId !== "number") {
    return NextResponse.json({ message: "답글을 작성할 리뷰를 찾을 수 없습니다." }, { status: 404 })
  }
  if (user.role !== "ADMIN" && parent.instructorId !== user.id) {
    return NextResponse.json(
      { message: "이 강의의 강사 또는 운영자만 답글을 작성할 수 있습니다." },
      { status: 403 },
    )
  }

  const body = await req.json().catch(() => null)
  const content = typeof body?.content === "string" ? body.content.trim() : ""
  if (content.length < MIN_REPLY_LENGTH || content.length > MAX_REPLY_LENGTH) {
    return NextResponse.json(
      { message: `답글은 ${MIN_REPLY_LENGTH}자 이상 ${MAX_REPLY_LENGTH.toLocaleString()}자 이하로 작성해 주세요.` },
      { status: 400 },
    )
  }

  const [created, author] = await Promise.all([
    db
      .insert(reviews)
      .values({
        content,
        rating: 0,
        lectureId: parent.lectureId,
        userId: user.id,
        parentId: parent.id,
      })
      .returning({
        id: reviews.id,
        content: reviews.content,
        createdAt: reviews.createdAt,
      })
      .then((rows) => rows[0]),
    db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { nickname: true, profileImageUrl: true },
    }),
  ])

  return NextResponse.json(
    {
      reply: created
        ? {
            ...created,
            createdAt: created.createdAt.toISOString(),
            author: {
              displayName:
                author?.nickname?.trim() ||
                (user.role === "ADMIN" ? "링구스트 운영자" : "강사"),
              profileImageUrl: author?.profileImageUrl ?? null,
              role: user.role,
            },
          }
        : null,
    },
    { status: 201 },
  )
}
