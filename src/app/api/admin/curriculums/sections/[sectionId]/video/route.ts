import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { sectionId: string } }
) {
  try {
    const sectionId = parseInt(params.sectionId)

    if (!sectionId || isNaN(sectionId)) {
      return NextResponse.json({ error: "Invalid section ID" }, { status: 400 })
    }

    // Find video associated with this curriculum section
    const video = await prisma.video.findFirst({
      where: {
        curriculumSectionId: sectionId
      },
      include: {
        DubTrack: {
          orderBy: {
            lang: 'asc'
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("[API] Error fetching video with dub tracks:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}