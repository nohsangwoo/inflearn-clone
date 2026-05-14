import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, enrollmentRequests, purchases } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lectureId = Number(searchParams.get("lectureId") || "")
  if (!Number.isFinite(lectureId)) return NextResponse.json({ purchased: false, enrollmentRequest: null }, { status: 200 })

  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ purchased: false, enrollmentRequest: null }, { status: 200 })

  const [found, enrollmentRequest] = await Promise.all([
    db.query.purchases.findFirst({
      where: and(eq(purchases.userId, user.id), eq(purchases.lectureId, lectureId)),
      columns: { id: true },
    }),
    db.query.enrollmentRequests.findFirst({
      where: and(eq(enrollmentRequests.userId, user.id), eq(enrollmentRequests.lectureId, lectureId)),
      columns: {
        id: true,
        status: true,
        amount: true,
        platformFeeRateBps: true,
        platformFeeAmount: true,
        sellerReceivableAmount: true,
        sellerBankName: true,
        sellerAccountNumber: true,
        sellerAccountHolder: true,
        adminMemo: true,
        approvedAt: true,
        createdAt: true,
      },
    }),
  ])

  return NextResponse.json({ purchased: Boolean(found), enrollmentRequest: enrollmentRequest ?? null }, { status: 200 })
}
