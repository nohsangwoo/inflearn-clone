import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, enrollmentRequests, lectures, purchases, type EnrollmentStatus } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import {
  calculatePlatformFeeAmount,
  getEffectiveLectureAmount,
  getPlatformFeeRateBps,
} from "@/lib/enrollments"
import { findMockCourse } from "@/lib/mock-courses"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId: rawLectureId } = await params
  const lectureId = Number(rawLectureId)
  if (!Number.isFinite(lectureId)) {
    return NextResponse.json({ message: "lectureId required" }, { status: 400 })
  }
  if (findMockCourse(lectureId)) {
    return NextResponse.json({ message: "목업 강의는 실제 수강신청 대상이 아닙니다." }, { status: 400 })
  }

  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const studentMemo = typeof body?.studentMemo === "string" ? body.studentMemo.slice(0, 1000) : null

  const lecture = await db.query.lectures.findFirst({
    where: eq(lectures.id, lectureId),
    columns: {
      id: true,
      title: true,
      price: true,
      discountPrice: true,
      isActive: true,
      instructorId: true,
      platformFeeRateBps: true,
    },
    with: {
      instructor: {
        columns: {
          id: true,
          email: true,
          nickname: true,
          settlementBankName: true,
          settlementAccountNumber: true,
          settlementAccountHolder: true,
        },
      },
    },
  })

  if (!lecture || !lecture.isActive) {
    return NextResponse.json({ message: "lecture not available" }, { status: 400 })
  }
  if (lecture.instructorId === user.id) {
    return NextResponse.json({ message: "seller cannot enroll in own lecture" }, { status: 400 })
  }

  const alreadyPurchased = await db.query.purchases.findFirst({
    where: and(eq(purchases.userId, user.id), eq(purchases.lectureId, lecture.id)),
    columns: { id: true },
  })
  if (alreadyPurchased) {
    return NextResponse.json({ purchased: true, message: "already approved" }, { status: 200 })
  }

  const amount = getEffectiveLectureAmount(lecture)
  const platformFeeRateBps = getPlatformFeeRateBps(lecture)
  const platformFeeAmount = calculatePlatformFeeAmount(amount, platformFeeRateBps)
  const sellerReceivableAmount = Math.max(0, amount - platformFeeAmount)
  const shouldAutoApprove = platformFeeRateBps === 0
  const status: EnrollmentStatus = shouldAutoApprove ? "APPROVED" : "AWAITING_PLATFORM_FEE"
  const approvedAt = shouldAutoApprove ? new Date() : null

  const seller = lecture.instructor
  const requestValues = {
    userId: user.id,
    lectureId: lecture.id,
    sellerId: lecture.instructorId,
    status,
    amount,
    platformFeeRateBps,
    platformFeeAmount,
    sellerReceivableAmount,
    sellerBankName: seller?.settlementBankName ?? null,
    sellerAccountNumber: seller?.settlementAccountNumber ?? null,
    sellerAccountHolder: seller?.settlementAccountHolder ?? null,
    studentMemo,
    approvedAt,
    approvedById: shouldAutoApprove ? user.id : null,
    adminMemo: shouldAutoApprove ? "0% platform fee event auto approval" : null,
    updatedAt: new Date(),
  }

  const [request] = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(enrollmentRequests)
      .values(requestValues)
      .onConflictDoUpdate({
        target: [enrollmentRequests.userId, enrollmentRequests.lectureId],
        set: requestValues,
      })
      .returning()

    if (shouldAutoApprove) {
      await tx
        .insert(purchases)
        .values({ userId: user.id, lectureId: lecture.id })
        .onConflictDoNothing({ target: [purchases.userId, purchases.lectureId] })
    }

    return [created]
  })

  return NextResponse.json(
    {
      purchased: shouldAutoApprove,
      enrollmentRequest: request,
      message: shouldAutoApprove
        ? "0% 플랫폼 수수료 이벤트로 즉시 수강 승인되었습니다."
        : "수강 신청이 접수되었습니다. 판매자의 플랫폼 수수료 입금 확인 후 수강권한이 열립니다.",
    },
    { status: shouldAutoApprove ? 201 : 202 },
  )
}
