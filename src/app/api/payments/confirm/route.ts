import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db, paymentOrders, payments, purchases } from "@/db"
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

  const order = await db.query.paymentOrders.findFirst({ where: eq(paymentOrders.orderId, orderId) })
  if (!order) return NextResponse.json({ message: "order not found" }, { status: 404 })

  if (order.amount !== amount) {
    return NextResponse.json({ message: "amount mismatch" }, { status: 400 })
  }

  try {
    const confirmed = (await confirmTossPayment({ paymentKey, orderId, amount })) as TossConfirmResponse

    const paymentPayload = {
      orderId,
      paymentKey,
      status: "SUCCESS" as const,
      method: confirmed?.method ?? confirmed?.card?.company ?? confirmed?.paymentMethod ?? null,
      approvedAt: confirmed?.approvedAt ? new Date(confirmed.approvedAt) : null,
      totalAmount: confirmed?.totalAmount ?? amount,
      vat: confirmed?.vat ?? null,
      receiptUrl: confirmed?.receipt?.url ?? null,
      raw: (confirmed ?? null) as Record<string, unknown> | null,
    }

    await db.transaction(async (tx) => {
      await tx.update(paymentOrders).set({ status: "SUCCESS", paymentKey }).where(eq(paymentOrders.orderId, orderId))

      await tx
        .insert(payments)
        .values(paymentPayload)
        .onConflictDoUpdate({
          target: payments.orderId,
          set: paymentPayload,
        })

      // 구매 등록
      await tx
        .insert(purchases)
        .values({ userId: order.userId, lectureId: order.lectureId })
        .onConflictDoNothing({ target: [purchases.userId, purchases.lectureId] })
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
    await db.update(paymentOrders).set({ status: "FAILED", failReason: message }).where(eq(paymentOrders.orderId, orderId))
    return NextResponse.json({ message, code }, { status: 400 })
  }
}
