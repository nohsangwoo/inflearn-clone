import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  const reviews = await prisma.review.findMany({
    where: { lectureId: id, isDeleted: false, parentId: null },
    orderBy: { id: "desc" },
    select: {
      id: true,
      content: true,
      rating: true,
      createdAt: true,
      userId: true,
      User: { select: { id: true, email: true, nickname: true } },
      replies: {
        where: { isDeleted: false },
        orderBy: { id: "asc" },
        select: { id: true, content: true, rating: true, createdAt: true, userId: true },
      },
    },
  })
  return NextResponse.json(
    reviews.map((r) => ({
      id: r.id,
      content: r.content,
      rating: r.rating,
      createdAt: r.createdAt,
      user: r.User ? { id: r.User.id, email: r.User.email, nickname: r.User.nickname } : undefined,
      replies: r.replies ?? [],
    })),
  )
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
  const body = await req.json().catch(() => ({}))
  const content: string | undefined = body?.content
  const rating: number = Number(body?.rating ?? 5)
  if (!content || typeof content !== "string") return NextResponse.json({ message: "content required" }, { status: 400 })
  await prisma.review.create({ data: { content, rating, lectureId: id, userId: user.id } })
  return NextResponse.json({ ok: true }, { status: 201 })
}


