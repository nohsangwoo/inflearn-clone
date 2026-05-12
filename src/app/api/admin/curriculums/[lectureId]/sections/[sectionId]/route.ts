import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, curriculumSections, curriculums, lectures } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

async function canEditSection(userId: number, sectionId: number) {
  return db
    .select({ id: curriculumSections.id })
    .from(curriculumSections)
    .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(and(eq(curriculumSections.id, sectionId), eq(lectures.instructorId, userId)))
    .limit(1)
    .then((rows) => rows[0])
}

// PATCH: 섹션 수정(제목/설명/isActive 토글)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string; sectionId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { sectionId } = await params
  const psectionId = Number(sectionId)
  if (Number.isNaN(psectionId)) {
    return NextResponse.json({ message: "invalid sectionId" }, { status: 400 })
  }
  const can = await canEditSection(user.id, psectionId)
  if (!can) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  const body = await req.json().catch(() => ({}))
  const { title, description, isActive } = body ?? {}

  const [updated] = await db.update(curriculumSections).set({
      title: typeof title === "string" ? title : undefined,
      description: typeof description === "string" ? description : undefined,
      isActive: typeof isActive === "boolean" ? isActive : undefined,
    }).where(eq(curriculumSections.id, psectionId)).returning()
  return NextResponse.json(updated)
}

// DELETE: 섹션 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string; sectionId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { sectionId } = await params
  const psectionId = Number(sectionId)
  if (Number.isNaN(psectionId)) {
    return NextResponse.json({ message: "invalid sectionId" }, { status: 400 })
  }
  const can = await canEditSection(user.id, psectionId)
  if (!can) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  await db.delete(curriculumSections).where(eq(curriculumSections.id, psectionId))
  return NextResponse.json({ ok: true })
}

