import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  if (!user) return NextResponse.json({ liked: false })
  const liked = await prisma.like.findFirst({ where: { lectureId: id, userId: user.id } })
  return NextResponse.json({ liked: !!liked })
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
  const exists = await prisma.like.findFirst({ where: { lectureId: id, userId: user.id } })
  if (exists) {
    await prisma.like.delete({ where: { id: exists.id } })
    return NextResponse.json({ liked: false })
  }
  const created = await prisma.like.create({ data: { lectureId: id, userId: user.id } })
  return NextResponse.json({ liked: !!created })
}


