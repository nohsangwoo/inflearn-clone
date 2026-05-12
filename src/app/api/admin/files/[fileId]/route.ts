import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, curriculumSections, curriculums, files, lectures } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// DELETE: 참고자료 파일 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { fileId } = await params
  const id = Number(fileId)
  if (Number.isNaN(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })

  const owned = await db
    .select({ id: files.id })
    .from(files)
    .innerJoin(curriculumSections, eq(files.curriculumSectionId, curriculumSections.id))
    .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(and(eq(files.id, id), eq(lectures.instructorId, user.id)))
    .limit(1)
    .then((rows) => rows[0])
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  await db.delete(files).where(eq(files.id, id))
  return NextResponse.json({ ok: true })
}

