import prisma from '@/lib/prismaClient'
import { NextRequest, NextResponse } from 'next/server'
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
  const owner = await prisma.lecture.findFirst({ where: { id: plectureId, instructorId: user.id } })
  if (!owner) return NextResponse.json({ message: 'forbidden' }, { status: 403 })
  const data = await prisma.curriculum.findMany({
    where: { lectureId: plectureId },
    orderBy: { id: 'asc' },
    include: {
      CurriculumSections: {
        orderBy: { id: 'asc' },
      },
    },
  })
  return NextResponse.json(data)
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
  const owner = await prisma.lecture.findFirst({ where: { id: plectureId, instructorId: user.id } })
  if (!owner) return NextResponse.json({ message: 'forbidden' }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const title: string = body?.title ?? '새 섹션'
  const description: string | null = body?.description ?? null

  // 커리큘럼이 없으면 하나 만들고, 있으면 기존 커리큘럼 중 하나에 섹션을 추가할 수도 있지만
  // 본 API는 커리큘럼 자체를 추가하는 역할
  const created = await prisma.curriculum.create({
    data: {
      lectureId: plectureId,
      CurriculumSections: {
        create: [{ title, description: description ?? undefined }],
      },
    },
    include: { CurriculumSections: true },
  })
  return NextResponse.json(created, { status: 201 })
}
