import prisma from "@/lib/prismaClient"
import { Language } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// POST: 비디오 레코드 생성 (클라이언트에서 presign 업로드 완료 후 키 전달)
// body: { curriculumSectionId: number, videoUrl: string, title?: string, description?: string, thumbnailUrl?: string, language?: string }
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const curriculumSectionId = Number(body?.curriculumSectionId)
  const videoUrl: string | undefined = body?.videoUrl
  const title: string | undefined = body?.title
  const description: string | undefined = body?.description
  const thumbnailUrl: string | undefined = body?.thumbnailUrl
  const language: string | undefined = body?.language // Prisma enum Language 문자열

  if (!Number.isFinite(curriculumSectionId)) {
    return NextResponse.json({ message: "curriculumSectionId required" }, { status: 400 })
  }
  if (!videoUrl || typeof videoUrl !== "string") {
    return NextResponse.json({ message: "videoUrl required" }, { status: 400 })
  }

  // 소유권 확인: 섹션 → 커리큘럼 → 강의 → instructorId === user.id
  const can = await prisma.curriculumSection.findFirst({
    where: { id: curriculumSectionId, Curriculum: { Lecture: { instructorId: user.id } } },
    select: { id: true },
  })
  if (!can) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const languageValue = typeof language === "string" && (Object.values(Language) as string[]).includes(language)
    ? (language as Language)
    : undefined

  const video = await prisma.video.create({
    data: {
      curriculumSectionId,
      videoUrl,
      title: title ?? undefined,
      description: description ?? undefined,
      thumbnailUrl: thumbnailUrl ?? undefined,
      // 언어는 유효한 enum 문자열일 때만 설정
      language: languageValue,
    },
  })
  return NextResponse.json(video, { status: 201 })
}


