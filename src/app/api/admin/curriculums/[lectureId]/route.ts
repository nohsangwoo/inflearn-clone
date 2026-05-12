import { NextRequest, NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db, curriculumSections, curriculums, lectures } from '@/db'
import { getAuthUserFromRequest } from '@/lib/auth/get-auth-user'

// GET: 특정 강의의 커리큘럼과 섹션 목록 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'unauthenticated' }, { status: 401 })
  const { lectureId } = await params
  const plectureId = Number(lectureId)
  if (Number.isNaN(plectureId)) {
    return NextResponse.json({ message: 'invalid lectureId' }, { status: 400 })
  }
  const owner = await db.query.lectures.findFirst({
    where: and(eq(lectures.id, plectureId), eq(lectures.instructorId, user.id)),
    columns: { id: true },
  })
  if (!owner) return NextResponse.json({ message: 'forbidden' }, { status: 403 })
  const data = await db.query.curriculums.findMany({
    where: eq(curriculums.lectureId, plectureId),
    orderBy: (rows, { asc }) => [asc(rows.id)],
    with: {
      sections: {
        orderBy: (rows, { asc }) => [asc(rows.id)],
        with: {
          videos: { with: { dubTracks: true, captionTracks: true } },
          files: true,
        },
      },
    },
  })
  return NextResponse.json(
    data.map((curriculum) => ({
      ...curriculum,
      CurriculumSections: curriculum.sections.map((section) => ({
        ...section,
        Videos: section.videos.map((video) => ({
          ...video,
          DubTrack: video.dubTracks,
          CaptionTracks: video.captionTracks,
        })),
        Files: section.files,
      })),
      sections: undefined,
    })),
  )
}

// POST: 커리큘럼 생성 (섹션 추가 버튼의 상위 개념)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: 'unauthenticated' }, { status: 401 })
  const { lectureId } = await params
  const plectureId = Number(lectureId)
  if (Number.isNaN(plectureId)) {
    return NextResponse.json({ message: 'invalid lectureId' }, { status: 400 })
  }
  const owner = await db.query.lectures.findFirst({
    where: and(eq(lectures.id, plectureId), eq(lectures.instructorId, user.id)),
    columns: { id: true },
  })
  if (!owner) return NextResponse.json({ message: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const title: string = body?.title ?? '새 섹션'
  const description: string | null = body?.description ?? null

  // 커리큘럼이 없으면 하나 만들고, 있으면 기존 커리큘럼 중 하나에 섹션을 추가할 수도 있지만
  // 본 API는 커리큘럼 자체를 추가하는 역할
  const created = await db.transaction(async (tx) => {
    const [curriculum] = await tx.insert(curriculums).values({ lectureId: plectureId }).returning()
    if (!curriculum) throw new Error('curriculum create failed')
    const [section] = await tx
      .insert(curriculumSections)
      .values({ curriculumId: curriculum.id, title, description })
      .returning()
    return { ...curriculum, CurriculumSections: section ? [section] : [] }
  })
  return NextResponse.json(created, { status: 201 })
}
