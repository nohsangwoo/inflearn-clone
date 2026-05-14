import { NextRequest, NextResponse } from "next/server"
import { and, desc, eq, sql } from "drizzle-orm"
import { db, enrollmentRequests, purchases, type EnrollmentStatus } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

const mutableStatuses = ["AWAITING_PLATFORM_FEE", "APPROVED", "REJECTED", "CANCELED"] as const satisfies readonly EnrollmentStatus[]
const readableStatuses = mutableStatuses

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const requestedStatus = searchParams.get("status")
  const status = requestedStatus && (readableStatuses as readonly string[]).includes(requestedStatus)
    ? (requestedStatus as EnrollmentStatus)
    : null
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 100) || 100))
  const includeSeed = searchParams.get("includeSeed") === "true"
  const filters = [
    status ? eq(enrollmentRequests.status, status) : undefined,
    includeSeed ? undefined : sql`${enrollmentRequests.id} not like 'seed-enrollment-%'`,
  ].filter(Boolean)

  const requests = await db.query.enrollmentRequests.findMany({
    where: filters.length > 0 ? and(...filters) : undefined,
    orderBy: [desc(enrollmentRequests.createdAt)],
    limit,
    with: {
      user: { columns: { email: true, nickname: true } },
      seller: { columns: { email: true, nickname: true } },
      lecture: { columns: { id: true, title: true } },
      approvedBy: { columns: { email: true, nickname: true } },
    },
  })

  return NextResponse.json({ requests })
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const id = typeof body?.id === "string" ? body.id : ""
  const status = typeof body?.status === "string" && (mutableStatuses as readonly string[]).includes(body.status)
    ? (body.status as (typeof mutableStatuses)[number])
    : null
  const adminMemo = typeof body?.adminMemo === "string" ? body.adminMemo.slice(0, 1000) : null

  if (!id || !status) {
    return NextResponse.json({ message: "id and valid status required" }, { status: 400 })
  }

  const request = await db.query.enrollmentRequests.findFirst({ where: eq(enrollmentRequests.id, id) })
  if (!request) return NextResponse.json({ message: "request not found" }, { status: 404 })

  const updated = await db.transaction(async (tx) => {
    const now = new Date()
    const [row] = await tx
      .update(enrollmentRequests)
      .set({
        status,
        adminMemo,
        approvedById: status === "APPROVED" ? user.id : null,
        approvedAt: status === "APPROVED" ? now : null,
        updatedAt: now,
      })
      .where(eq(enrollmentRequests.id, id))
      .returning()

    if (status === "APPROVED") {
      await tx
        .insert(purchases)
        .values({ userId: request.userId, lectureId: request.lectureId, updatedAt: now })
        .onConflictDoNothing({ target: [purchases.userId, purchases.lectureId] })
    } else {
      await tx
        .delete(purchases)
        .where(and(eq(purchases.userId, request.userId), eq(purchases.lectureId, request.lectureId)))
    }

    return row
  })

  return NextResponse.json({ request: updated })
}
