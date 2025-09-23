"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Languages, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Type definitions for Shaka Player
import type { ShakaPlayer, ShakaAudioTrack, ShakaEvent, ShakaNamespace } from '@/types/shaka-player'

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

export default function ShakaPlayerModal({ sectionId, title }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const [currentTrackId, setCurrentTrackId] = useState<number>(-1)

  const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  const masterUrl = useMemo(() => `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${sectionId}/master.m3u8`, [cdn, sectionId])

  console.log('masterUrl', masterUrl)

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<ShakaPlayer | null>(null)
  const [shakaLoaded, setShakaLoaded] = useState(false)

  // Load Shaka Player library dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !shakaLoaded) {
      // @ts-expect-error - Dynamic import of Shaka Player
      import('shaka-player/dist/shaka-player.ui.js').then((shaka) => {
        // @ts-expect-error - Shaka Player global
        window.shaka = shaka.default as ShakaNamespace
        setShakaLoaded(true)
        console.log('[Shaka] Library loaded successfully')
      }).catch(err => {
        console.error('[Shaka] Failed to load library:', err)
        setError('Failed to load video player library')
      })
    }
  }, [shakaLoaded])

  useEffect(() => {
    if (!isOpen || !shakaLoaded) {
      // Clean up when modal closes
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      setAudioTracks([])
      setError(null)
      return
    }

    const video = videoRef.current
    if (!video) return

    const shaka = window.shaka as ShakaNamespace | undefined

    if (!shaka) {
      setError('Shaka Player not loaded')
      return
    }

    console.log('[Shaka] Initializing player for:', masterUrl)
    setIsLoading(true)
    setError(null)

    // Check for browser support
    if (!shaka.Player.isBrowserSupported()) {
      setError('이 브라우저는 비디오 재생을 지원하지 않습니다.')
      setIsLoading(false)
      return
    }

    // Create player instance
    const player = new shaka.Player(video)
    playerRef.current = player

    // Configure player for HLS
    player.configure({
      streaming: {
        useNativeHlsOnSafari: false, // Use Shaka's HLS parser for consistency
        bufferingGoal: 30,
        rebufferingGoal: 15,
        bufferBehind: 30,
      },
      manifest: {
        defaultPresentationDelay: 0,
        hls: {
          ignoreManifestProgramDateTime: true,
        }
      }
    })

    // Add error event listener
    player.addEventListener('error', (event: ShakaEvent) => {
      const error = event.detail
      console.error('[Shaka] Error:', error)
      setError(`재생 오류: ${error?.message || error?.code || 'Unknown error'}`)
      setIsLoading(false)
    })

    // Add buffering event listener
    player.addEventListener('buffering', (event: ShakaEvent) => {
      console.log('[Shaka] Buffering:', event.buffering)
    })

    // Add tracks changed event
    player.addEventListener('trackschanged', () => {
      const tracks = player.getAudioTracks()
      console.log('[Shaka] Audio tracks available:', tracks)

      if (tracks && tracks.length > 0) {
        const formattedTracks = tracks.map((track: ShakaAudioTrack) => ({
          id: track.id,
          language: track.language,
          label: langNameMap[track.language] || track.label || track.language,
          roles: track.roles
        }))

        setAudioTracks(formattedTracks)

        // Set default track (prefer Korean)
        const koTrack = formattedTracks.find(t => t.language === 'ko')
        if (koTrack) {
          player.selectAudioTrack(koTrack.id)
          setCurrentTrackId(koTrack.id)
        } else if (formattedTracks.length > 0) {
          setCurrentTrackId(formattedTracks[0].id)
        }

        console.log('[Shaka] Formatted audio tracks:', formattedTracks)
      } else {
        console.warn('[Shaka] No audio tracks found')
      }
    })

    // Add adaptation event (track switch)
    player.addEventListener('adaptation', () => {
      const track = player.getAudioTracks().find((t: ShakaAudioTrack) => t.active)
      if (track) {
        console.log('[Shaka] Switched to audio track:', track)
        setCurrentTrackId(track.id)
      }
    })

    // Load the manifest
    player.load(masterUrl).then(() => {
      console.log('[Shaka] Manifest loaded successfully')
      setIsLoading(false)

      // Try to get audio tracks immediately
      const tracks = player.getAudioTracks()
      if (tracks && tracks.length > 0) {
        const formattedTracks = tracks.map((track: ShakaAudioTrack) => ({
          id: track.id,
          language: track.language,
          label: langNameMap[track.language] || track.label || track.language,
          roles: track.roles
        }))

        setAudioTracks(formattedTracks)

        // Find active track
        const activeTrack = tracks.find((t: ShakaAudioTrack) => t.active)
        if (activeTrack) {
          setCurrentTrackId(activeTrack.id)
        }
      }

      // Try autoplay
      video.play().catch(e => {
        console.log('[Shaka] Autoplay prevented:', e)
      })
    }).catch((error: Error & { code?: string }) => {
      console.error('[Shaka] Failed to load manifest:', error)
      setError(`매니페스트 로드 실패: ${error.message || error.code}`)
      setIsLoading(false)
    })

    // Cleanup function
    return () => {
      if (playerRef.current) {
        console.log('[Shaka] Destroying player')
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [masterUrl, isOpen, shakaLoaded])

  const switchAudioTrack = (trackId: number) => {
    if (!playerRef.current) {
      console.warn('[Shaka] Player not initialized')
      return
    }

    const track = audioTracks.find(t => t.id === trackId)
    if (!track) {
      console.warn('[Shaka] Track not found:', trackId)
      return
    }

    console.log('[Shaka] Switching to audio track:', track)
    playerRef.current.selectAudioTrack(trackId)
    setCurrentTrackId(trackId)

    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('lesson_lang', track.language)
    }

    toast.success(`${track.label}로 전환되었습니다`)
  }

  const handleDebug = () => {
    console.group('[Shaka Debug Info]')
    console.log('Master URL:', masterUrl)
    console.log('Section ID:', sectionId)
    console.log('Shaka Loaded:', shakaLoaded)
    console.log('Audio Tracks:', audioTracks)
    console.log('Current Track ID:', currentTrackId)

    if (playerRef.current) {
      console.log('Player instance:', playerRef.current)
      console.log('Audio tracks from player:', playerRef.current.getAudioTracks())
      console.log('Variant tracks:', playerRef.current.getVariantTracks())
      console.log('Stats:', playerRef.current.getStats())
      console.log('Configuration:', playerRef.current.getConfiguration())
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
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">비디오 스트림 로딩 중...</span>
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

            {!isLoading && !error && audioTracks.length === 0 && !shakaLoaded && (
              <div className="text-center py-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin opacity-50" />
                <div className="text-sm">플레이어 라이브러리 로딩 중...</div>
              </div>
            )}

            {!isLoading && !error && audioTracks.length === 0 && shakaLoaded && (
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