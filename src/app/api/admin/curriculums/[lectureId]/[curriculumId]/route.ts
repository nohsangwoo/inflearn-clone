import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// DELETE: 커리큘럼 및 하위 섹션 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string; curriculumId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { curriculumId: p } = await params
  const curriculumId = Number(p)
  if (Number.isNaN(curriculumId)) {
    return NextResponse.json({ message: "invalid curriculumId" }, { status: 400 })
  }
  const owned = await prisma.curriculum.findFirst({
    where: { id: curriculumId, Lecture: { instructorId: user.id } },
    select: { id: true },
  })
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  await prisma.$transaction([
    prisma.video.deleteMany({ where: { CurriculumSection: { is: { curriculumId } } } }),
    prisma.file.deleteMany({ where: { CurriculumSection: { is: { curriculumId } } } }),
    prisma.curriculumSection.deleteMany({ where: { curriculumId } }),
    prisma.curriculum.delete({ where: { id: curriculumId } }),
  ])

  return NextResponse.json({ ok: true })
}


