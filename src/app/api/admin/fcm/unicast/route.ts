import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prismaClient'
import { createClient } from '@/lib/supabase/server'
import { getMessaging } from '@/lib/firebase-admin'

type UnicastBody = {
  userId?: number
  token?: string
  title: string
  body: string
  data?: Record<string, string>
  foreground?: boolean
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const LOG = '[FCM Unicast]'
  try {
    console.log(LOG, 'start')

    // 1) Auth check
    const supabase = await createClient();
    let user = null as { id: string } | null
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user as any
    } catch (e: any) {
      console.error(LOG, 'supabase.getUser failed', e?.message || e)
      return NextResponse.json({ success: false, error: 'auth_unavailable' }, { status: 500 })
    }
    if (!user) {
      console.warn(LOG, 'no user in session')
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
    }

    // 2) Admin check
    const me = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true, id: true } })
    if (!me || me.role !== 'ADMIN') {
      console.warn(LOG, 'forbidden user', { supabaseId: user.id, role: me?.role })
      return NextResponse.json({ success: false, error: 'forbidden' }, { status: 403 })
    }

    // 3) Parse body
    let payload: UnicastBody | null = null
    try {
      payload = await request.json()
    } catch (e: any) {
      console.error(LOG, 'invalid json body', e?.message || e)
      return NextResponse.json({ success: false, error: 'invalid_json' }, { status: 400 })
    }

    const { userId, token, title, body: msgBody, data, foreground = false } = payload || ({} as UnicastBody)
    if ((!userId && !token) || !title || !msgBody) {
      console.warn(LOG, 'missing fields', { hasUserId: !!userId, hasToken: !!token, hasTitle: !!title, hasBody: !!msgBody })
      return NextResponse.json({ success: false, error: 'missing_fields' }, { status: 400 })
    }

    // 4) Messaging client
    const m = getMessaging()
    if (!m) {
      console.error(LOG, 'firebase admin not initialized')
      return NextResponse.json({ success: false, error: 'firebase_admin_unavailable' }, { status: 500 })
    }

    // 5) Resolve token
    let target: string | null = token ?? null
    let targetUserId: number | null = null
    if (!target && userId) {
      const row = await prisma.fcmToken.findFirst({ where: { userId: Number(userId), isActive: true }, orderBy: [{ lastUsedAt: 'desc' }, { updatedAt: 'desc' }] })
      if (!row) {
        console.warn(LOG, 'no token for user', { userId })
        return NextResponse.json({ success: false, error: 'no_token' }, { status: 404 })
      }
      target = row.token
      targetUserId = row.userId ?? null
    }

    if (!target) {
      console.warn(LOG, 'resolved empty token')
      return NextResponse.json({ success: false, error: 'empty_token' }, { status: 400 })
    }

    // 6) Build message
    const message = {
      token: target,
      notification: { title, body: msgBody },
      data: { ...(data || {}), showForeground: foreground ? 'true' : 'false' },
      android: {
        priority: 'high',
        notification: {
          channelId: 'lingoost_notification_channel',
          priority: 'max',
          defaultSound: true,
          defaultVibrateTimings: true,
          icon: 'launcher_icon',
        },
      },
      apns: {
        payload: {
          aps: { alert: { title, body: msgBody }, sound: 'default', badge: 1 },
        },
      },
    } as const
    console.log(LOG, 'sending', { hasApnsTopic: false, foreground })

    // 7) Send and persist
    try {
      const res = await m.send(message)
      console.log(LOG, 'sent', { res })
      try {
        await prisma.pushNotification.create({ data: { userId: targetUserId ?? (userId ? Number(userId) : null), fcmTokenId: null, title, body: msgBody, data: data || {}, type: 'unicast', status: 'sent', messageId: res, sentAt: new Date() } })
      } catch (dbErr: any) {
        console.error(LOG, 'db log (sent) failed', dbErr?.message || dbErr)
      }
      return NextResponse.json({ success: true })
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string }
      console.error(LOG, 'send failed', { message: err?.message, code: err?.code })
      try {
        await prisma.pushNotification.create({ data: { userId: targetUserId ?? (userId ? Number(userId) : null), title, body: msgBody, data: data || {}, type: 'unicast', status: 'failed', error: err?.message || 'unknown', attemptCount: 1 } })
      } catch (dbErr: any) {
        console.error(LOG, 'db log (failed) failed', dbErr?.message || dbErr)
      }
      return NextResponse.json({ success: false, error: err?.message || 'send_failed' }, { status: 500 })
    }
  } catch (fatal: any) {
    console.error('[FCM Unicast] fatal', fatal?.message || fatal, fatal?.stack)
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 })
  }
}


