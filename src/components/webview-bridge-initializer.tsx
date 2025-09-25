'use client'
import { useWebViewBridge } from '@/hooks/useWebViewBridge'

export function WebViewBridgeInitializer() {
  useWebViewBridge()
  return null
}

export default WebViewBridgeInitializer


