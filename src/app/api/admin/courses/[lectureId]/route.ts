import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// GET: 강의 상세 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const { lectureId } = await params
  const id = Number(lectureId)
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "invalid id" }, { status: 400 })
  }
  const lecture = await prisma.lecture.findFirst({
    where: { id, instructorId: user.id },
    select: { id: true, title: true, description: true, price: true, discountPrice: true, imageUrl: true, isActive: true },
  })
  if (!lecture) return NextResponse.json({ message: "not found" }, { status: 404 })
  return NextResponse.json(lecture)
}

// PATCH: 강의 정보 수정 (title/description/price/isActive)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { lectureId } = await params
  const id = Number(lectureId)
  if (Number.isNaN(id)) {
    return NextResponse.json({ message: "invalid id" }, { status: 400 })
  }
  const owned = await prisma.lecture.findFirst({ where: { id, instructorId: user.id }, select: { id: true } })
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { title, description, price, isActive, discountPrice, imageUrl } = body ?? {}
  const updated = await prisma.lecture.update({
    where: { id },
    data: {
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
      price: typeof price === "number" && !Number.isNaN(price) ? price : undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
      discountPrice:
        typeof discountPrice === "number" && !Number.isNaN(discountPrice)
          ? discountPrice
          : undefined,
      imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
    },
  })
  return NextResponse.json(updated)
}


