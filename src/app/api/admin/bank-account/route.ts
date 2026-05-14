import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db, users } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const account = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: {
      settlementBankName: true,
      settlementAccountNumber: true,
      settlementAccountHolder: true,
    },
  })

  return NextResponse.json(account ?? {})
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const values = {
    settlementBankName: clean(body?.settlementBankName),
    settlementAccountNumber: clean(body?.settlementAccountNumber),
    settlementAccountHolder: clean(body?.settlementAccountHolder),
    updatedAt: new Date(),
  }

  const [updated] = await db
    .update(users)
    .set(values)
    .where(eq(users.id, user.id))
    .returning({
      settlementBankName: users.settlementBankName,
      settlementAccountNumber: users.settlementAccountNumber,
      settlementAccountHolder: users.settlementAccountHolder,
    })

  return NextResponse.json(updated)
}

function clean(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed.slice(0, 120) : null
}
