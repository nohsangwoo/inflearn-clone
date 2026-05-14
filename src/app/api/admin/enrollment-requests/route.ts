import { NextRequest, NextResponse } from "next/server"
import { and, desc, eq, inArray } from "drizzle-orm"
import { db, enrollmentRequests, lectures } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { getPlatformDepositAccount } from "@/lib/enrollments"

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

  return NextResponse.json({
    requests,
    platformDepositAccount: getPlatformDepositAccount(),
  })
}
