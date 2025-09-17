"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Languages, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Hls from 'hls.js'

type Props = {
  sectionId: number
  title?: string
}

type AudioTrack = {
  id: number
  language: string
  label: string
  roles: string[]
}

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const [currentTrackId, setCurrentTrackId] = useState<number>(-1)

  const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  const masterUrl = useMemo(() => `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${sectionId}/master.m3u8`, [cdn, sectionId])

  console.log('[HlsPlayerModal] Master URL:', masterUrl)

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  // Initialize HLS.js when modal opens
  useEffect(() => {
    console.log('[HlsPlayerModal] useEffect triggered - isOpen:', isOpen, 'videoRef:', !!videoRef.current)

    if (!isOpen) {
      // Reset state and cleanup when modal closes
      console.log('[HlsPlayerModal] Modal closed, cleaning up...')
      setAudioTracks([])
      setError(null)
      setIsLoading(true)
      setCurrentTrackId(-1)

      if (hlsRef.current) {
        console.log('[HlsPlayerModal] Destroying existing HLS instance')
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      return
    }

    // Wait for video element to be ready
    const initializePlayer = () => {
      if (!videoRef.current) {
        console.log('[HlsPlayerModal] Video ref not ready, retrying...')
        setTimeout(initializePlayer, 100)
        return
      }

      console.log('[HlsPlayerModal] Video ref ready, initializing player...')
      console.log('[HlsPlayerModal] Master URL:', masterUrl)
      console.log('[HlsPlayerModal] Hls.isSupported():', Hls.isSupported())

      const video = videoRef.current

      // Test native HLS support first
      const canPlayHls = video.canPlayType('application/vnd.apple.mpegurl')
      console.log('[HlsPlayerModal] Native HLS support:', canPlayHls)

      if (canPlayHls) {
        console.log('[HlsPlayerModal] Using native HLS support')
        video.src = masterUrl

        video.addEventListener('loadedmetadata', () => {
          console.log('[HlsPlayerModal] Native HLS metadata loaded')
          setIsLoading(false)
        })

        video.addEventListener('error', (e) => {
          console.error('[HlsPlayerModal] Native HLS error:', e)
          setError('네이티브 HLS 재생 오류')
        })

      } else if (Hls.isSupported()) {
        console.log('[HlsPlayerModal] Using HLS.js')

        const hls = new Hls({
          debug: true,
          enableWorker: true,
          autoStartLoad: true,
          startPosition: -1,
          maxBufferLength: 30,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5
        })

        hlsRef.current = hls
        console.log('[HlsPlayerModal] HLS instance created:', hls)

        // Add all event listeners first
        hls.on(Hls.Events.MEDIA_ATTACHING, () => {
          console.log('[HlsPlayerModal] Media attaching...')
        })

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('[HlsPlayerModal] Media attached successfully')
        })

        hls.on(Hls.Events.MANIFEST_LOADING, () => {
          console.log('[HlsPlayerModal] Manifest loading started...')
        })

        hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
          console.log('[HlsPlayerModal] Manifest loaded:', data)
        })

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          console.log('[HlsPlayerModal] Manifest parsed:', data)

          // Get audio tracks
          const tracks = hls.audioTracks
          console.log('[HlsPlayerModal] Audio tracks found:', tracks)

          if (tracks && tracks.length > 0) {
            const formattedTracks = tracks.map((track, index) => ({
              id: index,
              language: track.lang || track.language || '',
              label: langNameMap[track.lang || track.language || ''] || track.name || track.language || `Track ${index + 1}`,
              roles: []
            }))

            console.log('[HlsPlayerModal] Formatted tracks:', formattedTracks)
            setAudioTracks(formattedTracks)

            // Set default track (prefer Japanese)
            const jaTrack = formattedTracks.find(t => t.language === 'ja')
            if (jaTrack) {
              hls.audioTrack = jaTrack.id
              setCurrentTrackId(jaTrack.id)
            } else if (formattedTracks.length > 0) {
              setCurrentTrackId(0)
            }
          }

          setIsLoading(false)
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('[HlsPlayerModal] HLS error:', event, data)

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('[HlsPlayerModal] Network error:', data.details)
                setError(`네트워크 오류: ${data.details}`)
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('[HlsPlayerModal] Media error:', data.details)
                setError(`미디어 오류: ${data.details}`)
                break
              default:
                console.error('[HlsPlayerModal] Other error:', data.details)
                setError(`재생 오류: ${data.details}`)
                break
            }
            setIsLoading(false)
          }
        })

        hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (event, data) => {
          console.log('[HlsPlayerModal] Audio track switched to:', data)
          setCurrentTrackId(data.id)
        })

        // Now attach and load
        console.log('[HlsPlayerModal] Attaching media to video element...')
        hls.attachMedia(video)

        console.log('[HlsPlayerModal] Loading source:', masterUrl)
        hls.loadSource(masterUrl)

      } else {
        console.error('[HlsPlayerModal] HLS is not supported in this browser')
        setError('이 브라우저에서는 HLS 재생이 지원되지 않습니다.')
        setIsLoading(false)
      }
    }

    // Start initialization
    initializePlayer()

    return () => {
      if (hlsRef.current) {
        console.log('[HlsPlayerModal] Cleanup: destroying HLS instance')
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [masterUrl, isOpen])

  const switchAudioTrack = (trackId: number) => {
    if (!hlsRef.current) {
      console.warn('[HlsPlayerModal] HLS not initialized')
      return
    }

    const track = audioTracks.find(t => t.id === trackId)
    if (!track) {
      console.warn('[HlsPlayerModal] Track not found:', trackId)
      return
    }

    console.log('[HlsPlayerModal] Switching to audio track:', track)
    hlsRef.current.audioTrack = trackId
    setCurrentTrackId(trackId)

    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('lesson_lang', track.language)
    }

    toast.success(`${track.label}로 전환되었습니다`)
  }

  const handleDebug = () => {
    console.group('[HlsPlayerModal Debug Info]')
    console.log('Master URL:', masterUrl)
    console.log('Section ID:', sectionId)
    console.log('Audio Tracks:', audioTracks)
    console.log('Current Track ID:', currentTrackId)
    console.log('HLS instance:', hlsRef.current)

    if (hlsRef.current) {
      console.log('HLS audio tracks:', hlsRef.current.audioTracks)
      console.log('Current audio track:', hlsRef.current.audioTrack)
      console.log('HLS config:', hlsRef.current.config)
    }

    if (videoRef.current) {
      console.log('Video element:', videoRef.current)
      console.log('Video ready state:', videoRef.current.readyState)
      console.log('Video error:', videoRef.current.error)
    }
    console.groupEnd()
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
        <DialogContent className="max-w-5xl" aria-describedby="shaka-player-description">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{title || "다국어 영상"}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDebug}
                className="text-xs"
              >
                디버그 정보
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div id="shaka-player-description" className="sr-only">
            다국어 비디오 플레이어 모달입니다. Shaka Player를 사용하여 여러 언어의 오디오 트랙을 선택할 수 있습니다.
          </div>
          <div className="space-y-4">
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
              {isOpen && (
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-full"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('[HlsPlayerModal] Video error:', e.currentTarget.error)
                    setError(`비디오 오류: ${e.currentTarget.error?.message || 'Unknown error'}`)
                  }}
                  onLoadedMetadata={() => {
                    console.log('[HlsPlayerModal] Video metadata loaded')
                  }}
                  onCanPlay={() => {
                    console.log('[HlsPlayerModal] Video can play')
                    setIsLoading(false)
                  }}
                >
                  브라우저가 HLS를 지원하지 않습니다.
                </video>
              )}
            </div>

            {audioTracks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">언어 선택</div>
                  <div className="text-xs text-muted-foreground">
                    {audioTracks.length}개 언어 사용 가능
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {audioTracks.map(track => (
                    <button
                      key={track.id}
                      onClick={() => switchAudioTrack(track.id)}
                      className={`text-sm px-4 py-2 rounded-md border transition-all ${
                        currentTrackId === track.id
                          ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                          : 'bg-background hover:bg-accent hover:scale-105'
                      }`}
                    >
                      <div className="font-medium">{track.label}</div>
                      <div className="text-xs opacity-70">{track.language}</div>
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 Tip: Shaka Player로 안정적인 다국어 스트리밍을 즐기세요!
                </div>
              </div>
            )}

            {!error && audioTracks.length === 0 && !isLoading && (
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