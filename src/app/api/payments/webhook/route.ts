import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismaClient"
import { verifyTossWebhookSignature } from "@/lib/payments/toss"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const raw = await req.text()
  const signature = req.headers.get("Toss-Signature") || req.headers.get("x-toss-signature")
  const hasSecret = !!process.env.TOSS_WEBHOOK_SECRET
  const verified = hasSecret ? verifyTossWebhookSignature(raw, signature) : true
  const payload = safeJson(raw)

  // 로그 저장 (서명 실패도 기록)
  await prisma.webhookEventLog.create({
    data: {
      eventType: typeof payload?.eventType === "string" ? payload.eventType : "unknown",
      signature: signature ?? undefined,
      payload: payload ?? {},
      processed: false,
    }
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
        await prisma.$transaction(async (tx) => {
          await tx.paymentOrder.updateMany({ where: { orderId }, data: { status: mapStatus(status) } })
          await tx.payment.updateMany({ where: { paymentKey }, data: { status: mapStatus(status), raw: payload } })

          if (mapStatus(status) === "CANCELED") {
            const order = await tx.paymentOrder.findUnique({ where: { orderId } })
            if (order) {
              // 취소 시 필요한 후속 처리(수강권 회수 등) 정책에 맞게 구현
              // 여기서는 구매 기록 유지(테스트 환경)로 둡니다.
            }
          }
        })
      }
    }

    await prisma.webhookEventLog.updateMany({ where: { signature: signature ?? undefined }, data: { processed: true } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message ?? "webhook error" }, { status: 500 })
  }
}

function mapStatus(status?: string) {
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
