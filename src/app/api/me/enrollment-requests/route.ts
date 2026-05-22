import { desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { db, enrollmentRequests } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const requests = await db.query.enrollmentRequests.findMany({
    where: eq(enrollmentRequests.userId, user.id),
    orderBy: [desc(enrollmentRequests.createdAt)],
    limit: 100,
    with: {
      lecture: {
        columns: {
          id: true,
          title: true,
          shortDescription: true,
          imageUrl: true,
          isActive: true,
          isSeedData: true,
        },
        with: {
          instructor: {
            columns: {
              email: true,
              nickname: true,
              settlementBankName: true,
              settlementAccountNumber: true,
              settlementAccountHolder: true,
            },
          },
        },
      },
      seller: {
        columns: {
          email: true,
          nickname: true,
          settlementBankName: true,
          settlementAccountNumber: true,
          settlementAccountHolder: true,
        },
      },
      approvedBy: {
        columns: {
          email: true,
          nickname: true,
        },
      },
    },
  })

  return NextResponse.json({
    requests: requests.filter((request) => request.lecture?.isActive),
  })
}
