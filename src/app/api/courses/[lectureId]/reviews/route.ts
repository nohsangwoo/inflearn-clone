import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm"
import { db, lectures, purchases, reviews as reviewsTable, users } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { FIREBASE_AUTH_COOKIE } from "@/lib/firebase/session"
import { findMockCourse } from "@/lib/mock-courses"
import { getDevelopmentMockReviews } from "@/lib/mock-course-reviews"
import { PUBLIC_COURSE_CATALOG_TAG } from "@/lib/course-catalog-data"
import { PUBLIC_COURSE_DETAIL_TAG } from "@/lib/course-detail-data"

const DEFAULT_PAGE_SIZE = 6
const MAX_PAGE_SIZE = 20
const MIN_REVIEW_LENGTH = 10
const MAX_REVIEW_LENGTH = 2_000

type ReviewSort = "latest" | "highest" | "lowest"

class ReviewRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function parseRating(value: string | null) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : Number.NaN
}

function parseSort(value: string | null): ReviewSort {
  if (value === "highest" || value === "lowest") return value
  return "latest"
}

function publicDisplayName(nickname?: string | null, fallback = "수강생") {
  const value = nickname?.trim()
  return value || fallback
}

function serializeDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value
}

function publicReviewsResponse(req: NextRequest, body: unknown) {
  const response = NextResponse.json(body)
  const hasViewerToken =
    req.headers.has("authorization") || req.cookies.has(FIREBASE_AUTH_COOKIE)
  response.headers.set(
    "Cache-Control",
    hasViewerToken
      ? "private, no-store"
      : "public, s-maxage=60, stale-while-revalidate=300",
  )
  return response
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "올바르지 않은 강의 ID입니다." }, { status: 400 })
  }

  const page = parsePositiveInteger(req.nextUrl.searchParams.get("page"), 1)
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    parsePositiveInteger(req.nextUrl.searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
  )
  const rating = parseRating(req.nextUrl.searchParams.get("rating"))
  if (Number.isNaN(rating)) {
    return NextResponse.json({ message: "평점 필터는 1점부터 5점까지 사용할 수 있습니다." }, { status: 400 })
  }
  const sort = parseSort(req.nextUrl.searchParams.get("sort"))
  const developmentCourse =
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_USE_LIVE_DATABASE !== "true"
      ? findMockCourse(id)
      : null
  if (developmentCourse) {
    return publicReviewsResponse(
      req,
      getDevelopmentMockReviews({
        course: developmentCourse,
        page,
        pageSize,
        rating,
        sort,
      }),
    )
  }

  const rootReviewWhere = and(
    eq(reviewsTable.lectureId, id),
    eq(reviewsTable.isDeleted, false),
    isNull(reviewsTable.parentId),
  )
  const filteredReviewWhere = rating
    ? and(rootReviewWhere, eq(reviewsTable.rating, rating))
    : rootReviewWhere
  const orderBy =
    sort === "highest"
      ? [desc(reviewsTable.rating), desc(reviewsTable.createdAt), desc(reviewsTable.id)]
      : sort === "lowest"
        ? [asc(reviewsTable.rating), desc(reviewsTable.createdAt), desc(reviewsTable.id)]
        : [desc(reviewsTable.createdAt), desc(reviewsTable.id)]

  const [lecture, summaryRow, reviewRows, authUser] = await Promise.all([
    db.query.lectures.findFirst({
      where: eq(lectures.id, id),
      columns: { id: true, isActive: true, isSeedData: true },
    }),
    db
      .select({
        total: sql<number>`count(*)::int`,
        average: sql<number>`coalesce(avg(${reviewsTable.rating}), 0)::float8`,
        five: sql<number>`count(*) filter (where ${reviewsTable.rating} = 5)::int`,
        four: sql<number>`count(*) filter (where ${reviewsTable.rating} = 4)::int`,
        three: sql<number>`count(*) filter (where ${reviewsTable.rating} = 3)::int`,
        two: sql<number>`count(*) filter (where ${reviewsTable.rating} = 2)::int`,
        one: sql<number>`count(*) filter (where ${reviewsTable.rating} = 1)::int`,
        verified: sql<number>`count(*) filter (
          where exists (
            select 1
            from ${purchases}
            where ${purchases.lectureId} = ${reviewsTable.lectureId}
              and ${purchases.userId} = ${reviewsTable.userId}
          )
        )::int`,
      })
      .from(reviewsTable)
      .where(rootReviewWhere)
      .then((rows) => rows[0]),
    db
      .select({
        id: reviewsTable.id,
        content: reviewsTable.content,
        rating: reviewsTable.rating,
        createdAt: reviewsTable.createdAt,
        userId: reviewsTable.userId,
        nickname: users.nickname,
        profileImageUrl: users.profileImageUrl,
        purchaseId: purchases.id,
        progress: purchases.progress,
      })
      .from(reviewsTable)
      .leftJoin(users, eq(reviewsTable.userId, users.id))
      .leftJoin(
        purchases,
        and(
          eq(purchases.lectureId, id),
          eq(purchases.userId, reviewsTable.userId),
        ),
      )
      .where(filteredReviewWhere)
      .orderBy(...orderBy)
      .offset((page - 1) * pageSize)
      .limit(pageSize),
    getAuthUserFromRequest(req).catch(() => null),
  ])

  if (!lecture?.isActive) {
    return NextResponse.json({ message: "강의를 찾을 수 없습니다." }, { status: 404 })
  }

  const distribution: Record<number, number> = {
    5: Number(summaryRow?.five ?? 0),
    4: Number(summaryRow?.four ?? 0),
    3: Number(summaryRow?.three ?? 0),
    2: Number(summaryRow?.two ?? 0),
    1: Number(summaryRow?.one ?? 0),
  }
  const total = Number(summaryRow?.total ?? 0)
  const filteredTotal = rating ? distribution[rating] : total
  const rootIds = reviewRows.map((review) => review.id)

  const replyRows = rootIds.length
    ? await db
        .select({
          id: reviewsTable.id,
          parentId: reviewsTable.parentId,
          content: reviewsTable.content,
          createdAt: reviewsTable.createdAt,
          nickname: users.nickname,
          role: users.role,
          profileImageUrl: users.profileImageUrl,
        })
        .from(reviewsTable)
        .leftJoin(users, eq(reviewsTable.userId, users.id))
        .where(
          and(
            eq(reviewsTable.lectureId, id),
            eq(reviewsTable.isDeleted, false),
            inArray(reviewsTable.parentId, rootIds),
          ),
        )
        .orderBy(asc(reviewsTable.createdAt), asc(reviewsTable.id))
    : []

  const repliesByParentId = new Map<
    number,
    Array<{
      id: number
      content: string
      createdAt: string
      author: { displayName: string; profileImageUrl: string | null; role: string | null }
    }>
  >()
  for (const reply of replyRows) {
    if (typeof reply.parentId !== "number") continue
    const replies = repliesByParentId.get(reply.parentId) ?? []
    replies.push({
      id: reply.id,
      content: reply.content,
      createdAt: serializeDate(reply.createdAt),
      author: {
        displayName: publicDisplayName(
          reply.nickname,
          reply.role === "ADMIN" ? "링구스트 운영자" : "강사",
        ),
        profileImageUrl: reply.profileImageUrl ?? null,
        role: reply.role ?? null,
      },
    })
    repliesByParentId.set(reply.parentId, replies)
  }

  let viewer:
    | {
        authenticated: boolean
        canReview: boolean
        hasPurchased: boolean
        existingReviewId: number | null
        reason: "LOGIN_REQUIRED" | "PURCHASE_REQUIRED" | "ALREADY_REVIEWED" | "SEED_COURSE" | null
      }
    | undefined

  if (!authUser) {
    viewer = {
      authenticated: false,
      canReview: false,
      hasPurchased: false,
      existingReviewId: null,
      reason: "LOGIN_REQUIRED",
    }
  } else {
    const [purchase, existingReview] = await Promise.all([
      db.query.purchases.findFirst({
        where: and(eq(purchases.userId, authUser.id), eq(purchases.lectureId, id)),
        columns: { id: true },
      }),
      db.query.reviews.findFirst({
        where: and(
          eq(reviewsTable.userId, authUser.id),
          eq(reviewsTable.lectureId, id),
          eq(reviewsTable.isDeleted, false),
          isNull(reviewsTable.parentId),
        ),
        columns: { id: true },
      }),
    ])
    const reason = lecture.isSeedData
      ? "SEED_COURSE"
      : existingReview
        ? "ALREADY_REVIEWED"
        : !purchase
          ? "PURCHASE_REQUIRED"
          : null
    viewer = {
      authenticated: true,
      canReview: reason === null,
      hasPurchased: Boolean(purchase),
      existingReviewId: existingReview?.id ?? null,
      reason,
    }
  }

  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize))

  return publicReviewsResponse(req, {
    isSeedData: lecture.isSeedData,
    summary: {
      total,
      average: Math.round(Number(summaryRow?.average ?? 0) * 100) / 100,
      distribution,
      verifiedCount: Number(summaryRow?.verified ?? 0),
    },
    items: reviewRows.map((review) => ({
      id: review.id,
      content: review.content,
      rating: review.rating,
      createdAt: serializeDate(review.createdAt),
      author: {
        displayName: publicDisplayName(review.nickname),
        profileImageUrl: review.profileImageUrl ?? null,
      },
      verifiedPurchase: Boolean(review.purchaseId),
      progressPercent:
        typeof review.progress === "number"
          ? Math.max(0, Math.min(100, Math.round(review.progress * 100)))
          : null,
      replies: repliesByParentId.get(review.id) ?? [],
    })),
    pageInfo: {
      page,
      pageSize,
      totalItems: filteredTotal,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
    viewer,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "올바르지 않은 강의 ID입니다." }, { status: 400 })
  }

  const lecture = await db.query.lectures.findFirst({
    where: eq(lectures.id, id),
    columns: { id: true, isActive: true, isSeedData: true },
  })
  if (!lecture?.isActive) {
    return NextResponse.json({ message: "강의를 찾을 수 없습니다." }, { status: 404 })
  }
  if (lecture.isSeedData) {
    return NextResponse.json(
      { message: "운영 예시 강의에는 리뷰를 작성할 수 없습니다." },
      { status: 403 },
    )
  }

  const user = await getAuthUserFromRequest(req)
  if (!user) {
    return NextResponse.json({ message: "로그인 후 리뷰를 작성할 수 있습니다." }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const content = typeof body?.content === "string" ? body.content.trim() : ""
  const rating = Number(body?.rating)

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "평점은 1점부터 5점까지 선택해 주세요." }, { status: 400 })
  }
  if (content.length < MIN_REVIEW_LENGTH || content.length > MAX_REVIEW_LENGTH) {
    return NextResponse.json(
      { message: `리뷰는 ${MIN_REVIEW_LENGTH}자 이상 ${MAX_REVIEW_LENGTH.toLocaleString()}자 이하로 작성해 주세요.` },
      { status: 400 },
    )
  }

  try {
    const created = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(${id}::int, ${user.id}::int)`)

      const [purchase] = await tx
        .select({ id: purchases.id })
        .from(purchases)
        .where(and(eq(purchases.userId, user.id), eq(purchases.lectureId, id)))
        .limit(1)
      if (!purchase) {
        throw new ReviewRequestError("수강이 확인된 회원만 리뷰를 작성할 수 있습니다.", 403)
      }

      const [existingReview] = await tx
        .select({ id: reviewsTable.id })
        .from(reviewsTable)
        .where(
          and(
            eq(reviewsTable.userId, user.id),
            eq(reviewsTable.lectureId, id),
            eq(reviewsTable.isDeleted, false),
            isNull(reviewsTable.parentId),
          ),
        )
        .limit(1)
      if (existingReview) {
        throw new ReviewRequestError("이 강의에는 이미 리뷰를 작성했습니다.", 409)
      }

      const [review] = await tx
        .insert(reviewsTable)
        .values({ content, rating, lectureId: id, userId: user.id })
        .returning({
          id: reviewsTable.id,
          content: reviewsTable.content,
          rating: reviewsTable.rating,
          createdAt: reviewsTable.createdAt,
        })
      return review
    })
    revalidateTag(PUBLIC_COURSE_CATALOG_TAG, "max")
    revalidateTag(PUBLIC_COURSE_DETAIL_TAG, "max")

    return NextResponse.json(
      {
        review: created
          ? { ...created, createdAt: serializeDate(created.createdAt) }
          : null,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof ReviewRequestError) {
      return NextResponse.json({ message: error.message }, { status: error.status })
    }
    throw error
  }
}
