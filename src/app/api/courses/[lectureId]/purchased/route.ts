import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, enrollmentRequests, purchases } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { findMockCourse } from "@/lib/mock-courses"

export async function GET(req: NextRequest, { params }: { params: Promise<{ lectureId: string }> }) {
  const { lectureId: id } = await params
  const lectureId = Number(id)
  if (!Number.isFinite(lectureId)) return NextResponse.json({ purchased: false, enrollmentRequest: null }, { status: 200 })
  if (findMockCourse(lectureId)) return NextResponse.json({ purchased: false, enrollmentRequest: null }, { status: 200 })

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
