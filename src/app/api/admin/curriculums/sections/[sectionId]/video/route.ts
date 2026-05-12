import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db, videos } from "@/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const { sectionId: sectionIdParam } = await params
    const sectionId = parseInt(sectionIdParam)

    if (!sectionId || isNaN(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 })
    }

    // Find video associated with this curriculum section
    const video = await db.query.videos.findFirst({
      where: eq(videos.curriculumSectionId, sectionId),
      with: {
        dubTracks: {
          orderBy: (tracks, { asc }) => [asc(tracks.lang)],
        },
      },
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json({ ...video, DubTrack: video.dubTracks })
  } catch (error) {
    console.error("[API] Error fetching video with dub tracks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
