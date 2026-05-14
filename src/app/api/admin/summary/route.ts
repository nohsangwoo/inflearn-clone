import { and, count, desc, eq, inArray, isNull, ne, sum } from "drizzle-orm"
import { db, curriculums, curriculumSections, dubTracks, enrollmentRequests, lectures, paymentOrders, purchases, reviews, videos } from "@/db"
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
  const [hlsPendingRow, dubReadyRow, pendingEnrollmentRow, approvedEnrollmentRow] = lectureIds.length
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
        db
          .select({
            count: count(enrollmentRequests.id),
            platformFeeAmount: sum(enrollmentRequests.platformFeeAmount),
          })
          .from(enrollmentRequests)
          .where(
            and(
              inArray(enrollmentRequests.lectureId, lectureIds),
              eq(enrollmentRequests.status, "AWAITING_PLATFORM_FEE"),
            ),
          )
          .then((rows) => rows[0]),
        db
          .select({
            amount: sum(enrollmentRequests.amount),
            sellerReceivableAmount: sum(enrollmentRequests.sellerReceivableAmount),
          })
          .from(enrollmentRequests)
          .where(
            and(
              inArray(enrollmentRequests.lectureId, lectureIds),
              eq(enrollmentRequests.status, "APPROVED"),
              isNull(enrollmentRequests.paymentOrderId),
            ),
          )
          .then((rows) => rows[0]),
      ])
    : [{ value: 0 }, { value: 0 }, { count: 0, platformFeeAmount: 0 }, { amount: 0, sellerReceivableAmount: 0 }]

  const manualEnrollmentRevenue = Number(approvedEnrollmentRow?.amount ?? 0)
  const manualSellerReceivable = Number(approvedEnrollmentRow?.sellerReceivableAmount ?? 0)

  return NextResponse.json({
    grossRevenue: grossRevenue + manualEnrollmentRevenue,
    estimatedPayout: Math.max(0, grossRevenue + manualSellerReceivable),
    totalStudents,
    lectureCount: sellerLectures.length,
    activeLectureCount: sellerLectures.filter((lecture) => lecture.isActive).length,
    hlsPending: hlsPendingRow?.value ?? 0,
    dubReady: dubReadyRow?.value ?? 0,
    pendingEnrollmentCount: pendingEnrollmentRow?.count ?? 0,
    pendingPlatformFeeAmount: Number(pendingEnrollmentRow?.platformFeeAmount ?? 0),
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
