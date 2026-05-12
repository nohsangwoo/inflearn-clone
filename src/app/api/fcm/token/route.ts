import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, fcmTokens } from '@/db'
import { getAuthUserFromRequest } from '@/lib/auth/get-auth-user'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const token: string | undefined = body?.token
    const platform: string | undefined = body?.platform
    const deviceId: string | undefined = body?.deviceId
    let userId: number | null = typeof body?.userId === 'number' ? body.userId : null

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'token required' }, { status: 400 })
    }

    if (!userId) {
      const user = await getAuthUserFromRequest(req)
      if (user) userId = user.id
    }

    const normalized = (platform ?? '').toString().trim().toLowerCase()
    const platformValue = normalized === 'ios' || normalized === 'android' ? normalized : 'unknown'

    const values = {
        token,
        platform: platformValue,
        deviceId: deviceId ?? null,
        userId: userId ?? undefined,
        isActive: true,
        lastUsedAt: new Date(),
      }
    const [saved] = await db
      .insert(fcmTokens)
      .values(values)
      .onConflictDoUpdate({ target: fcmTokens.token, set: values })
      .returning()

    return NextResponse.json({ success: true, token: saved })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const token: string | undefined = body?.token
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false, message: 'token required' }, { status: 400 })
    }
    const existing = await db.query.fcmTokens.findFirst({ where: eq(fcmTokens.token, token) })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'not found' }, { status: 404 })
    }
    const [updated] = await db.update(fcmTokens).set({ isActive: false, lastUsedAt: new Date() }).where(eq(fcmTokens.token, token)).returning()
    return NextResponse.json({ success: true, token: updated })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'server error' }, { status: 500 })
  }
}

