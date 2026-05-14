import { NextRequest, NextResponse } from 'next/server'
import { and, desc, eq } from 'drizzle-orm'
import { db, fcmTokens, pushNotifications } from '@/db'
import { getMessaging } from '@/lib/firebase-admin'
import { getAuthUserFromRequest } from '@/lib/auth/get-auth-user'

export async function POST(request: NextRequest) {
  const me = await getAuthUserFromRequest(request)
  if (!me) return NextResponse.json({ success: false }, { status: 401 })
  if (me.role !== 'ADMIN') return NextResponse.json({ success: false }, { status: 403 })

  const { title, body: msgBody, data, platform, onlyActive = true, foreground = false } = await request.json()
  if (!title || !msgBody) return NextResponse.json({ success: false }, { status: 400 })

  const m = getMessaging(); if (!m) return NextResponse.json({ success: false }, { status: 500 })

  const conditions = []
  if (onlyActive) conditions.push(eq(fcmTokens.isActive, true))
  if (platform) conditions.push(eq(fcmTokens.platform, platform))

  const tokens = await db
    .select()
    .from(fcmTokens)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(fcmTokens.lastUsedAt), desc(fcmTokens.updatedAt))
    .limit(5000)
  if (tokens.length === 0) return NextResponse.json({ success: false, message: 'no tokens' }, { status: 400 })

  // FCM은 sendEachForMulticast를 제공하나, 여기서는 개별 메시지 배열로 처리
  const BATCH_SIZE = 500
  const chunks: typeof tokens[] = []
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) chunks.push(tokens.slice(i, i + BATCH_SIZE))

  let sent = 0, failed = 0
  const apnsTopic = process.env.FIREBASE_APNS_TOPIC || process.env.NEXT_PUBLIC_IOS_BUNDLE_ID
  for (const batch of chunks) {
    const messages = batch.map((t) => ({
      token: t.token,
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
        headers: {
          ...(apnsTopic ? { 'apns-topic': apnsTopic } : {}),
          'apns-push-type': 'alert',
          'apns-priority': '10',
        },
        payload: { aps: { alert: { title, body: msgBody }, sound: 'default', badge: 1 } },
      },
    }))
    for (const message of messages) {
      try {
        const res = await m.send(message as any)
        sent++
        await db.insert(pushNotifications).values({ userId: null, fcmTokenId: null, title, body: msgBody, data: data || {}, type: 'broadcast', status: 'sent', messageId: res, sentAt: new Date() })
      } catch (e: any) {
        failed++
        await db.insert(pushNotifications).values({ userId: null, title, body: msgBody, data: data || {}, type: 'broadcast', status: 'failed', error: e?.message || 'unknown', attemptCount: 1 })
      }
    }
  }

  return NextResponse.json({ success: true, sent, failed })
}
