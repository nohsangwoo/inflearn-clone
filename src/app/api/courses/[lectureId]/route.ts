import { NextRequest, NextResponse } from "next/server"
import { getCourseDetail } from "@/lib/course-detail-data"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "invalid id" }, { status: 400 })
  }

  const detail = await getCourseDetail(id)
  if (!detail) return NextResponse.json({ message: "not found" }, { status: 404 })

  const response = NextResponse.json(detail)
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300",
  )
  return response
}
