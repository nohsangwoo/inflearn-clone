"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Languages, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Hls from 'hls.js'
import axios from 'axios'

type Props = {
  sectionId: number
  title?: string
}

type DubTrack = {
  id: string
  lang: string
  status: string
  url?: string | null
}

type AudioTrack = {
  id: number
  language: string
  label: string
  status: string
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

export default function DynamicHlsPlayerModal({ sectionId, title }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([])
  const [currentTrackId, setCurrentTrackId] = useState<number>(-1)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<string>('ja') // Default to Japanese

  const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"

  // Dynamic master URL based on current language
  const masterUrl = useMemo(() => {
    return `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${sectionId}/master.m3u8`
  }, [cdn, sectionId])

  // Dynamic audio URL based on current language
  const audioUrl = useMemo(() => {
    return `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${sectionId}/audio/${currentLanguage}/audio.m3u8`
  }, [cdn, sectionId, currentLanguage])

  console.log('[DynamicHlsPlayerModal] Master URL:', masterUrl)
  console.log('[DynamicHlsPlayerModal] Audio URL:', audioUrl)

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const languageSelectorRef = useRef<HTMLDivElement>(null)

  // Fetch available dub tracks from database
  useEffect(() => {
    if (!isOpen) return

    const fetchDubTracks = async () => {
      try {
        setIsLoading(true)

        // Fetch video data including DubTrack relations
        const response = await axios.get(`/api/admin/curriculums/sections/${sectionId}/video`)
        const video = response.data

        console.log('[DynamicHlsPlayerModal] Video data:', video)

        if (video && video.DubTrack && Array.isArray(video.DubTrack)) {
          const dubTracks: DubTrack[] = video.DubTrack

          // Filter only ready tracks and create audio track list
          const readyTracks = dubTracks.filter((track: DubTrack) => track.status === 'ready')

          const tracks: AudioTrack[] = readyTracks.map((track: DubTrack, index: number) => ({
            id: index,
            language: track.lang,
            label: langNameMap[track.lang] || track.lang.toUpperCase(),
            status: track.status
          }))

          console.log('[DynamicHlsPlayerModal] Available tracks:', tracks)
          setAudioTracks(tracks)

          // Set default language (prefer Japanese, fallback to first available)
          const preferredLang = tracks.find(t => t.language === 'ja') || tracks[0]
          if (preferredLang) {
            setCurrentLanguage(preferredLang.language)
            setCurrentTrackId(preferredLang.id)
          }
        } else {
          console.warn('[DynamicHlsPlayerModal] No DubTrack data found')
          setAudioTracks([])
        }
      } catch (err) {
        console.error('[DynamicHlsPlayerModal] Failed to fetch dub tracks:', err)
        setError('더빙 트랙 정보를 가져올 수 없습니다')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDubTracks()
  }, [sectionId, isOpen])

  // Initialize HLS player when modal opens or language changes
  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      if (hlsRef.current) {
        console.log('[DynamicHlsPlayerModal] Destroying HLS instance')
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      return
    }

    const initializePlayer = () => {
      if (!videoRef.current) {
        console.log('[DynamicHlsPlayerModal] Video ref not ready, retrying...')
        setTimeout(initializePlayer, 100)
        return
      }

      console.log('[DynamicHlsPlayerModal] Initializing player for language:', currentLanguage)

      const video = videoRef.current

      // Clean up existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }

      if (Hls.isSupported()) {
        console.log('[DynamicHlsPlayerModal] Using HLS.js')

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

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('[DynamicHlsPlayerModal] Manifest parsed for language:', currentLanguage)
          setIsLoading(false)
        })

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('[DynamicHlsPlayerModal] HLS error:', event, data)
          if (data.fatal) {
            setError(`재생 오류: ${data.details}`)
            setIsLoading(false)
          }
        })

        // Load the master playlist (which should contain all language options)
        hls.attachMedia(video)
        hls.loadSource(masterUrl)

      } else {
        // Fallback for native HLS support (mainly Safari)
        const canPlayHls = video.canPlayType('application/vnd.apple.mpegurl')
        if (canPlayHls) {
          console.log('[DynamicHlsPlayerModal] Using native HLS support')
          video.src = masterUrl

          video.addEventListener('loadedmetadata', () => {
            console.log('[DynamicHlsPlayerModal] Native HLS loaded')
            setIsLoading(false)
          })

          video.addEventListener('error', (e) => {
            console.error('[DynamicHlsPlayerModal] Native HLS error:', e)
            setError('네이티브 HLS 재생 오류')
          })
        } else {
          setError('이 브라우저에서는 HLS 재생이 지원되지 않습니다.')
          setIsLoading(false)
        }
      }
    }

    // Initialize player when tracks are available
    if (audioTracks.length > 0) {
      initializePlayer()
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [isOpen, currentLanguage, audioTracks, masterUrl])

  // Close language selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageSelectorRef.current && !languageSelectorRef.current.contains(event.target as Node)) {
        setShowLanguageSelector(false)
      }
    }

    if (showLanguageSelector) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLanguageSelector])

  const switchAudioTrack = (trackId: number) => {
    const track = audioTracks.find(t => t.id === trackId)
    if (!track) {
      console.warn('[DynamicHlsPlayerModal] Track not found:', trackId)
      toast.error('해당 언어 트랙을 찾을 수 없습니다')
      return
    }

    console.log('[DynamicHlsPlayerModal] Switching to language:', track.language)

    // Store current playback state
    const currentTime = videoRef.current?.currentTime || 0
    const wasPaused = videoRef.current?.paused || true

    // Update language (this will trigger useEffect to reload HLS)
    setCurrentLanguage(track.language)
    setCurrentTrackId(trackId)

    // Save preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('lesson_lang', track.language)
    }

    // Restore playback state after a short delay
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime
        if (!wasPaused) {
          videoRef.current.play()
        }
      }
    }, 1000)

    toast.success(`${track.label}로 전환되었습니다`)
  }

  const handleDebug = () => {
    console.group('[DynamicHlsPlayerModal Debug Info]')
    console.log('Section ID:', sectionId)
    console.log('Current Language:', currentLanguage)
    console.log('Master URL:', masterUrl)
    console.log('Audio URL:', audioUrl)
    console.log('Audio Tracks:', audioTracks)
    console.log('Current Track ID:', currentTrackId)
    console.log('HLS instance:', hlsRef.current)

    if (hlsRef.current) {
      console.log('HLS audio tracks:', hlsRef.current.audioTracks)
      console.log('Current HLS audio track:', hlsRef.current.audioTrack)
    }

    if (videoRef.current) {
      console.log('Video element ready state:', videoRef.current.readyState)
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
        다국어 재생 (DB기반)
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl" aria-describedby="dynamic-hls-player-description">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{title || "다국어 영상"} - {langNameMap[currentLanguage] || currentLanguage}</span>
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
          <div id="dynamic-hls-player-description" className="sr-only">
            데이터베이스 기반 다국어 비디오 플레이어 모달입니다.
          </div>
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <div className="font-medium">재생 오류</div>
                  <div className="text-sm">{error}</div>
                  <div className="text-xs mt-1 opacity-70">
                    Master URL: {masterUrl}
                  </div>
                  <div className="text-xs opacity-70">
                    Audio URL: {audioUrl}
                  </div>
                </div>
              </div>
            )}

            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {isOpen && (
                <>
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-full"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('[DynamicHlsPlayerModal] Video error:', e.currentTarget.error)
                      setError(`비디오 오류: ${e.currentTarget.error?.message || 'Unknown error'}`)
                    }}
                    onLoadedMetadata={() => {
                      console.log('[DynamicHlsPlayerModal] Video metadata loaded')
                    }}
                    onCanPlay={() => {
                      console.log('[DynamicHlsPlayerModal] Video can play')
                      setIsLoading(false)
                    }}
                  >
                    HLS 스트리밍을 로딩하고 있습니다...
                  </video>

                  {/* Language Selector Overlay */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="relative" ref={languageSelectorRef}>
                      <button
                        onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                        className="bg-black/70 hover:bg-black/80 text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
                      >
                        <Languages className="h-4 w-4" />
                        <span>{audioTracks.find(t => t.id === currentTrackId)?.label || `언어 (${audioTracks.length})`}</span>
                        <svg
                          className={`h-4 w-4 transition-transform duration-200 ${showLanguageSelector ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Language Dropdown */}
                      {showLanguageSelector && (
                        <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-md rounded-md overflow-hidden shadow-xl border border-white/20 min-w-[160px]">
                          {audioTracks.length > 0 ? audioTracks.map((track) => (
                            <button
                              key={track.id}
                              onClick={() => {
                                switchAudioTrack(track.id)
                                setShowLanguageSelector(false)
                              }}
                              className={`w-full text-left px-4 py-3 text-sm transition-all duration-150 flex items-center gap-3 ${
                                currentTrackId === track.id
                                  ? 'bg-primary/80 text-primary-foreground'
                                  : 'text-white hover:bg-white/10'
                              }`}
                            >
                              <div className="flex-1">
                                <div className="font-medium">{track.label}</div>
                                <div className="text-xs opacity-70">{track.language.toUpperCase()} • {track.status}</div>
                              </div>
                              {currentTrackId === track.id && (
                                <svg className="h-4 w-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          )) : (
                            <div className="px-4 py-3 text-sm text-white/70">
                              사용 가능한 오디오 트랙이 없습니다
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <div className="text-sm">비디오 로딩 중...</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {audioTracks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">언어 선택 (DB 기반)</div>
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
                      <div className="text-xs opacity-70">{track.language} • {track.status}</div>
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 Tip: DB의 DubTrack 데이터를 기반으로 동적 언어 전환을 지원합니다!
                </div>
              </div>
            )}

            {!error && audioTracks.length === 0 && !isLoading && (
              <div className="text-center py-4 text-muted-foreground">
                <Languages className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">사용 가능한 다국어 트랙이 없습니다.</div>
                <div className="text-xs mt-1">더빙이 완료된 후 다시 시도해보세요.</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}