"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Hls from "hls.js"

type Props = {
  sectionId: number
  className?: string
}

type Track = { lang: string; name: string; index: number }

export default function HlsPlayer({ sectionId, className }: Props) {
  const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  const masterUrl = useMemo(() => `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${sectionId}/master.m3u8`, [cdn, sectionId])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hls, setHls] = useState<Hls | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [curIdx, setCurIdx] = useState<number>(-1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setIsLoading(true)
    setError(null)

    // Check for native HLS support first (iOS Safari, WebView)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('[HLS] Using native HLS support')
      video.src = masterUrl

      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false)
      })

      video.addEventListener('error', (e) => {
        console.error('[HLS] Native playback error:', e)
        setError('Video playback error')
        setIsLoading(false)
      })

      return
    }

    // Fallback to HLS.js for other browsers
    if (Hls.isSupported()) {
      const _hls = new Hls({
        enableWorker: true,
        debug: false,
        autoStartLoad: true,
        startPosition: -1,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
        lowLatencyMode: false,
        backBufferLength: 90
      })
      _hls.loadSource(masterUrl)
      _hls.attachMedia(video)
      _hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false)
        const list = _hls.audioTracks.map((t, i) => ({ lang: t.lang ?? String(i), name: t.name ?? t.lang ?? String(i), index: i }))
        setTracks(list)
        const saved = typeof window !== "undefined" ? localStorage.getItem("lesson_lang") : null
        if (saved) {
          const idx = list.findIndex(t => t.lang === saved)
          if (idx >= 0) { _hls.audioTrack = idx; setCurIdx(idx) }
        } else {
          setCurIdx(_hls.audioTrack)
        }
      })

      _hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('[HLS] Error:', data)
        if (data.fatal) {
          setError(`Playback error: ${data.details}`)
          setIsLoading(false)

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('[HLS] Network error, attempting recovery')
              _hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('[HLS] Media error, attempting recovery')
              _hls.recoverMediaError()
              break
            default:
              console.error('[HLS] Unrecoverable error')
              _hls.destroy()
              break
          }
        }
      })

      setHls(_hls)
      return () => { _hls.destroy() }
    } else {
      // No HLS support
      setError('HLS is not supported in this browser')
      setIsLoading(false)
      console.error('[HLS] Browser does not support HLS')
    }
  }, [masterUrl])

  function switchLang(lang: string) {
    if (!hls) return
    const idx = tracks.findIndex(t => t.lang === lang)
    if (idx >= 0) { hls.audioTrack = idx; setCurIdx(idx); if (typeof window !== "undefined") localStorage.setItem("lesson_lang", lang) }
  }

  return (
    <div className={className}>
      <div className="relative w-full aspect-video bg-black rounded overflow-hidden">
        <video
          ref={videoRef}
          controls
          playsInline
          webkit-playsinline="true"
          autoPlay={false}
          preload="metadata"
          crossOrigin="anonymous"
          className="w-full h-full object-contain"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white">Loading...</div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-white text-center p-4">
              <p className="mb-2">Unable to play video</p>
              <p className="text-sm opacity-75">{error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {tracks.map(t => (
          <button key={t.index} onClick={() => switchLang(t.lang)} className={`text-xs px-2 py-1 rounded border ${curIdx === t.index ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
            {t.name} ({t.lang})
          </button>
        ))}
      </div>
    </div>
  )
}


