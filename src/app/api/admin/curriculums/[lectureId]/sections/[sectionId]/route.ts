import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// PATCH: 섹션 수정(제목/설명/isActive 토글)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string; sectionId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { sectionId } = await params
  const psectionId = Number(sectionId)
  if (Number.isNaN(psectionId)) {
    return NextResponse.json({ message: "invalid sectionId" }, { status: 400 })
  }
  const can = await prisma.curriculumSection.findFirst({
    where: { id: psectionId, Curriculum: { Lecture: { instructorId: user.id } } },
    select: { id: true },
  })
  if (!can) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { title, description, isActive } = body ?? {}

  const updated = await prisma.curriculumSection.update({
    where: { id: psectionId },
    data: {
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
    },
  })
  return NextResponse.json(updated)
}

// DELETE: 섹션 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string; sectionId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { sectionId } = await params
  const psectionId = Number(sectionId)
  if (Number.isNaN(psectionId)) {
    return NextResponse.json({ message: "invalid sectionId" }, { status: 400 })
  }
  const can = await prisma.curriculumSection.findFirst({
    where: { id: psectionId, Curriculum: { Lecture: { instructorId: user.id } } },
    select: { id: true },
  })
  if (!can) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  await prisma.curriculumSection.delete({ where: { id: psectionId } })
  return NextResponse.json({ ok: true })
}


