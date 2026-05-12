import { and, count, desc, eq, inArray, ne, sum } from "drizzle-orm"
import { db, curriculums, curriculumSections, dubTracks, lectures, paymentOrders, purchases, reviews, videos } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const sellerLectures = await db
    .select({
      id: lectures.id,
      title: lectures.title,
      isActive: lectures.isActive,
      createdAt: lectures.createdAt,
      purchaseCount: count(purchases.id),
      reviewCount: count(reviews.id),
    })
    .from(lectures)
    .leftJoin(purchases, eq(purchases.lectureId, lectures.id))
    .leftJoin(reviews, eq(reviews.lectureId, lectures.id))
    .where(eq(lectures.instructorId, user.id))
    .groupBy(lectures.id)
    .orderBy(desc(lectures.createdAt))

  const lectureIds = sellerLectures.map((lecture) => lecture.id)
  const orders = lectureIds.length
    ? await db
        .select({ amount: paymentOrders.amount, createdAt: paymentOrders.createdAt })
        .from(paymentOrders)
        .where(and(inArray(paymentOrders.lectureId, lectureIds), eq(paymentOrders.status, "SUCCESS")))
        .orderBy(desc(paymentOrders.createdAt))
        .limit(20)
    : []

  const grossRevenue = orders.reduce((sum, order) => sum + order.amount, 0)
  const totalStudents = sellerLectures.reduce((sum, lecture) => sum + lecture.purchaseCount, 0)
  const [hlsPendingRow, dubReadyRow] = lectureIds.length
    ? await Promise.all([
        db
          .select({ value: count(videos.id) })
          .from(videos)
          .innerJoin(curriculumSections, eq(videos.curriculumSectionId, curriculumSections.id))
          .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
          .where(and(inArray(curriculums.lectureId, lectureIds), ne(videos.hlsStatus, "READY")))
          .then((rows) => rows[0]),
        db
          .select({ value: count(dubTracks.id) })
          .from(dubTracks)
          .innerJoin(videos, eq(dubTracks.videoId, videos.id))
          .innerJoin(curriculumSections, eq(videos.curriculumSectionId, curriculumSections.id))
          .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
          .where(and(inArray(curriculums.lectureId, lectureIds), eq(dubTracks.status, "ready")))
          .then((rows) => rows[0]),
      ])
    : [{ value: 0 }, { value: 0 }]

  return NextResponse.json({
    grossRevenue,
    estimatedPayout: Math.max(0, Math.round(grossRevenue * 0.8)),
    totalStudents,
    lectureCount: sellerLectures.length,
    activeLectureCount: sellerLectures.filter((lecture) => lecture.isActive).length,
    hlsPending: hlsPendingRow?.value ?? 0,
    dubReady: dubReadyRow?.value ?? 0,
    recentOrders: orders,
    lectures: sellerLectures.slice(0, 5).map((lecture) => ({
      id: lecture.id,
      title: lecture.title,
      isActive: lecture.isActive,
      purchaseCount: lecture.purchaseCount,
      reviewCount: lecture.reviewCount,
    })),
  })
}
