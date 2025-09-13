import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// POST: 참고자료 파일 레코드 생성 (클라이언트에서 presign 업로드 완료 후 키 전달)
// body: { curriculumSectionId: number, url: string }
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const curriculumSectionId = Number(body?.curriculumSectionId)
  const url: string | undefined = body?.url
  if (!Number.isFinite(curriculumSectionId)) {
    return NextResponse.json({ message: "curriculumSectionId required" }, { status: 400 })
  }
  if (!url || typeof url !== "string") {
    return NextResponse.json({ message: "url required" }, { status: 400 })
  }

  const can = await prisma.curriculumSection.findFirst({
    where: { id: curriculumSectionId, Curriculum: { Lecture: { instructorId: user.id } } },
    select: { id: true },
  })
  if (!can) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const file = await prisma.file.create({ data: { curriculumSectionId, url } })
  return NextResponse.json(file, { status: 201 })
}


