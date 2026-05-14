import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, likes } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { findMockCourse } from "@/lib/mock-courses"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  if (findMockCourse(id)) return NextResponse.json({ liked: false })
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ liked: false })
  const liked = await db.query.likes.findFirst({ where: and(eq(likes.lectureId, id), eq(likes.userId, user.id)) })
  return NextResponse.json({ liked: !!liked })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  if (findMockCourse(id)) return NextResponse.json({ liked: true })
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  const exists = await db.query.likes.findFirst({ where: and(eq(likes.lectureId, id), eq(likes.userId, user.id)) })
  if (exists) {
    await db.delete(likes).where(eq(likes.id, exists.id))
    return NextResponse.json({ liked: false })
  }
  const [created] = await db.insert(likes).values({ lectureId: id, userId: user.id }).returning({ id: likes.id })
  return NextResponse.json({ liked: !!created })
}
