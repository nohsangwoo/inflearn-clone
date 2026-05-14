import { NextRequest, NextResponse } from "next/server"
import { and, desc, eq, inArray } from "drizzle-orm"
import { db, enrollmentRequests, lectures, purchases, type EnrollmentStatus } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

const mutableStatuses = ["APPROVED", "REJECTED", "CANCELED"] as const satisfies readonly EnrollmentStatus[]

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const ownedLectures = await db
    .select({ id: lectures.id })
    .from(lectures)
    .where(eq(lectures.instructorId, user.id))

  const lectureIds = ownedLectures.map((lecture) => lecture.id)
  const requests = lectureIds.length
    ? await db.query.enrollmentRequests.findMany({
        where: and(
          inArray(enrollmentRequests.lectureId, lectureIds),
          eq(enrollmentRequests.status, "AWAITING_PLATFORM_FEE"),
        ),
        orderBy: [desc(enrollmentRequests.createdAt)],
        limit: 20,
        with: {
          user: { columns: { email: true, nickname: true } },
          lecture: { columns: { id: true, title: true } },
        },
      })
    : []

  return NextResponse.json({ requests })
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const id = typeof body?.id === "string" ? body.id : ""
  const status = typeof body?.status === "string" && (mutableStatuses as readonly string[]).includes(body.status)
    ? (body.status as (typeof mutableStatuses)[number])
    : null
  const sellerMemo = typeof body?.sellerMemo === "string" ? body.sellerMemo.slice(0, 1000) : null

  if (!id || !status) {
    return NextResponse.json({ message: "id and valid status required" }, { status: 400 })
  }

  const request = await db.query.enrollmentRequests.findFirst({
    where: eq(enrollmentRequests.id, id),
    with: { lecture: { columns: { instructorId: true } } },
  })
  if (!request) return NextResponse.json({ message: "request not found" }, { status: 404 })
  if (request.lecture?.instructorId !== user.id) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 })
  }

  const updated = await db.transaction(async (tx) => {
    const now = new Date()
    const [row] = await tx
      .update(enrollmentRequests)
      .set({
        status,
        sellerMemo,
        approvedById: status === "APPROVED" ? user.id : null,
        approvedAt: status === "APPROVED" ? now : null,
        updatedAt: now,
      })
      .where(eq(enrollmentRequests.id, id))
      .returning()

    if (status === "APPROVED") {
      await tx
        .insert(purchases)
        .values({ userId: request.userId, lectureId: request.lectureId })
        .onConflictDoNothing({ target: [purchases.userId, purchases.lectureId] })
    }

    return row
  })

  return NextResponse.json({ request: updated })
}
