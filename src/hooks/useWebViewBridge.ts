'use client'

import { useEffect } from 'react'

export function useWebViewBridge() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Flutter → Web 메시지 수신 핸들러 등록
    // 타입: handleFlutterMessage(type: string, data: any)
    // e.g., type == 'FCM_TOKEN_SAVE_REQUEST' => /api/fcm/token POST
    ;(window as any).handleFlutterMessage = (type: string, data: any) => {
      try {
        if (type === 'FCM_TOKEN_SAVE_REQUEST' && data?.token) {
          fetch('/api/fcm/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }).catch(console.error)
        }
      } catch (e) {
        console.error('[WebViewBridge] handleFlutterMessage error', e)
      }
    }

    return () => {
      try {
        if (typeof window !== 'undefined' && (window as any).handleFlutterMessage) {
          delete (window as any).handleFlutterMessage
        }
      } catch {}
    }
  }, [])
}


