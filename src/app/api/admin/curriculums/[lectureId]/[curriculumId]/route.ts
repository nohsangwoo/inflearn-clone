import { NextRequest, NextResponse } from "next/server"
import { and, eq, inArray } from "drizzle-orm"
import { db, curriculumSections, curriculums, files, lectures, videos } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// DELETE: 커리큘럼 및 하위 섹션 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string; curriculumId: string }> }
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { curriculumId: p } = await params
  const curriculumId = Number(p)
  if (Number.isNaN(curriculumId)) {
    return NextResponse.json({ message: "invalid curriculumId" }, { status: 400 })
  }
  const owned = await db
    .select({ id: curriculums.id })
    .from(curriculums)
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(and(eq(curriculums.id, curriculumId), eq(lectures.instructorId, user.id)))
    .limit(1)
    .then((rows) => rows[0])
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })
  await db.transaction(async (tx) => {
    const sections = await tx
      .select({ id: curriculumSections.id })
      .from(curriculumSections)
      .where(eq(curriculumSections.curriculumId, curriculumId))
    const sectionIds = sections.map((section) => section.id)
    if (sectionIds.length) {
      await tx.delete(videos).where(inArray(videos.curriculumSectionId, sectionIds))
      await tx.delete(files).where(inArray(files.curriculumSectionId, sectionIds))
    }
    await tx.delete(curriculumSections).where(eq(curriculumSections.curriculumId, curriculumId))
    await tx.delete(curriculums).where(eq(curriculums.id, curriculumId))
  })

  return NextResponse.json({ ok: true })
}

