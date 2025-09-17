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

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const _hls = new Hls({ enableWorker: true })
      _hls.loadSource(masterUrl)
      _hls.attachMedia(video)
      _hls.on(Hls.Events.MANIFEST_PARSED, () => {
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
      setHls(_hls)
      return () => { _hls.destroy() }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = masterUrl
    }
  }, [masterUrl])

  function switchLang(lang: string) {
    if (!hls) return
    const idx = tracks.findIndex(t => t.lang === lang)
    if (idx >= 0) { hls.audioTrack = idx; setCurIdx(idx); if (typeof window !== "undefined") localStorage.setItem("lesson_lang", lang) }
  }

  return (
    <div className={className}>
      <video ref={videoRef} controls playsInline className="w-full rounded border" />
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


