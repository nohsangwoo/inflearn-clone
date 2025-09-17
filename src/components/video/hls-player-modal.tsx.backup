"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Hls from "hls.js"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"

type Props = {
  sectionId: number
  title?: string
}

type Track = { lang: string; name: string; index: number }

export default function HlsPlayerModal({ sectionId, title }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  const masterUrl = useMemo(() => `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${sectionId}/master.m3u8`, [cdn, sectionId])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hls, setHls] = useState<Hls | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [curIdx, setCurIdx] = useState<number>(-1)

  useEffect(() => {
    if (!isOpen) return

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
      return () => { _hls.destroy(); setHls(null); setTracks([]) }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = masterUrl
    }
  }, [masterUrl, isOpen])

  function switchLang(lang: string) {
    if (!hls) return
    const idx = tracks.findIndex(t => t.lang === lang)
    if (idx >= 0) {
      hls.audioTrack = idx
      setCurIdx(idx)
      if (typeof window !== "undefined") localStorage.setItem("lesson_lang", lang)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Languages className="h-4 w-4" />
        다국어 재생
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{title || "다국어 영상"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video">
              <video ref={videoRef} controls playsInline className="w-full h-full rounded border" />
            </div>
            {tracks.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">언어 선택</div>
                <div className="flex flex-wrap gap-2">
                  {tracks.map(t => (
                    <button
                      key={t.index}
                      onClick={() => switchLang(t.lang)}
                      className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                        curIdx === t.index
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-accent'
                      }`}
                    >
                      {t.name} ({t.lang})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}