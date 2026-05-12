import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { message: "direct purchase disabled; use /api/payments/orders and Toss confirm" },
    { status: 410 },
  )
}

