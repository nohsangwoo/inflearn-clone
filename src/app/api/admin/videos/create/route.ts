import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, curriculumSections, curriculums, lectures, videos } from "@/db"
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
  const isFreePreview = typeof body?.isFreePreview === "boolean" ? body.isFreePreview : false

  if (!Number.isFinite(curriculumSectionId)) {
    return NextResponse.json({ message: "curriculumSectionId required" }, { status: 400 })
  }
  if (!videoUrl || typeof videoUrl !== "string") {
    return NextResponse.json({ message: "videoUrl required" }, { status: 400 })
  }

  // 소유권 확인: 섹션 → 커리큘럼 → 강의 → instructorId === user.id
  const can = await db
    .select({ id: curriculumSections.id })
    .from(curriculumSections)
    .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(and(eq(curriculumSections.id, curriculumSectionId), eq(lectures.instructorId, user.id)))
    .limit(1)
    .then((rows) => rows[0])
  if (!can) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  try {
    const masterKey = `assets/curriculumsection/${curriculumSectionId}/master.m3u8`

    // Video 레코드 생성
    const [video] = await db
      .insert(videos)
      .values({
        curriculumSectionId,
        videoUrl,
        title: title || "제목 없음",
        masterKey,
        hlsStatus: "PENDING",
        isFreePreview,
      })
      .returning()

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("Failed to create video:", error)
    return NextResponse.json({ message: "Failed to create video" }, { status: 500 })
  }
}
