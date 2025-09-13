import prisma from "@/lib/prismaClient"
import { Language } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// PATCH: 비디오 레코드 수정 (제목/설명/썸네일/언어 등)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { videoId } = await params
  const id = Number(videoId)
  if (Number.isNaN(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  // owned 확인
  const owned = await prisma.video.findFirst({
    where: { id, CurriculumSection: { Curriculum: { Lecture: { instructorId: user.id } } } },
    select: { id: true },
  })
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { title, description, thumbnailUrl, language, videoUrl, duration } = body ?? {}
  const languageValue = typeof language === "string" && (Object.values(Language) as string[]).includes(language)
    ? (language as Language)
    : undefined

  const updated = await prisma.video.update({
    where: { id },
    data: {
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
      thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : undefined,
      language: languageValue,
      videoUrl: typeof videoUrl === "string" ? videoUrl : undefined,
      duration: typeof duration === "number" && !Number.isNaN(duration) ? duration : undefined,
    },
  })
  return NextResponse.json(updated)
}

// DELETE: 비디오 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { videoId } = await params
  const id = Number(videoId)
  if (Number.isNaN(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  const owned = await prisma.video.findFirst({
    where: { id, CurriculumSection: { Curriculum: { Lecture: { instructorId: user.id } } } },
    select: { id: true },
  })
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  await prisma.video.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}


