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
  bg: "불가리아어",
  cs: "체코어",
  da: "덴마크어",
  el: "그리스어",
  fi: "핀란드어",
  he: "히브리어",
  hu: "헝가리어",
  ms: "말레이어",
  nl: "네덜란드어",
  no: "노르웨이어",
  pl: "폴란드어",
  ro: "루마니아어",
  sk: "슬로바키아어",
  sv: "스웨덴어",
  tr: "터키어",
  uk: "우크라이나어",
  fil: "필리핀어",
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
      // 모달이 닫히면 정리
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

    console.log("[HLS Player] Loading master playlist:", masterUrl)
    setIsLoading(true)
    setError(null)

    // 먼저 master.m3u8이 존재하는지 확인
    fetch(masterUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Master playlist not found (${response.status}). 먼저 더빙을 요청하세요.`)
        }
        return true
      })
      .then(() => {
        if (Hls.isSupported()) {
          const _hls = new Hls({
            enableWorker: true,
            debug: true, // 디버깅 활성화
            xhrSetup: function (xhr, url) {
              console.log("[HLS] Loading:", url)
            }
          })

          _hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("[HLS Error]", data)
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  setError(`네트워크 오류: ${data.details}`)
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  setError(`미디어 오류: ${data.details}`)
                  _hls.recoverMediaError()
                  break
                default:
                  setError(`재생 오류: ${data.details}`)
                  break
              }
            }
          })

          _hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            console.log("[HLS] Manifest parsed:", data)
            setIsLoading(false)

            // 오디오 트랙 정보 수집
            const audioTracks = _hls.audioTracks
            console.log("[HLS] Audio tracks found:", audioTracks)

            // HLS.js는 단일 오디오 트랙일 때 audioTracks를 비워둘 수 있음
            // 이 경우 manifest에서 직접 파싱
            if (audioTracks.length === 0 && data.levels && data.levels.length > 0) {
              // 레벨에서 오디오 그룹 정보 확인
              const level = data.levels[0]
              if (level.audioGroupIds && level.audioGroupIds.length > 0) {
                const audioGroupId = level.audioGroupIds[0]
                const audioPlaylist = _hls.audioTracks || []

                console.log("[HLS] Checking audio group:", audioGroupId)
                console.log("[HLS] Audio playlist:", audioPlaylist)

                // manifest에서 직접 오디오 트랙 정보 추출 시도
                fetch(masterUrl)
                  .then(res => res.text())
                  .then(content => {
                    const lines = content.split('\n')
                    const audioTracks = []

                    for (let i = 0; i < lines.length; i++) {
                      if (lines[i].startsWith('#EXT-X-MEDIA:TYPE=AUDIO')) {
                        const match = lines[i].match(/LANGUAGE="([^"]+)"/) || lines[i].match(/NAME="([^"]+)"/)
                        if (match) {
                          const lang = match[1]
                          audioTracks.push({
                            lang,
                            name: langNameMap[lang] || lang,
                            index: audioTracks.length
                          })
                        }
                      }
                    }

                    console.log("[HLS] Parsed audio tracks from manifest:", audioTracks)

                    if (audioTracks.length > 0) {
                      // 단일 트랙이라도 표시
                      setTracks(audioTracks)
                      setCurIdx(0)

                      // 자동 재생 시도
                      video.play().catch(e => {
                        console.log("[HLS] Autoplay prevented:", e)
                      })
                    } else {
                      setError("오디오 트랙이 없습니다. 더빙이 완료되었는지 확인하세요.")
                    }
                  })
                  .catch(err => {
                    console.error("[HLS] Failed to parse manifest:", err)
                    setError("오디오 트랙을 찾을 수 없습니다.")
                  })

                return
              }
            }

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

            // 저장된 언어 설정 복원
            const saved = typeof window !== "undefined" ? localStorage.getItem("lesson_lang") : null
            if (saved) {
              const idx = list.findIndex(t => t.lang === saved)
              if (idx >= 0) {
                _hls.audioTrack = idx
                setCurIdx(idx)
                console.log("[HLS] Restored language:", saved, "index:", idx)
              }
            } else if (list.length > 0) {
              // 기본 트랙 설정 (한국어 우선)
              const koIdx = list.findIndex(t => t.lang === "ko")
              if (koIdx >= 0) {
                _hls.audioTrack = koIdx
                setCurIdx(koIdx)
              } else {
                setCurIdx(0)
              }
            }

            // 자동 재생 시도
            video.play().catch(e => {
              console.log("[HLS] Autoplay prevented:", e)
            })
          })

          _hls.on(Hls.Events.AUDIO_TRACK_SWITCHING, (event, data) => {
            console.log("[HLS] Switching audio track to:", data)
          })

          _hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
            console.log("[HLS] Audio track switched to:", data)
            setCurIdx(data.id)
          })

          _hls.loadSource(masterUrl)
          _hls.attachMedia(video)
          setHls(_hls)

          return () => {
            console.log("[HLS] Destroying player")
            _hls.destroy()
            setHls(null)
            setTracks([])
          }
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS
          console.log("[HLS] Using native HLS (Safari)")
          video.src = masterUrl
          setIsLoading(false)
        } else {
          setError("이 브라우저는 HLS 재생을 지원하지 않습니다.")
          setIsLoading(false)
        }
      })
      .catch(err => {
        console.error("[HLS] Failed to load master playlist:", err)
        setError(err.message)
        setIsLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterUrl, isOpen])

  function switchLang(lang: string) {
    if (!hls) {
      console.warn("[HLS] Player not initialized")
      return
    }

    const idx = tracks.findIndex(t => t.lang === lang)
    if (idx >= 0) {
      console.log("[HLS] Switching to language:", lang, "index:", idx)

      // HLS.js가 audioTracks를 지원하지 않는 경우 (단일 트랙)
      if (hls.audioTracks && hls.audioTracks.length > 0) {
        hls.audioTrack = idx
      } else {
        // 단일 트랙인 경우 UI만 업데이트
        console.log("[HLS] Single audio track mode, updating UI only")
      }

      setCurIdx(idx)
      if (typeof window !== "undefined") {
        localStorage.setItem("lesson_lang", lang)
      }
      toast.success(`${langNameMap[lang] || lang}로 전환되었습니다`)
    } else {
      console.warn("[HLS] Language not found:", lang)
      toast.error("선택한 언어를 찾을 수 없습니다")
    }
  }

  // 디버그 정보 표시
  const handleDebug = () => {
    console.group("[HLS Debug Info]")
    console.log("Master URL:", masterUrl)
    console.log("Section ID:", sectionId)
    console.log("HLS Supported:", Hls.isSupported())
    console.log("Audio Tracks:", tracks)
    console.log("Current Track Index:", curIdx)
    if (hls) {
      console.log("HLS Instance:", hls)
      console.log("Audio Tracks from HLS:", hls.audioTracks)
      console.log("Current Audio Track:", hls.audioTrack)
    }
    console.groupEnd()

    // 실제 URL 테스트
    fetch(masterUrl)
      .then(res => res.text())
      .then(content => {
        console.log("[HLS] Master playlist content:")
        console.log(content)
      })
      .catch(err => {
        console.error("[HLS] Failed to fetch master playlist:", err)
      })
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
            <DialogTitle className="flex items-center justify-between">
              <span>{title || "다국어 영상"}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDebug}
                className="text-xs"
              >
                디버그 정보ㅇㅇ
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">HLS 스트림 로딩 중...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <div className="font-medium">재생 오류</div>
                  <div className="text-sm">{error}</div>
                  <div className="text-xs mt-1 opacity-70">
                    URL: {masterUrl}
                  </div>
                </div>
              </div>
            )}

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                controls
                playsInline
                className="w-full h-full"
                style={{ display: isLoading ? 'none' : 'block' }}
              />
            </div>

            {tracks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">언어 선택</div>
                  <div className="text-xs text-muted-foreground">
                    {tracks.length}개 언어 사용 가능
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tracks.map(t => (
                    <button
                      key={t.index}
                      onClick={() => switchLang(t.lang)}
                      className={`text-sm px-4 py-2 rounded-md border transition-all ${
                        curIdx === t.index
                          ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                          : 'bg-background hover:bg-accent hover:scale-105'
                      }`}
                    >
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs opacity-70">{t.lang}</div>
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 Tip: 영상 재생 중에도 언어를 자유롭게 전환할 수 있습니다.
                </div>
              </div>
            )}

            {!isLoading && !error && tracks.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Languages className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">다국어 트랙을 찾을 수 없습니다.</div>
                <div className="text-xs mt-1">더빙이 완료되었는지 확인하세요.</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}