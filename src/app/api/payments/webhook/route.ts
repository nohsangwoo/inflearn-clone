import { NextRequest, NextResponse } from "next/server"
import { eq, isNull } from "drizzle-orm"
import { db, paymentOrders, payments, webhookEventLogs, type PaymentStatus } from "@/db"
import { verifyTossWebhookSignature } from "@/lib/payments/toss"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get("Toss-Signature") || req.headers.get("x-toss-signature")
  const hasSecret = !!process.env.TOSS_WEBHOOK_SECRET
  const verified = hasSecret ? verifyTossWebhookSignature(raw, signature) : true
  const payload = safeJson(raw)

  // 로그 저장 (서명 실패도 기록)
  await db.insert(webhookEventLogs).values({
      eventType: typeof payload?.eventType === "string" ? payload.eventType : "unknown",
      signature,
      payload: payload ?? {},
      processed: false,
  })

  if (hasSecret && !verified) {
    return NextResponse.json({ message: "invalid signature" }, { status: 400 })
  }

  try {
    const eventType: string = payload?.eventType
    if (eventType === "PAYMENT_STATUS_CHANGED") {
      const paymentKey: string | undefined = payload?.data?.paymentKey
      const status: string | undefined = payload?.data?.status
      const orderId: string | undefined = payload?.data?.orderId

      if (paymentKey && orderId) {
        await db.transaction(async (tx) => {
          const mappedStatus = mapStatus(status)
          await tx.update(paymentOrders).set({ status: mappedStatus }).where(eq(paymentOrders.orderId, orderId))
          await tx
            .update(payments)
            .set({ status: mappedStatus, raw: (payload ?? null) as Record<string, unknown> | null })
            .where(eq(payments.paymentKey, paymentKey))
        })
      }
    }

    await db
      .update(webhookEventLogs)
      .set({ processed: true })
      .where(signature ? eq(webhookEventLogs.signature, signature) : isNull(webhookEventLogs.signature))
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ message: getErrorMessage(e) }, { status: 500 })
  }
}

function mapStatus(status?: string): PaymentStatus {
  switch (status) {
    case "DONE":
    case "SUCCESS":
    case "APPROVED":
      return "SUCCESS"
    case "CANCELED":
      return "CANCELED"
    case "FAILED":
    case "ABORTED":
      return "FAILED"
    default:
      return "PENDING"
  }
}

function safeJson(text: string) {
  try { return JSON.parse(text) } catch { return null }
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === "string") return m
  }
  return "webhook error"
}
