import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  // 간단 구매 로직 (결제 연동 전 임시 처리)
  try {
    await prisma.purchase.create({ data: { userId: user.id, lectureId: id } })
  } catch (e) {
    // unique 제약이면 이미 구매함
  }
  return NextResponse.json({ ok: true })
}


