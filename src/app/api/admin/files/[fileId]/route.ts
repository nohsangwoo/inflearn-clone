import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// DELETE: 참고자료 파일 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { fileId } = await params
  const id = Number(fileId)
  if (Number.isNaN(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  const owned = await prisma.file.findFirst({
    where: { id, CurriculumSection: { Curriculum: { Lecture: { instructorId: user.id } } } },
    select: { id: true },
  })
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  await prisma.file.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}


