import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { NextRequest, NextResponse } from "next/server"
import { and, asc, desc, eq } from "drizzle-orm"
import { db, captionTracks, curriculumSections, curriculums, lectures, videos } from "@/db"

async function canEditVideo(userId: number, videoId: number) {
  return db
    .select({ id: videos.id })
    .from(videos)
    .innerJoin(curriculumSections, eq(videos.curriculumSectionId, curriculumSections.id))
    .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(and(eq(videos.id, videoId), eq(lectures.instructorId, userId)))
    .limit(1)
    .then((rows) => rows[0])
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { videoId } = await params
  const id = Number(videoId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid videoId" }, { status: 400 })

  const owned = await canEditVideo(user.id, id)
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const tracks = await db.select().from(captionTracks).where(eq(captionTracks.videoId, id)).orderBy(desc(captionTracks.isDefault), asc(captionTracks.lang))

  return NextResponse.json(tracks)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const { videoId } = await params
  const id = Number(videoId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid videoId" }, { status: 400 })

  const owned = await canEditVideo(user.id, id)
  if (!owned) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const lang = typeof body?.lang === "string" ? body.lang.trim().toLowerCase() : ""
  const label = typeof body?.label === "string" ? body.label.trim() : ""
  const url = typeof body?.url === "string" ? body.url.trim() : ""
  const format = typeof body?.format === "string" ? body.format.trim().toLowerCase() : "vtt"
  const isDefault = Boolean(body?.isDefault)

  if (!lang || !label || !url) {
    return NextResponse.json({ message: "lang, label, url required" }, { status: 400 })
  }

  const created = await db.transaction(async (tx) => {
    if (isDefault) {
      await tx.update(captionTracks).set({ isDefault: false }).where(eq(captionTracks.videoId, id))
    }

    const [caption] = await tx.insert(captionTracks).values({
        videoId: id,
        lang,
        label,
        url,
        format: format === "srt" ? "srt" : "vtt",
        isDefault,
      }).returning()
    return caption
  })

  return NextResponse.json(created, { status: 201 })
}
