import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, lectures, paymentOrders, purchases } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { generateOrderId } from "@/lib/payments/toss"

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
    columns: { id: true, title: true, price: true, discountPrice: true, isActive: true },
  })
  if (!lecture || !lecture.isActive) {
    return NextResponse.json({ message: "lecture not purchasable" }, { status: 400 })
  }

  const amount = typeof lecture.discountPrice === "number" && lecture.discountPrice < lecture.price ? lecture.discountPrice : lecture.price
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
    await db
      .insert(purchases)
      .values({ userId: user.id, lectureId: lecture.id })
      .onConflictDoNothing({ target: [purchases.userId, purchases.lectureId] })
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
      metadata: { force }
    })
    .returning({
      orderId: paymentOrders.orderId,
      orderName: paymentOrders.orderName,
      amount: paymentOrders.amount,
      currency: paymentOrders.currency,
    })

  return NextResponse.json(created, { status: 201 })
}
