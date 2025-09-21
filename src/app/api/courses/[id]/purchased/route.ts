import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismaClient"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("params: ",id)
  const lectureId = Number(id)
  if (!Number.isFinite(lectureId)) return NextResponse.json({ purchased: false }, { status: 200 })

  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ purchased: false }, { status: 200 })

  const found = await prisma.purchase.findUnique({ where: { userId_lectureId: { userId: user.id, lectureId } } })
  return NextResponse.json({ purchased: Boolean(found) }, { status: 200 })
}


