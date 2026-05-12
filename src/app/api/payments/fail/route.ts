import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db, paymentOrders } from "@/db"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code") || ""
  const message = searchParams.get("message") || ""
  const orderId = searchParams.get("orderId") || ""

  if (orderId) {
    await db
      .update(paymentOrders)
      .set({ status: "FAILED", failReason: `${code}:${message}`.slice(0, 200) })
      .where(eq(paymentOrders.orderId, orderId))
  }

  return NextResponse.json({ ok: false, code, message, orderId })
}
