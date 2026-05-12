import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, curriculumSections, curriculums, lectures } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// POST: 기존 커리큘럼에 섹션 추가
// body: { curriculumId, title?, description? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { lectureId } = await params
  const pLectureId = Number(lectureId)
  if (Number.isNaN(pLectureId)) {
    return NextResponse.json({ message: "invalid lectureId" }, { status: 400 })
  }
  const body = await req.json().catch(() => ({}))
  const curriculumId = Number(body?.curriculumId)
  if (Number.isNaN(curriculumId)) {
    return NextResponse.json({ message: "curriculumId required" }, { status: 400 })
  }
  const title: string = body?.title ?? "새 수업"
  const description: string | null = body?.description ?? null

  // 안전하게 해당 커리큘럼이 해당 강의의 것인지 확인
  const curriculum = await db
    .select({ id: curriculums.id })
    .from(curriculums)
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(and(eq(curriculums.id, curriculumId), eq(curriculums.lectureId, pLectureId), eq(lectures.instructorId, user.id)))
    .limit(1)
    .then((rows) => rows[0])
  if (!curriculum) {
    return NextResponse.json({ message: "curriculum not found" }, { status: 404 })
  }

  const [section] = await db.insert(curriculumSections).values({
      title,
      description,
      curriculumId,
    }).returning()
  return NextResponse.json(section, { status: 201 })
}

