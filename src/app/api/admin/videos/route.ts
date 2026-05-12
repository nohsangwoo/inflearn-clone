import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, curriculumSections, curriculums, languageEnum, lectures, videos, type Language } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// POST: 비디오 레코드 생성 (클라이언트에서 presign 업로드 완료 후 키 전달)
// body: { curriculumSectionId: number, videoUrl: string, title?: string, description?: string, thumbnailUrl?: string, language?: string }
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const curriculumSectionId = Number(body?.curriculumSectionId)
  const videoUrl: string | undefined = body?.videoUrl // 업로드된 객체의 key 또는 절대 URL
  const language = normalizeLanguage(body?.language)

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

  const masterKey = `assets/curriculumsection/${curriculumSectionId}/master.m3u8`
  const [video] = await db
    .insert(videos)
    .values({
      curriculumSectionId,
      videoUrl,
      title: typeof body?.title === "string" ? body.title : "제목 없음",
      description: typeof body?.description === "string" ? body.description : null,
      thumbnailUrl: typeof body?.thumbnailUrl === "string" ? body.thumbnailUrl : null,
      language,
      masterKey,
      hlsStatus: "PENDING",
    })
    .returning()

  return NextResponse.json(video, { status: 201 })
}

function normalizeLanguage(value: unknown): Language {
  if (typeof value !== "string") return "KO"
  const upper = value.toUpperCase()
  return languageEnum.enumValues.includes(upper as Language) ? (upper as Language) : "KO"
}
