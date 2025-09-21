import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismaClient"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code") || ""
  const message = searchParams.get("message") || ""
  const orderId = searchParams.get("orderId") || ""

  if (orderId) {
    await prisma.paymentOrder.updateMany({ where: { orderId }, data: { status: "FAILED", failReason: `${code}:${message}`.slice(0, 200) } })
  }

  return NextResponse.json({ ok: false, code, message, orderId })
}
