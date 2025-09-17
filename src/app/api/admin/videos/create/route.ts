import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// POST: 비디오 레코드 생성 (원본 업로드용)
// body: { curriculumSectionId: number, videoUrl: string, title?: string }
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const curriculumSectionId = Number(body?.curriculumSectionId)
  const videoUrl: string | undefined = body?.videoUrl // 업로드된 객체의 key
  const title: string | undefined = body?.title

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

  try {
    // 임시 masterKey 생성
    const videoId = Math.random().toString(36).substring(7)
    const masterKey = `assets/${videoId}/master.m3u8`

    // Video 레코드 생성
    const video = await prisma.video.create({
      data: {
        curriculumSectionId,
        videoUrl,
        title: title || "제목 없음",
        masterKey,
      },
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Failed to create video:", error)
    return NextResponse.json({ message: "Failed to create video" }, { status: 500 })
  }
}