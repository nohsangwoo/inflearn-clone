import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prismaClient'
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

    const saved = await prisma.fcmToken.upsert({
      where: { token },
      create: {
        token,
        platform: platformValue,
        deviceId,
        userId: userId ?? undefined,
        isActive: true,
        lastUsedAt: new Date(),
      },
      update: {
        platform: platformValue,
        deviceId,
        userId: userId ?? undefined,
        isActive: true,
        lastUsedAt: new Date(),
      },
    })

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
    const existing = await prisma.fcmToken.findUnique({ where: { token } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'not found' }, { status: 404 })
    }
    const updated = await prisma.fcmToken.update({
      where: { token },
      data: { isActive: false, lastUsedAt: new Date() },
    })
    return NextResponse.json({ success: true, token: updated })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'server error' }, { status: 500 })
  }
}


