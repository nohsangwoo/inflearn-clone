import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismaClient"
import { confirmTossPayment } from "@/lib/payments/toss"

type TossConfirmResponse = {
  method?: string
  approvedAt?: string
  totalAmount?: number
  vat?: number
  receipt?: { url?: string }
  paymentMethod?: string
  card?: { company?: string }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const paymentKey: string = body?.paymentKey
  const orderId: string = body?.orderId
  const amount: number = Number(body?.amount)
  if (!paymentKey || !orderId || !Number.isFinite(amount)) {
    return NextResponse.json({ message: "invalid parameters" }, { status: 400 })
  }

  const order = await prisma.paymentOrder.findUnique({ where: { orderId } })
  if (!order) return NextResponse.json({ message: "order not found" }, { status: 404 })

  if (order.amount !== amount) {
    return NextResponse.json({ message: "amount mismatch" }, { status: 400 })
  }

  try {
    const confirmed = (await confirmTossPayment({ paymentKey, orderId, amount })) as TossConfirmResponse

    await prisma.$transaction(async (tx) => {
      await tx.paymentOrder.update({
        where: { orderId },
        data: { status: "SUCCESS", paymentKey }
      })

      await tx.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          paymentKey,
          status: "SUCCESS",
          method: confirmed?.method ?? confirmed?.card?.company ?? confirmed?.paymentMethod ?? null,
          approvedAt: confirmed?.approvedAt ? new Date(confirmed.approvedAt) : null,
          totalAmount: confirmed?.totalAmount ?? amount,
          vat: confirmed?.vat ?? null,
          receiptUrl: confirmed?.receipt?.url ?? null,
          raw: confirmed ?? null,
        },
        update: {
          status: "SUCCESS",
          method: confirmed?.method ?? confirmed?.card?.company ?? confirmed?.paymentMethod ?? null,
          approvedAt: confirmed?.approvedAt ? new Date(confirmed.approvedAt) : null,
          totalAmount: confirmed?.totalAmount ?? amount,
          vat: confirmed?.vat ?? null,
          receiptUrl: confirmed?.receipt?.url ?? null,
          raw: confirmed ?? null,
        }
      })

      // 구매 등록
      await tx.purchase.upsert({
        where: { userId_lectureId: { userId: order.userId, lectureId: order.lectureId } },
        create: { userId: order.userId, lectureId: order.lectureId },
        update: {},
      })
    })

    return NextResponse.json({ ok: true, orderId, lectureId: order.lectureId })
  } catch (e: unknown) {
    let message = "confirm failed"
    let code: string | number | undefined
    if (e && typeof e === "object") {
      const maybeMessage = (e as { message?: unknown }).message
      if (typeof maybeMessage === "string") message = maybeMessage
      const maybeCode = (e as { code?: unknown }).code
      if (typeof maybeCode === "string" || typeof maybeCode === "number") code = maybeCode
    }
    await prisma.paymentOrder.update({ where: { orderId }, data: { status: "FAILED", failReason: message } })
    return NextResponse.json({ message, code }, { status: 400 })
  }
}
