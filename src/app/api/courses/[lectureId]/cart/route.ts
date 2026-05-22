import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, carts, cartToLecture, lectures } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  const lecture = await db.query.lectures.findFirst({
    where: eq(lectures.id, id),
    columns: { id: true, isActive: true, isSeedData: true },
  }).catch(() => null)
  if (!lecture || !lecture.isActive) return NextResponse.json({ inCart: false })
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ inCart: false })
  const cart = await db.query.carts.findFirst({ where: eq(carts.userId, user.id), columns: { id: true } })
  const inCart = cart
    ? Boolean(
        await db.query.cartToLecture.findFirst({
          where: and(eq(cartToLecture.cartId, cart.id), eq(cartToLecture.lectureId, id)),
        }),
      )
    : false
  return NextResponse.json({ inCart })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) return NextResponse.json({ message: "invalid id" }, { status: 400 })
  const lecture = await db.query.lectures.findFirst({
    where: eq(lectures.id, id),
    columns: { id: true, isActive: true, isSeedData: true },
  }).catch(() => null)
  if (!lecture || !lecture.isActive) {
    return NextResponse.json({ message: "lecture not found" }, { status: 404 })
  }
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  // 장바구니 생성 또는 조회 (userId는 unique가 아니므로 upsert 불가)
  let cart = await db.query.carts.findFirst({ where: eq(carts.userId, user.id), columns: { id: true } })
  if (!cart) {
    const [created] = await db.insert(carts).values({ userId: user.id }).returning({ id: carts.id })
    cart = created
  }

  const existing = await db.query.cartToLecture.findFirst({
    where: and(eq(cartToLecture.cartId, cart.id), eq(cartToLecture.lectureId, id)),
  })
  const already = Boolean(existing)
  if (already) {
    // 토글 제거
    await db.delete(cartToLecture).where(and(eq(cartToLecture.cartId, cart.id), eq(cartToLecture.lectureId, id)))
    return NextResponse.json({ inCart: false })
  }

  await db.insert(cartToLecture).values({ cartId: cart.id, lectureId: id }).onConflictDoNothing()
  return NextResponse.json({ inCart: true })
}
