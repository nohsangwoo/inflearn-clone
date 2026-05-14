import { and, count, eq, isNull, ne, sum } from "drizzle-orm"
import { db, enrollmentRequests, lectures as lectureTable, paymentOrders, payouts, users as userTable, videos } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const [usersRow, lecturesRow, ordersRow, pendingPayoutsRow, hlsPendingRow, pendingEnrollmentRow, approvedEnrollmentRow] = await Promise.all([
    db.select({ value: count() }).from(userTable).then((rows) => rows[0]),
    db.select({ value: count() }).from(lectureTable).then((rows) => rows[0]),
    db
      .select({ amount: sum(paymentOrders.amount), total: count(paymentOrders.id) })
      .from(paymentOrders)
      .where(eq(paymentOrders.status, "SUCCESS"))
      .then((rows) => rows[0]),
    db
      .select({ amount: sum(payouts.payoutAmount), total: count(payouts.id) })
      .from(payouts)
      .where(eq(payouts.status, "PENDING"))
      .then((rows) => rows[0]),
    db.select({ value: count() }).from(videos).where(ne(videos.hlsStatus, "READY")).then((rows) => rows[0]),
    db
      .select({ count: count(enrollmentRequests.id), platformFeeAmount: sum(enrollmentRequests.amount) })
      .from(enrollmentRequests)
      .where(eq(enrollmentRequests.status, "AWAITING_PLATFORM_FEE"))
      .then((rows) => rows[0]),
    db
      .select({ amount: sum(enrollmentRequests.amount), total: count(enrollmentRequests.id) })
      .from(enrollmentRequests)
      .where(and(eq(enrollmentRequests.status, "APPROVED"), isNull(enrollmentRequests.paymentOrderId)))
      .then((rows) => rows[0]),
  ])

  const recentOrders = await db.query.paymentOrders.findMany({
    orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    limit: 8,
    columns: { orderId: true, orderName: true, amount: true, status: true, createdAt: true },
    with: {
      user: { columns: { email: true, nickname: true } },
      lecture: {
        columns: { id: true, title: true },
        with: { instructor: { columns: { email: true, nickname: true } } },
      },
    },
  })

  return NextResponse.json({
    users: usersRow?.value ?? 0,
    lectures: lecturesRow?.value ?? 0,
    successfulOrderCount: (ordersRow?.total ?? 0) + (approvedEnrollmentRow?.total ?? 0),
    grossRevenue: Number(ordersRow?.amount ?? 0) + Number(approvedEnrollmentRow?.amount ?? 0),
    pendingPayoutCount: pendingPayoutsRow?.total ?? 0,
    pendingPayoutAmount: Number(pendingPayoutsRow?.amount ?? 0),
    hlsPending: hlsPendingRow?.value ?? 0,
    pendingEnrollmentCount: pendingEnrollmentRow?.count ?? 0,
    pendingEnrollmentPlatformFeeAmount: Number(pendingEnrollmentRow?.platformFeeAmount ?? 0),
    recentOrders,
  })
}
