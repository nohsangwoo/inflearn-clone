import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, purchases } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lectureId = Number(searchParams.get("lectureId") || "")
  if (!Number.isFinite(lectureId)) return NextResponse.json({ purchased: false }, { status: 200 })

  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ purchased: false }, { status: 200 })

  const found = await db.query.purchases.findFirst({
    where: and(eq(purchases.userId, user.id), eq(purchases.lectureId, lectureId)),
    columns: { id: true },
  })
  return NextResponse.json({ purchased: Boolean(found) }, { status: 200 })
}

