"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

// Extend Window interface for WebView properties
declare global {
  interface Window {
    webkit?: {
      messageHandlers?: unknown
    }
    ReactNativeWebView?: unknown
  }
}

type Props = {
  sectionId: number
  className?: string
  onTracksLoaded?: (tracks: Track[]) => void
}

type Track = { lang: string; name: string; index: number }

export default function WebViewHlsPlayer({ sectionId, className, onTracksLoaded }: Props) {
  const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  const masterUrl = `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${sectionId}/master.m3u8`
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)
    setError(null)

    // Check platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    const isWebView = /WebView|wv/.test(navigator.userAgent) ||
                     (window.webkit && window.webkit.messageHandlers) ||
                     !!window.ReactNativeWebView

    console.log('[WebViewHLS] Platform detection:', {
      isIOS,
      isAndroid,
      isWebView,
      userAgent: navigator.userAgent
    })

    // For iOS and WebView, always use native HLS
    if (isIOS || isWebView) {
      console.log('[WebViewHLS] Using native HLS playback')

      // Set video attributes for better WebView compatibility
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      video.setAttribute('x5-video-player-type', 'h5')
      video.setAttribute('x5-video-player-fullscreen', 'false')
      video.setAttribute('x5-video-orientation', 'portraint')

      video.src = masterUrl
      video.load()

      const handleLoadedMetadata = () => {
        console.log('[WebViewHLS] Metadata loaded')
        setIsLoading(false)

        // Check for audio tracks (Safari/WebKit specific)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const audioTracks = (video as any).audioTracks
        if (audioTracks && audioTracks.length > 0) {
          const tracks: Track[] = []
          for (let i = 0; i < audioTracks.length; i++) {
            const track = audioTracks[i]
            tracks.push({
              lang: track.language || `track-${i}`,
              name: track.label || track.language || `Track ${i + 1}`,
              index: i
            })
          }
          onTracksLoaded?.(tracks)
        }
      }

      const handleError = (e: Event) => {
        console.error('[WebViewHLS] Video error:', e)
        const videoError = video.error
        if (videoError) {
          let errorMessage = 'Video playback error'
          switch (videoError.code) {
            case 1: errorMessage = 'Video loading aborted'; break
            case 2: errorMessage = 'Network error'; break
            case 3: errorMessage = 'Video decoding failed'; break
            case 4: errorMessage = 'Video format not supported'; break
          }
          setError(errorMessage)
          toast.error(errorMessage)
        }
        setIsLoading(false)
      }

      const handleCanPlay = () => {
        console.log('[WebViewHLS] Video can play')
        setIsLoading(false)
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('error', handleError)
      video.addEventListener('canplay', handleCanPlay)

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('error', handleError)
        video.removeEventListener('canplay', handleCanPlay)
      }
    } else {
      // For Android WebView and desktop browsers, we might need HLS.js
      // But for simplicity in WebView, try native first
      console.log('[WebViewHLS] Attempting native HLS on non-iOS platform')

      video.setAttribute('playsinline', 'true')
      video.src = masterUrl
      video.load()

      const handleCanPlay = () => {
        console.log('[WebViewHLS] Video can play')
        setIsLoading(false)
      }

      const handleError = () => {
        setError('HLS playback not supported on this device')
        setIsLoading(false)
      }

      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('error', handleError)

      return () => {
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('error', handleError)
      }
    }
  }, [masterUrl, onTracksLoaded])

  // Audio tracks handling is done in handleLoadedMetadata

  return (
    <div className={className}>
      <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
        <video
          ref={videoRef}
          controls
          playsInline
          autoPlay={false}
          preload="auto"
          crossOrigin="anonymous"
          className="w-full h-full object-contain"
          controlsList="nodownload"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
            <div className="text-white">Loading...</div>
          </div>
        )}

        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 pointer-events-none">
            <div className="text-white text-center p-4">
              <p className="mb-2">Unable to play video</p>
              <p className="text-sm opacity-75">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}