import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// GET: 강의 목록 조회
export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const lectures = await prisma.lecture.findMany({
    where: { instructorId: user.id },
    orderBy: { id: "desc" },
    select: { id: true, title: true, price: true, isActive: true, imageUrl: true },
  })
  return NextResponse.json(lectures)
}

// POST: 임시/초안 강의 생성 후 id 반환
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const title: string = body?.title ?? "새 강의"
  const price: number = Number(body?.price ?? 0)
  const created = await prisma.lecture.create({
    data: {
      title,
      price,
      isActive: true,
      instructorId: user.id,
    },
    select: { id: true },
  })
  return NextResponse.json(created, { status: 201 })
}


