import { useState, useEffect } from 'react'

export interface DeviceInfo {
  isWebView: boolean
  isIOS: boolean
  isIPad: boolean
  isAndroid: boolean
}

export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isWebView: false,
    isIOS: false,
    isIPad: false,
    isAndroid: false,
  })

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

      // LingoostApp WebView 감지
      const isLingoostWebView = /LingoostApp/i.test(userAgent) || !!(window as any).LingoostApp

      // MedikApp WebView 감지 - User Agent에 MedikApp이 포함되어 있는지 확인
      const isMedikAppWebView = /MedikApp/i.test(userAgent)

      // 기타 WebView 감지 (fallback)
      const isWebView =
        isLingoostWebView ||
        isMedikAppWebView ||
        /wv|WebView/i.test(userAgent) ||
        // Check for Flutter webview
        /Flutter/i.test(userAgent) ||
        // Check if running in native app context
        !!(window as any).flutter_inappwebview ||
        !!(window as any).ReactNativeWebView

      // iOS detection
      const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream

      // iPad detection (includes iPad Pro)
      const isIPad = /iPad/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      // Android detection
      const isAndroid = /Android/.test(userAgent)

      console.log('Device detection - User Agent:', userAgent)
      console.log('Device info:', {
        isWebView,
        isMedikAppWebView,
        isIOS,
        isIPad,
        isAndroid,
      })

      setDeviceInfo({
        isWebView,
        isIOS,
        isIPad,
        isAndroid,
      })

      // Send device info to Flutter app if in webview (safe check)
      if (isWebView) {
        // Delay the call to ensure WebView bridge is ready
        setTimeout(() => {
          try {
            const flutterWebView = (window as any).flutter_inappwebview
            if (flutterWebView && typeof flutterWebView.callHandler === 'function') {
              flutterWebView.callHandler('deviceInfo', {
                isWebView,
                isIOS,
                isIPad,
                isAndroid,
              })
            }
          } catch (e) {
            // Silently ignore - WebView bridge might not be available
            console.log('Flutter WebView bridge not available')
          }
        }, 100)
      }
    }

    detectDevice()
    
    // WebView에서 디바이스 정보 수신 대기
    const handleDeviceInfoReady = (event: CustomEvent) => {
      if (event.detail) {
        console.log('Received device info from WebView:', event.detail)
        setDeviceInfo(prev => ({
          ...prev,
          ...event.detail,
        }))
      }
    }
    
    window.addEventListener('deviceInfoReady', handleDeviceInfoReady as EventListener)
    
    return () => {
      window.removeEventListener('deviceInfoReady', handleDeviceInfoReady as EventListener)
    }
  }, [])

  return deviceInfo
}