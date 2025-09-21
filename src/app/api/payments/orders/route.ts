import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismaClient"
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

  const lecture = await prisma.lecture.findUnique({ where: { id: lectureId }, select: { id: true, title: true, price: true, discountPrice: true, isActive: true } })
  if (!lecture || !lecture.isActive) {
    return NextResponse.json({ message: "lecture not purchasable" }, { status: 400 })
  }

  const amount = typeof lecture.discountPrice === "number" && lecture.discountPrice < lecture.price ? lecture.discountPrice : lecture.price
  const orderName = lecture.title.slice(0, 100)

  // 이미 구매한 경우 차단 (테스트 강제 생성 허용 시 우회)
  const already = await prisma.purchase.findUnique({ where: { userId_lectureId: { userId: user.id, lectureId: lecture.id } } })
  if (already && !force) {
    return NextResponse.json({ message: "already purchased" }, { status: 409 })
  }

  const orderId = generateOrderId()
  const created = await prisma.paymentOrder.create({
    data: {
      orderId,
      orderName,
      amount,
      userId: user.id,
      lectureId: lecture.id,
      metadata: { force }
    },
    select: { orderId: true, orderName: true, amount: true, currency: true }
  })

  return NextResponse.json(created, { status: 201 })
}
