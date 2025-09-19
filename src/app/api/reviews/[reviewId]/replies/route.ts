import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { reviewId } = await params
  const id = Number(reviewId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  const parent = await prisma.review.findUnique({ where: { id } })
  if (!parent) return NextResponse.json({ message: "not found" }, { status: 404 })
  const body = await req.json().catch(() => ({}))
  const content: string | undefined = body?.content
  if (!content || typeof content !== "string") return NextResponse.json({ message: "content required" }, { status: 400 })
  await prisma.review.create({ data: { content, rating: 0, lectureId: parent.lectureId, userId: user.id, parentId: parent.id } })
  return NextResponse.json({ ok: true }, { status: 201 })
}


