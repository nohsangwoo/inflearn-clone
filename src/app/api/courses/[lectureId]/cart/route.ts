import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ inCart: false })
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  const cart = await prisma.cart.findFirst({ where: { userId: user.id }, include: { Lecture: { select: { id: true } } } })
  const inCart = !!cart?.Lecture.some((l) => l.id === id)
  return NextResponse.json({ inCart })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  // 장바구니 생성 또는 조회 (userId는 unique가 아니므로 upsert 불가)
  let cart = await prisma.cart.findFirst({ where: { userId: user.id }, select: { id: true } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id }, select: { id: true } })
  }

  const existing = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { Lecture: { select: { id: true } } },
  })

  const already = !!existing?.Lecture.some((l) => l.id === id)
  if (already) {
    // 토글 제거
    await prisma.cart.update({
      where: { id: cart.id },
      data: { Lecture: { disconnect: { id } } },
    })
    return NextResponse.json({ inCart: false })
  }

  await prisma.cart.update({ where: { id: cart.id }, data: { Lecture: { connect: { id } } } })
  return NextResponse.json({ inCart: true })
}


