import { desc, eq, isNotNull, sql } from "drizzle-orm"
import { db, enrollmentRequests, payouts, users, type PayoutStatus } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { NextRequest, NextResponse } from "next/server"

const payoutStatuses = ["PENDING", "APPROVED", "PAID", "HOLD", "CANCELED"] as const

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const [rows, sellerSummaries] = await Promise.all([
    db
      .select({
        id: payouts.id,
        sellerId: payouts.sellerId,
        status: payouts.status,
        grossAmount: payouts.grossAmount,
        platformFee: payouts.platformFee,
        payoutAmount: payouts.payoutAmount,
        periodStart: payouts.periodStart,
        periodEnd: payouts.periodEnd,
        memo: payouts.memo,
        paidAt: payouts.paidAt,
        createdAt: payouts.createdAt,
        updatedAt: payouts.updatedAt,
        seller: { id: users.id, email: users.email, nickname: users.nickname },
      })
      .from(payouts)
      .innerJoin(users, eq(payouts.sellerId, users.id))
      .orderBy(desc(payouts.createdAt))
      .limit(100),
    db
      .select({
        sellerId: enrollmentRequests.sellerId,
        seller: { id: users.id, email: users.email, nickname: users.nickname },
        approvedCount: sql<number>`count(${enrollmentRequests.id}) filter (where ${enrollmentRequests.status} = 'APPROVED')`,
        awaitingCount: sql<number>`count(${enrollmentRequests.id}) filter (where ${enrollmentRequests.status} = 'AWAITING_PLATFORM_FEE')`,
        grossApprovedAmount: sql<number>`coalesce(sum(${enrollmentRequests.amount}) filter (where ${enrollmentRequests.status} = 'APPROVED'), 0)`,
        platformFeeAmount: sql<number>`coalesce(sum(${enrollmentRequests.platformFeeAmount}) filter (where ${enrollmentRequests.status} = 'APPROVED'), 0)`,
        sellerReceivableAmount: sql<number>`coalesce(sum(${enrollmentRequests.sellerReceivableAmount}) filter (where ${enrollmentRequests.status} = 'APPROVED'), 0)`,
        pendingGrossAmount: sql<number>`coalesce(sum(${enrollmentRequests.amount}) filter (where ${enrollmentRequests.status} = 'AWAITING_PLATFORM_FEE'), 0)`,
      })
      .from(enrollmentRequests)
      .innerJoin(users, eq(enrollmentRequests.sellerId, users.id))
      .where(isNotNull(enrollmentRequests.sellerId))
      .groupBy(enrollmentRequests.sellerId, users.id, users.email, users.nickname)
      .orderBy(sql`coalesce(sum(${enrollmentRequests.sellerReceivableAmount}) filter (where ${enrollmentRequests.status} = 'APPROVED'), 0) desc`)
      .limit(100),
  ])

  return NextResponse.json({ payouts: rows, sellerSummaries })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const sellerId = Number(body?.sellerId)
  const grossAmount = Number(body?.grossAmount)
  const platformFee = Number(body?.platformFee ?? 0)
  const payoutAmount = Number(body?.payoutAmount ?? grossAmount - platformFee)
  if (!Number.isFinite(sellerId) || !Number.isFinite(grossAmount) || !Number.isFinite(payoutAmount)) {
    return NextResponse.json({ message: "sellerId, grossAmount, payoutAmount required" }, { status: 400 })
  }

  const [created] = await db
    .insert(payouts)
    .values({
      sellerId,
      grossAmount,
      platformFee,
      payoutAmount,
      memo: typeof body?.memo === "string" ? body.memo : null,
      periodStart: body?.periodStart ? new Date(body.periodStart) : null,
      periodEnd: body?.periodEnd ? new Date(body.periodEnd) : null,
    })
    .returning()

  return NextResponse.json(created, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const id = typeof body?.id === "string" ? body.id : ""
  const status = typeof body?.status === "string" && (payoutStatuses as readonly string[]).includes(body.status)
    ? (body.status as PayoutStatus)
    : undefined
  if (!id || !status) return NextResponse.json({ message: "id and status required" }, { status: 400 })

  const [updated] = await db
    .update(payouts)
    .set({
      status,
      paidAt: status === "PAID" ? new Date() : null,
      memo: typeof body?.memo === "string" ? body.memo : undefined,
    })
    .where(eq(payouts.id, id))
    .returning()

  return NextResponse.json(updated)
}
