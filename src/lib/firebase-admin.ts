import * as admin from 'firebase-admin'
import fs from 'fs'

export function getFirebaseAdmin(): admin.app.App | null {
  try {
    if (admin.apps.length > 0) return admin.app()

    const jsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
    const svcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_PRIVATE_KEY

    let svc: admin.ServiceAccount | null = null
    if (jsonRaw) svc = JSON.parse(jsonRaw)
    else if (b64) svc = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'))
    else if (svcPath) {
      try {
        const raw = fs.readFileSync(svcPath, 'utf-8')
        svc = JSON.parse(raw) as admin.ServiceAccount
      } catch (e) {
        console.error('[FCM] Failed to read service account from path:', e)
        svc = null
      }
    }
    else if (projectId && clientEmail && privateKey) {
      privateKey = privateKey!.replace(/\\n/g, '\n')
      svc = { projectId, clientEmail, privateKey } as unknown as admin.ServiceAccount
    }
    if (!svc) { console.error('[FCM] Missing service account'); return null }

    return admin.initializeApp({ credential: admin.credential.cert(svc) })
  } catch (e) {
    console.error('[FCM] init error:', e)
    return admin.apps.length > 0 ? admin.app() : null
  }
}

export function getMessaging(): admin.messaging.Messaging | null {
  const app = getFirebaseAdmin(); if (!app) return null; return admin.messaging(app)
}


