import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prismaClient'
import { createClient } from '@/lib/supabase/server'
import { getMessaging } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  const me = await prisma.user.findUnique({ where: { supabaseId: user.id }, select: { role: true, id: true } })
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ success: false }, { status: 403 })

  const { title, body: msgBody, data, platform, onlyActive = true, foreground = false } = await request.json()
  if (!title || !msgBody) return NextResponse.json({ success: false }, { status: 400 })

  const m = getMessaging(); if (!m) return NextResponse.json({ success: false }, { status: 500 })

  const where: any = {}
  if (onlyActive) where.isActive = true
  if (platform) where.platform = platform

  const tokens = await prisma.fcmToken.findMany({ where, orderBy: [{ lastUsedAt: 'desc' }, { updatedAt: 'desc' }], take: 5000 })
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
        await prisma.pushNotification.create({ data: { userId: null, fcmTokenId: null, title, body: msgBody, data: data || {}, type: 'broadcast', status: 'sent', messageId: res, sentAt: new Date() } })
      } catch (e: any) {
        failed++
        await prisma.pushNotification.create({ data: { userId: null, title, body: msgBody, data: data || {}, type: 'broadcast', status: 'failed', error: e?.message || 'unknown', attemptCount: 1 } })
      }
    }
  }

  return NextResponse.json({ success: true, sent, failed })
}


