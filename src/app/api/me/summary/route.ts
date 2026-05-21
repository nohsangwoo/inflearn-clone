import { and, count, desc, eq } from "drizzle-orm"
import { db, lectures, likes, purchases, pushNotifications, users } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const [purchasedRows, likeRows, notificationRows] = await Promise.all([
    db
      .select({
        id: purchases.id,
        progress: purchases.progress,
        updatedAt: purchases.updatedAt,
        lectureId: lectures.id,
        lectureTitle: lectures.title,
        lectureShortDescription: lectures.shortDescription,
        lectureImageUrl: lectures.imageUrl,
        instructorNickname: users.nickname,
        instructorEmail: users.email,
      })
      .from(purchases)
      .innerJoin(lectures, eq(purchases.lectureId, lectures.id))
      .leftJoin(users, eq(lectures.instructorId, users.id))
      .where(and(eq(purchases.userId, user.id), eq(lectures.isActive, true), eq(lectures.isSeedData, false)))
      .orderBy(desc(purchases.updatedAt))
      .limit(6),
    db
      .select({ value: count(likes.id) })
      .from(likes)
      .innerJoin(lectures, eq(likes.lectureId, lectures.id))
      .where(and(eq(likes.userId, user.id), eq(lectures.isActive, true), eq(lectures.isSeedData, false))),
    db
      .select({ value: count(pushNotifications.id) })
      .from(pushNotifications)
      .where(and(eq(pushNotifications.userId, user.id), eq(pushNotifications.isRead, false))),
  ])

  return NextResponse.json({
    courseCount: purchasedRows.length,
    averageProgress:
      purchasedRows.length > 0
        ? Math.round(purchasedRows.reduce((sum, purchase) => sum + purchase.progress, 0) / purchasedRows.length)
        : 0,
    likes: likeRows[0]?.value ?? 0,
    unreadNotifications: notificationRows[0]?.value ?? 0,
    purchases: purchasedRows.map((purchase) => ({
      id: purchase.id,
      progress: purchase.progress,
      updatedAt: purchase.updatedAt,
      lecture: {
        id: purchase.lectureId,
        title: purchase.lectureTitle,
        shortDescription: purchase.lectureShortDescription,
        imageUrl: purchase.lectureImageUrl,
        instructor: {
          nickname: purchase.instructorNickname,
          email: purchase.instructorEmail,
        },
      },
    })),
  })
}
