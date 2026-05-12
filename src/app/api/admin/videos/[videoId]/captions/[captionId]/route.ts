import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, captionTracks, curriculumSections, curriculums, lectures, videos } from "@/db"

async function canEditCaption(userId: number, captionId: string) {
  return db
    .select({ id: captionTracks.id, videoId: captionTracks.videoId })
    .from(captionTracks)
    .innerJoin(videos, eq(captionTracks.videoId, videos.id))
    .innerJoin(curriculumSections, eq(videos.curriculumSectionId, curriculumSections.id))
    .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(and(eq(captionTracks.id, captionId), eq(lectures.instructorId, userId)))
    .limit(1)
    .then((rows) => rows[0])
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ captionId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { captionId } = await params
  const owned = await canEditCaption(user.id, captionId)
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const isDefault = typeof body?.isDefault === "boolean" ? body.isDefault : undefined

  const updated = await db.transaction(async (tx) => {
    if (isDefault) {
      await tx.update(captionTracks).set({ isDefault: false }).where(eq(captionTracks.videoId, owned.videoId))
    }

    const [caption] = await tx.update(captionTracks).set({
        lang: typeof body?.lang === "string" ? body.lang.trim().toLowerCase() : undefined,
        label: typeof body?.label === "string" ? body.label.trim() : undefined,
        url: typeof body?.url === "string" ? body.url.trim() : undefined,
        format: typeof body?.format === "string" && body.format.toLowerCase() === "srt" ? "srt" : undefined,
        isDefault,
      }).where(eq(captionTracks.id, captionId)).returning()
    return caption
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ captionId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { captionId } = await params
  const owned = await canEditCaption(user.id, captionId)
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  await db.delete(captionTracks).where(eq(captionTracks.id, captionId))
  return NextResponse.json({ ok: true })
}
