"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Hls from "hls.js"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Languages, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  sectionId: number
  title?: string
}

type Track = { lang: string; name: string; index: number }

const langNameMap: Record<string, string> = {
  ko: "한국어",
  en: "영어",
  ja: "일본어",
  zh: "중국어",
  es: "스페인어",
  fr: "프랑스어",
  de: "독일어",
  ru: "러시아어",
  pt: "포르투갈어",
  it: "이탈리아어",
  ar: "아랍어",
  hi: "힌디어",
  th: "태국어",
  vi: "베트남어",
  id: "인도네시아어",
}

export default function HlsPlayerModal({ sectionId, title }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  const masterUrl = useMemo(() => `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${sectionId}/master.m3u8`, [cdn, sectionId])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hls, setHls] = useState<Hls | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [curIdx, setCurIdx] = useState<number>(-1)

  useEffect(() => {
    if (!isOpen) {
      if (hls) {
        hls.destroy()
        setHls(null)
      }
      setTracks([])
      setError(null)
      return
    }

    const video = videoRef.current
    if (!video) return

    console.log("[HLS Player] Loading:", masterUrl)
    setIsLoading(true)
    setError(null)

    fetch(masterUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Master playlist not found. 먼저 더빙을 요청하세요.`)
        }
        return true
      })
      .then(() => {
        if (Hls.isSupported()) {
          const _hls = new Hls({
            enableWorker: true,
            debug: true
          })

          _hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("[HLS Error]", data)
            if (data.fatal) {
              setError(`재생 오류: ${data.details}`)
            }
          })

          _hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false)
            const audioTracks = _hls.audioTracks
            console.log("[HLS] Audio tracks:", audioTracks)

            if (audioTracks.length === 0) {
              setError("오디오 트랙이 없습니다. 더빙이 완료되었는지 확인하세요.")
              return
            }

            const list = audioTracks.map((t, i) => ({
              lang: t.lang || String(i),
              name: langNameMap[t.lang || ""] || t.name || t.lang || `Track ${i + 1}`,
              index: i
            }))
            setTracks(list)
            setCurIdx(_hls.audioTrack)
          })

          _hls.loadSource(masterUrl)
          _hls.attachMedia(video)
          setHls(_hls)
        }
      })
      .catch(err => {
        console.error("[HLS] Error:", err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [masterUrl, isOpen])

  function switchLang(lang: string) {
    if (!hls) return
    const idx = tracks.findIndex(t => t.lang === lang)
    if (idx >= 0) {
      hls.audioTrack = idx
      setCurIdx(idx)
      localStorage.setItem("lesson_lang", lang)
      toast.success(`${langNameMap[lang] || lang}로 전환`)
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
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">로딩 중...</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded">
                {error}
              </div>
            )}

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
                      className={`px-4 py-2 rounded-md border ${
                        curIdx === t.index
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background hover:bg-accent'
                      }`}
                    >
                      {t.name}
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
