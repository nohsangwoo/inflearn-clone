import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, lectures, purchases } from "@/db"
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
    const lecture = await db.query.lectures.findFirst({
      where: eq(lectures.id, parsedLectureId),
      with: {
        curriculums: {
          with: {
            sections: {
              orderBy: (sections, { asc }) => [asc(sections.id)],
              with: {
                videos: {
                  with: {
                    dubTracks: {
                      where: (tracks, { eq }) => eq(tracks.status, "ready"),
                      columns: { lang: true, status: true, url: true },
                    },
                    captionTracks: {
                      orderBy: (tracks, { desc, asc }) => [desc(tracks.isDefault), asc(tracks.lang)],
                    },
                  },
                },
                files: true,
              },
            },
          },
        },
      },
    })

    if (!lecture) {
      console.log("[API] Lecture not found with ID:", lectureId)
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 })
    }
    if (lecture.isSeedData && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Lecture not found" }, { status: 404 })
    }
    console.log("[API] Found lecture:", lecture.title, "with", lecture.curriculums.length, "curriculums")

    // 3. 구매 여부 확인: 판매자 본인과 최고 관리자만 우회합니다.
    const purchase = await db.query.purchases.findFirst({
      where: and(eq(purchases.userId, user.id), eq(purchases.lectureId, parsedLectureId)),
    })

    if (!purchase) {
      if (lecture.instructorId !== user.id && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Purchase required" }, { status: 403 })
      }
    }

    // 4. 데이터 변환
    // 모든 커리큘럼의 모든 섹션을 하나의 배열로 합침
    const allSections = lecture.curriculums.flatMap(curriculum =>
      curriculum.sections.map(section => ({
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
        videos: section.videos.map(video => ({
          id: video.id,
          title: video.title,
          videoUrl: video.videoUrl,
          masterKey: video.masterKey,
          dubTracks: video.dubTracks,
          captions: video.captionTracks,
        })),
        files: section.files.map(file => ({
          id: file.id,
          filename: file.url.split('/').pop() || "File",
          url: file.url
        })),
        dubTracks: section.videos.flatMap(v => v.dubTracks)
      }))
    }

    return NextResponse.json(courseData)
  } catch (error) {
    console.error("[API] Error fetching lecture data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
