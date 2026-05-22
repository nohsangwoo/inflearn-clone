import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, enrollmentRequests, lectures, paymentOrders, purchases } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { generateOrderId } from "@/lib/payments/toss"
import { calculatePlatformFeeAmount, getEffectiveLectureAmount, getPlatformFeeRateBps } from "@/lib/enrollments"

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const lectureId: number = Number(body?.lectureId)
  const force: boolean = Boolean(body?.force)
  if (!Number.isFinite(lectureId)) {
    return NextResponse.json({ message: "lectureId required" }, { status: 400 })
  }

  const lecture = await db.query.lectures.findFirst({
    where: eq(lectures.id, lectureId),
    columns: {
      id: true,
      title: true,
      price: true,
      discountPrice: true,
      isActive: true,
      isSeedData: true,
      instructorId: true,
      platformFeeRateBps: true,
    },
  })
  if (!lecture || !lecture.isActive) {
    return NextResponse.json({ message: "lecture not purchasable" }, { status: 400 })
  }

  const amount = getEffectiveLectureAmount(lecture)
  const platformFeeRateBps = getPlatformFeeRateBps(lecture)
  const platformFeeAmount = calculatePlatformFeeAmount(amount, platformFeeRateBps)
  const sellerReceivableAmount = Math.max(0, amount - platformFeeAmount)
  const orderName = lecture.title.slice(0, 100)

  // 이미 구매한 경우 차단 (테스트 강제 생성 허용 시 우회)
  const already = await db.query.purchases.findFirst({
    where: and(eq(purchases.userId, user.id), eq(purchases.lectureId, lecture.id)),
    columns: { id: true },
  })
  if (already && !force) {
    return NextResponse.json({ message: "already purchased" }, { status: 409 })
  }

  if (amount === 0) {
    await db.transaction(async (tx) => {
      const now = new Date()
      await tx
        .insert(enrollmentRequests)
        .values({
          userId: user.id,
          lectureId: lecture.id,
          sellerId: lecture.instructorId,
          status: "APPROVED",
          amount,
          platformFeeRateBps,
          platformFeeAmount,
          sellerReceivableAmount,
          approvedAt: now,
          approvedById: user.id,
          adminMemo: "free payment order auto approval",
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [enrollmentRequests.userId, enrollmentRequests.lectureId],
          set: {
            status: "APPROVED",
            amount,
            platformFeeRateBps,
            platformFeeAmount,
            sellerReceivableAmount,
            approvedAt: now,
            approvedById: user.id,
            adminMemo: "free payment order auto approval",
            updatedAt: now,
          },
        })
      await tx
        .insert(purchases)
        .values({ userId: user.id, lectureId: lecture.id, updatedAt: now })
        .onConflictDoNothing({ target: [purchases.userId, purchases.lectureId] })
    })
    return NextResponse.json({ free: true, lectureId: lecture.id, orderName, amount: 0, currency: "KRW" }, { status: 201 })
  }

  const orderId = generateOrderId()
  const [created] = await db
    .insert(paymentOrders)
    .values({
      orderId,
      orderName,
      amount,
      userId: user.id,
      lectureId: lecture.id,
      metadata: { force, platformFeeRateBps, platformFeeAmount, sellerReceivableAmount },
      updatedAt: new Date(),
    })
    .returning({
      orderId: paymentOrders.orderId,
      orderName: paymentOrders.orderName,
      amount: paymentOrders.amount,
      currency: paymentOrders.currency,
    })

  return NextResponse.json(created, { status: 201 })
}
