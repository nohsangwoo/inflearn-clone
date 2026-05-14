import { NextRequest, NextResponse } from "next/server"
import { and, count, eq, inArray } from "drizzle-orm"
import { db, enrollmentRequests, lectures, purchases, type EnrollmentStatus } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import {
  calculatePlatformFeeAmount,
  getEffectiveLectureAmount,
  getPlatformFeeRateBps,
} from "@/lib/enrollments"
import { findMockCourse } from "@/lib/mock-courses"
import { getEnrollmentAvailability, getEnrollmentStatusLabel } from "@/lib/enrollment-window"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId: rawLectureId } = await params
  const lectureId = Number(rawLectureId)
  if (!Number.isFinite(lectureId)) {
    return NextResponse.json({ message: "lectureId required" }, { status: 400 })
  }
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const mockCourse = findMockCourse(lectureId)
  if (mockCourse) {
    if (!mockCourse.enrollmentAvailable) {
      return NextResponse.json(
        { message: `${getEnrollmentStatusLabel(mockCourse.enrollmentStatus ?? "PAUSED")} 상태입니다. 다음 신청 시기에 다시 신청해주세요.` },
        { status: 409 },
      )
    }
    return NextResponse.json(
      {
        purchased: false,
        message: "수강 신청이 접수되었습니다. 안내된 계좌로 입금 후 판매자가 확인하면 수강권한이 열립니다.",
        enrollmentRequest: {
          id: `mock-${lectureId}`,
          status: "AWAITING_PLATFORM_FEE",
          amount: mockCourse.discountPrice ?? mockCourse.price,
          platformFeeRateBps: 0,
          platformFeeAmount: 0,
          sellerReceivableAmount: mockCourse.discountPrice ?? mockCourse.price,
          sellerBankName: "신한은행",
          sellerAccountNumber: "110-000-000000",
          sellerAccountHolder: mockCourse.instructor.nickname,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 202 },
    )
  }

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
      enrollmentOpen: true,
      enrollmentStartAt: true,
      enrollmentEndAt: true,
      enrollmentCapacity: true,
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

  const [enrollmentRow] = await db
    .select({ count: count(enrollmentRequests.id) })
    .from(enrollmentRequests)
    .where(and(
      eq(enrollmentRequests.lectureId, lecture.id),
      inArray(enrollmentRequests.status, ["AWAITING_PLATFORM_FEE", "APPROVED"]),
    ))
  const availability = getEnrollmentAvailability({
    enrollmentOpen: lecture.enrollmentOpen,
    enrollmentStartAt: lecture.enrollmentStartAt,
    enrollmentEndAt: lecture.enrollmentEndAt,
    enrollmentCapacity: lecture.enrollmentCapacity,
    enrollmentAppliedCount: Number(enrollmentRow?.count ?? 0),
  })
  if (!availability.isAvailable) {
    return NextResponse.json(
      { message: `${getEnrollmentStatusLabel(availability.status)} 상태입니다. 다음 신청 시기에 다시 신청해주세요.` },
      { status: 409 },
    )
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
  const status: EnrollmentStatus = "AWAITING_PLATFORM_FEE"

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
    approvedAt: null,
    approvedById: null,
    adminMemo: "bank transfer enrollment request",
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

    return [created]
  })

  return NextResponse.json(
    {
      purchased: false,
      enrollmentRequest: request,
      message: "수강 신청이 접수되었습니다. 안내된 계좌로 입금 후 판매자가 확인하면 수강권한이 열립니다.",
    },
    { status: 202 },
  )
}
