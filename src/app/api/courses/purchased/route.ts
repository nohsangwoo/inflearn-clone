import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismaClient"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lectureId = Number(searchParams.get("lectureId") || "")
  if (!Number.isFinite(lectureId)) return NextResponse.json({ purchased: false }, { status: 200 })

  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ purchased: false }, { status: 200 })

  const found = await prisma.purchase.findUnique({ where: { userId_lectureId: { userId: user.id, lectureId } } })
  return NextResponse.json({ purchased: Boolean(found) }, { status: 200 })
}


