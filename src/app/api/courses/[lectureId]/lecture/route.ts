import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  try {
    const { lectureId } = await params
    console.log("[API] Lecture GET request for ID:", lectureId)

    // 1. 인증 확인
    const user = await getAuthUserFromRequest(req)
    if (!user) {
      console.log("[API] User not authenticated")
      return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
    }
    console.log("[API] User authenticated:", user.email)

    const parsedLectureId = parseInt(lectureId)
    if (!lectureId || isNaN(parsedLectureId)) {
      console.log("[API] Invalid lecture ID:", parsedLectureId)
      return NextResponse.json({ error: "Invalid lecture ID" }, { status: 400 })
    }
    console.log("[API] Fetching lecture with ID:", lectureId)

    // 2. 강의 정보 조회
    const lecture = await prisma.lecture.findUnique({
      where: { id: parsedLectureId },
      include: {
        Curriculums: {
          include: {
            CurriculumSections: {
              orderBy: { id: "asc" },
              include: {
                Videos: {
                  include: {
                    DubTrack: {
                      where: { status: "ready" },
                      select: {
                        lang: true,
                        status: true,
                        url: true
                      }
                    }
                  }
                },
                Files: true
              }
            }
          }
        }
      }
    })

    if (!lecture) {
      console.log("[API] Lecture not found with ID:", lectureId)
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 })
    }
    console.log("[API] Found lecture:", lecture.title, "with", lecture.Curriculums.length, "curriculums")

    // 3. 구매 여부 확인 (임시로 주석 처리 - 나중에 결제 기능 구현 시 활성화)
    /*
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_lectureId: {
          userId: user.id,
          lectureId: lectureId
        }
      }
    })

    if (!purchase) {
      // 강사 본인인 경우는 접근 허용
      if (lecture.instructorId !== user.id) {
        return NextResponse.json({ error: "Purchase required" }, { status: 403 })
      }
    }
    */

    // 4. 데이터 변환
    // 모든 커리큘럼의 모든 섹션을 하나의 배열로 합침
    const allSections = lecture.Curriculums.flatMap(curriculum =>
      curriculum.CurriculumSections.map(section => ({
        ...section,
        curriculumId: curriculum.id
      }))
    )

    const courseData = {
      id: lecture.id,
      title: lecture.title,
      sections: allSections.map(section => ({
        id: section.id,
        title: section.title,
        description: section.description,
        active: section.isActive,
        videos: section.Videos.map(video => ({
          id: video.id,
          title: video.title,
          videoUrl: video.videoUrl,
          masterKey: video.masterKey,
          dubTracks: video.DubTrack
        })),
        files: section.Files.map(file => ({
          id: file.id,
          filename: file.url.split('/').pop() || "File",
          url: file.url
        })),
        dubTracks: section.Videos.flatMap(v => v.DubTrack)
      }))
    }

    return NextResponse.json(courseData)
  } catch (error) {
    console.error("[API] Error fetching lecture data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}