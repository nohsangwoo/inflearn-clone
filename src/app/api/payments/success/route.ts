import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db, enrollmentRequests, lectures, paymentOrders, payments, purchases } from "@/db"
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

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paymentKey = searchParams.get("paymentKey") || ""
  const orderId = searchParams.get("orderId") || ""
  const amountStr = searchParams.get("amount") || ""
  const amount = Number(amountStr)

  if (!paymentKey || !orderId || !Number.isFinite(amount)) {
    return NextResponse.json({ message: "invalid query" }, { status: 400 })
  }

  const order = await db.query.paymentOrders.findFirst({ where: eq(paymentOrders.orderId, orderId) })
  if (!order) return NextResponse.json({ message: "order not found" }, { status: 404 })
  if (order.amount !== amount) return NextResponse.json({ message: "amount mismatch" }, { status: 400 })
  const lecture = await db.query.lectures.findFirst({
    where: eq(lectures.id, order.lectureId),
    columns: { instructorId: true },
    with: {
      instructor: {
        columns: {
          settlementBankName: true,
          settlementAccountNumber: true,
          settlementAccountHolder: true,
        },
      },
    },
  })

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
      updatedAt: new Date(),
    }

    await db.transaction(async (tx) => {
      const now = new Date()
      await tx.update(paymentOrders).set({ status: "SUCCESS", paymentKey, updatedAt: now }).where(eq(paymentOrders.orderId, orderId))
      await tx
        .insert(payments)
        .values(paymentPayload)
        .onConflictDoUpdate({
          target: payments.orderId,
          set: paymentPayload,
        })
      const feeSnapshot = readFeeSnapshot(order.metadata, amount)
      await tx
        .insert(enrollmentRequests)
        .values({
          userId: order.userId,
          lectureId: order.lectureId,
          sellerId: lecture?.instructorId ?? null,
          status: "APPROVED",
          amount,
          platformFeeRateBps: feeSnapshot.platformFeeRateBps,
          platformFeeAmount: feeSnapshot.platformFeeAmount,
          sellerReceivableAmount: feeSnapshot.sellerReceivableAmount,
          sellerBankName: lecture?.instructor?.settlementBankName ?? null,
          sellerAccountNumber: lecture?.instructor?.settlementAccountNumber ?? null,
          sellerAccountHolder: lecture?.instructor?.settlementAccountHolder ?? null,
          paymentOrderId: order.orderId,
          approvedAt: now,
          approvedById: order.userId,
          adminMemo: "Toss payment auto approval",
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [enrollmentRequests.userId, enrollmentRequests.lectureId],
          set: {
            status: "APPROVED",
            amount,
            platformFeeRateBps: feeSnapshot.platformFeeRateBps,
            platformFeeAmount: feeSnapshot.platformFeeAmount,
            sellerReceivableAmount: feeSnapshot.sellerReceivableAmount,
            paymentOrderId: order.orderId,
            approvedAt: now,
            approvedById: order.userId,
            adminMemo: "Toss payment auto approval",
            updatedAt: now,
          },
        })
      await tx
        .insert(purchases)
        .values({ userId: order.userId, lectureId: order.lectureId, updatedAt: now })
        .onConflictDoNothing({ target: [purchases.userId, purchases.lectureId] })
    })

    return NextResponse.json({ ok: true, orderId })
  } catch (e: unknown) {
    let message = "confirm failed"
    let code: string | number | undefined
    if (e && typeof e === "object") {
      const maybeMessage = (e as { message?: unknown }).message
      if (typeof maybeMessage === "string") message = maybeMessage
      const maybeCode = (e as { code?: unknown }).code
      if (typeof maybeCode === "string" || typeof maybeCode === "number") code = maybeCode
    }
    await db.update(paymentOrders).set({ status: "FAILED", failReason: message, updatedAt: new Date() }).where(eq(paymentOrders.orderId, orderId))
    return NextResponse.json({ message, code }, { status: 400 })
  }
}

function readFeeSnapshot(metadata: Record<string, unknown> | null, amount: number) {
  const platformFeeRateBps = numberFromMetadata(metadata, "platformFeeRateBps")
  const platformFeeAmount = numberFromMetadata(metadata, "platformFeeAmount")
  const sellerReceivableAmount = numberFromMetadata(metadata, "sellerReceivableAmount")

  return {
    platformFeeRateBps,
    platformFeeAmount,
    sellerReceivableAmount: sellerReceivableAmount || Math.max(0, amount - platformFeeAmount),
  }
}

function numberFromMetadata(metadata: Record<string, unknown> | null, key: string) {
  const value = metadata?.[key]
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}
