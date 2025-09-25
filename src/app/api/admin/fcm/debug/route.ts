import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import { getFirebaseAdmin } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const app = getFirebaseAdmin()
    const projectId = app ? (app.options as any)?.projectId : null
    const apnsTopic = process.env.FIREBASE_APNS_TOPIC || process.env.NEXT_PUBLIC_IOS_BUNDLE_ID || null
    return NextResponse.json({ ok: true, projectId, apnsTopic })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'unknown' }, { status: 500 })
  }
}


