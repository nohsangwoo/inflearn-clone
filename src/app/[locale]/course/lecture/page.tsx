"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, ChevronRight, Download, Languages, Menu, X } from "lucide-react"
import Hls from "hls.js"
import { toast } from "sonner"
import { useDeviceDetection } from "@/hooks/useDeviceDetection"
import { WebViewVideoList } from "@/components/video/webview-video-list"

type CourseData = {
  id: number
  title: string
  sections: Array<{
    id: number
    title: string
    description?: string | null
    active: boolean
    videos: Array<{
      id: number
      title?: string | null
      videoUrl: string
      masterKey?: string | null
    }>
    files: Array<{
      id: number
      filename: string
      url: string
    }>
    dubTracks?: Array<{
      lang: string
      status: string
      url: string
    }>
  }>
}

type TrackInfo = {
  lang: string
  label: string
  url: string
}

const langNameMap: Record<string, string> = {
  origin: "원본",
  ORIGIN: "원본",
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
  sv: "스웨덴어",
  fi: "핀란드어",
  bg: "불가리아어",
  cs: "체코어",
  da: "덴마크어",
  el: "그리스어",
  he: "히브리어",
  hu: "헝가리어",
  ms: "말레이어",
  nl: "네덜란드어",
  no: "노르웨이어",
  pl: "폴란드어",
  ro: "루마니아어",
  sk: "슬로바키아어",
  tr: "터키어",
  uk: "우크라이나어",
  fil: "필리핀어",
}

export default function LecturePage() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Device detection for WebView
  const deviceInfo = useDeviceDetection()
  const isInWebView = deviceInfo.isWebView
  const router = useRouter()

  // Query parameters
  const courseId = searchParams.get("courseId")
  const sectionId = searchParams.get("sectionId")
  const subtitleLanguage = searchParams.get("subtitleLanguage") || "origin"

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // URL에서 현재 locale 추출
  const currentLocale = (() => {
    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]
    const locales = [
      'ko', 'en', 'ja', 'vi', 'ru', 'zh', 'zh-CN', 'zh-TW',
      'fr', 'de', 'es', 'pt', 'it', 'id', 'th', 'hi',
      'ar', 'tr', 'pl', 'uk'
    ]
    return locales.includes(firstSegment) ? firstSegment : 'ko'
  })()
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(
    sectionId ? parseInt(sectionId) : null
  )
  const [currentLanguage, setCurrentLanguage] = useState(subtitleLanguage)
  const [audioTracks, setAudioTracks] = useState<TrackInfo[]>([])
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  // Normalize language codes to improve matching between DB and HLS manifest
  const normalizeLang = (input?: string | null) => {
    const s = (input || '').toLowerCase()
    if (!s) return ''
    // Canonical mappings
    const map: Record<string, string> = {
      'jpn': 'ja', 'jp': 'ja', 'ja-jp': 'ja',
      'zho': 'zh', 'cmn': 'zh', 'zh-cn': 'zh', 'zh-hans': 'zh', 'zh-hant': 'zh', 'zh-tw': 'zh',
      'eng': 'en', 'en-us': 'en', 'en-gb': 'en',
      'kor': 'ko', 'ko-kr': 'ko',
      'fra': 'fr', 'fre': 'fr', 'fr-fr': 'fr',
      'spa': 'es', 'es-es': 'es', 'es-419': 'es',
      'deu': 'de', 'ger': 'de',
      'por': 'pt', 'pt-br': 'pt', 'pt-pt': 'pt',
      'ita': 'it',
      'rus': 'ru',
      'vie': 'vi',
      'ara': 'ar',
      'tur': 'tr',
      'ukr': 'uk',
    }
    return map[s] || s.split('-')[0] || s
  }

  // Find appropriate HLS audio track by language using robust matching
  const findHlsTrackIndexByLanguage = (hls: Hls, language: string) => {
    if (!hls.audioTracks || hls.audioTracks.length === 0) return -1
    const target = normalizeLang(language)

    // 1) Exact match on normalized lang
    let idx = hls.audioTracks.findIndex(t => normalizeLang(t.lang || t.name || '') === target)
    if (idx >= 0) return idx

    // 2) Includes/startsWith on name/lang
    idx = hls.audioTracks.findIndex(t => {
      const a = (t.lang || '').toLowerCase()
      const b = (t.name || '').toLowerCase()
      return a.includes(target) || b.includes(target)
    })
    if (idx >= 0) return idx

    // 3) Special origin handling → prefer default or first
    if (target === 'origin') {
      const defIdx = hls.audioTracks.findIndex(t => (t as any).default === true)
      return defIdx >= 0 ? defIdx : 0
    }

    return -1
  }

  const switchHlsAudioTrack = (language: string) => {
    if (!hlsRef.current || !hlsRef.current.audioTracks || hlsRef.current.audioTracks.length === 0) {
      return false
    }
    const idx = findHlsTrackIndexByLanguage(hlsRef.current, language)
    if (idx >= 0) {
      console.log(`[Lecture] Switching HLS audio track to index ${idx} for language:`, language)
      hlsRef.current.audioTrack = idx
      return true
    }
    return false
  }

  // Fetch course data
  const { data: courseData, isLoading, error } = useQuery({
    queryKey: ["lecture-data", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/api/courses/${courseId}/lecture`)
        console.log("[Lecture] Course data loaded:", data)
        return data as CourseData
      } catch (err) {
        console.error("[Lecture] Error loading course:", err)
        throw err
      }
    },
  })

  // Set initial section from URL or use first available section
  useEffect(() => {
    if (sectionId) {
      // If sectionId is provided in URL, use it
      setCurrentSectionId(parseInt(sectionId))
    } else if (courseData && !currentSectionId) {
      // Otherwise, find first available section
      const firstSection = courseData.sections.find(s => s.active && s.videos.length > 0)
      if (firstSection) {
        setCurrentSectionId(firstSection.id)
      }
    }
  }, [courseData, sectionId, currentSectionId]) // Include all dependencies

  // Get current section
  const currentSection = courseData?.sections.find(s => s.id === currentSectionId)
  const currentVideo = currentSection?.videos[0] // Assuming one video per section for now

  // Initialize HLS player when section changes
  useEffect(() => {
    if (!currentSection || !currentVideo || !videoRef.current) {
      console.log("[Lecture] Missing requirements for video playback:", {
        section: !!currentSection,
        video: !!currentVideo,
        videoRef: !!videoRef.current
      })
      return
    }

    const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
    const masterUrl = `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${currentSection.id}/master.m3u8`

    console.log("[Lecture] Initializing video player for section:", currentSection.id)
    console.log("[Lecture] Master URL:", masterUrl)
    console.log("[Lecture] User Agent:", navigator.userAgent)

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      console.log("[Lecture] Destroying previous HLS instance")
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const video = videoRef.current

    // Detect platform more accurately
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const isWebView = navigator.userAgent.includes('WebView') ||
                     (window as any).webkit?.messageHandlers ||
                     (window as any).ReactNativeWebView ||
                     (navigator as any).standalone === true

    console.log('[Lecture] Platform detection:', {
      isIOS,
      isSafari,
      isWebView,
      userAgent: navigator.userAgent
    })

    // Function to setup native HLS
    const setupNativeHLS = () => {
      console.log('[Lecture] Setting up native HLS playback')

      // Set video attributes for better compatibility
      video.setAttribute('playsinline', 'true')
      video.setAttribute('webkit-playsinline', 'true')
      video.setAttribute('x5-video-player-type', 'h5')
      video.setAttribute('x5-video-player-fullscreen', 'false')
      video.setAttribute('x5-video-orientation', 'portraint')
      video.setAttribute('controls', 'true')

      let hasPlayed = false
      let retryCount = 0
      const maxRetries = 3

      // Select native audio track (Safari/iOS)
      const selectNativeAudioTrack = (language: string) => {
        try {
          const anyVideo = video as any
          const audioTracks = anyVideo?.audioTracks
          if (!audioTracks || typeof audioTracks.length !== 'number') {
            console.log('[Lecture] Native audioTracks not available')
            return false
          }

          const targetLang = (language || 'origin').toLowerCase()
          let selected = false
          for (let i = 0; i < audioTracks.length; i++) {
            const track = audioTracks[i]
            const trackLang = (track?.language || track?.lang || '').toLowerCase()
            // origin 처리: origin/ORIGIN 이거나 언어 정보가 없는 기본 트랙
            const isOrigin = targetLang === 'origin'
            const shouldEnable = isOrigin ? (i === 0 || track?.default === true || trackLang === 'origin') : (trackLang === targetLang)
            if (shouldEnable) {
              // Safari: audioTracks[i].enabled = true 로 전환
              if (typeof track.enabled === 'boolean') track.enabled = true
              selected = true
            } else {
              if (typeof track.enabled === 'boolean') track.enabled = false
            }
          }
          console.log('[Lecture] Native audio selection result:', { targetLang, selected, total: audioTracks.length })
          return selected
        } catch (e) {
          console.warn('[Lecture] Failed to select native audio track:', e)
          return false
        }
      }

      const loadVideo = () => {
        video.src = masterUrl
        video.load()
      }

      const handleLoadedMetadata = () => {
        console.log('[Lecture] Native HLS metadata loaded')
        hasPlayed = true
        // Try selecting the desired language once metadata is available
        selectNativeAudioTrack(currentLanguage)
      }

      const handleCanPlay = () => {
        console.log('[Lecture] Native HLS can play')
        hasPlayed = true
        // Ensure selection just before playback
        selectNativeAudioTrack(currentLanguage)
      }

      const handleError = (e: Event) => {
        const videoError = video.error
        console.error('[Lecture] Native HLS error:', {
          event: e,
          error: videoError,
          code: videoError?.code,
          message: videoError?.message,
          hasPlayed,
          retryCount
        })

        if (!hasPlayed && retryCount < maxRetries) {
          retryCount++
          console.log(`[Lecture] Retrying native HLS (attempt ${retryCount}/${maxRetries})`)
          setTimeout(() => {
            video.src = ''
            loadVideo()
          }, 1000)
        } else if (!hasPlayed) {
          console.log('[Lecture] Native HLS failed, trying HLS.js fallback')
          // Cleanup native listeners
          video.removeEventListener('loadedmetadata', handleLoadedMetadata)
          video.removeEventListener('canplay', handleCanPlay)
          video.removeEventListener('error', handleError)

          // Try HLS.js as fallback
          if (Hls.isSupported()) {
            setupHlsJs()
          } else {
            toast.error('비디오 재생이 지원되지 않습니다')
          }
        }
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('error', handleError)

      // As a safety, retry selecting native audio track a few times post-load
      let selectTries = 0
      const selectInterval = setInterval(() => {
        if (selectTries >= 5) {
          clearInterval(selectInterval)
          return
        }
        const ok = selectNativeAudioTrack(currentLanguage)
        selectTries++
        if (ok) clearInterval(selectInterval)
      }, 500)

      // Start loading
      loadVideo()

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('error', handleError)
        clearInterval(selectInterval)
      }
    }

    // Function to setup HLS.js
    const setupHlsJs = () => {
      if (!Hls.isSupported()) {
        console.error('[Lecture] HLS.js is not supported')
        toast.error('이 브라우저에서는 비디오 재생이 지원되지 않습니다')
        return
      }
      console.log('[Lecture] Setting up HLS.js playback')

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

      // Add all event listeners
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('[Lecture] Media attached successfully')
      })

      hls.on(Hls.Events.MANIFEST_LOADING, () => {
        console.log('[Lecture] Manifest loading started...')
      })

      hls.on(Hls.Events.MANIFEST_LOADED, (_event, data) => {
        console.log('[Lecture] Manifest loaded:', data)
      })

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        console.log('[Lecture] Manifest parsed:', data)
        console.log('[Lecture] HLS.js audio tracks:', hls.audioTracks)
        console.log('[Lecture] Number of audio tracks:', hls.audioTracks ? hls.audioTracks.length : 0)

        // Also log the data.audioTracks if available
        if (data.audioTracks) {
          console.log('[Lecture] Data audio tracks:', data.audioTracks)
        }

        // Debug each track
        if (hls.audioTracks) {
          hls.audioTracks.forEach((track, index) => {
            console.log(`[Lecture] Track ${index}:`, {
              id: track.id,
              name: track.name,
              lang: track.lang,
              default: track.default,
              url: track.url
            })
          })
        }

        // Extract audio tracks from HLS manifest
        const tracks: TrackInfo[] = []

        // Always add origin track first
        tracks.push({
          lang: 'origin',
          label: langNameMap['origin'] || '원본',
          url: ''
        })

        // Priority 1: Use dubTracks from database if available
        if (currentSection?.dubTracks && currentSection.dubTracks.length > 0) {
          console.log('[Lecture] Found dubTracks from database:', currentSection.dubTracks)
          const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"

          currentSection.dubTracks.forEach(dubTrack => {
            // Skip origin track as we already added it
            if (dubTrack.lang !== 'origin' && dubTrack.lang !== 'ORIGIN') {
              // Construct the dubTrack URL based on the pattern
              // The dubTrack URL should be like: /assets/curriculumsection/{sectionId}/dubTracks/{lang}.m3u8
              let fullUrl = ''

              if (dubTrack.url && dubTrack.url !== '') {
                // If we have a URL from DB, use it
                fullUrl = dubTrack.url
                if (!fullUrl.startsWith('http')) {
                  // If it's a relative path, prepend the CDN URL
                  fullUrl = fullUrl.startsWith('/')
                    ? `${cdn.replace(/\/$/, "")}${fullUrl}`
                    : `${cdn.replace(/\/$/, "")}/${fullUrl}`
                }
              } else {
                // Construct URL based on the expected pattern
                fullUrl = `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${currentSection.id}/dubTracks/${dubTrack.lang}.m3u8`
              }

              tracks.push({
                lang: dubTrack.lang,
                label: langNameMap[dubTrack.lang] || dubTrack.lang,
                url: fullUrl
              })
              console.log(`[Lecture] Added dubTrack: ${dubTrack.lang} -> ${fullUrl}`)
            }
          })
        }
        // Priority 2: Check HLS audio tracks if no dubTracks from database
        else if (hls.audioTracks && hls.audioTracks.length > 1) {
          console.log('[Lecture] Using HLS audio tracks (no dubTracks in database)')
          hls.audioTracks.forEach((track, index) => {
            const lang = track.lang || track.name || `track${index}`
            // Skip origin/first track as we already added it
            if (lang !== 'origin' && lang !== 'ORIGIN' && index > 0) {
              tracks.push({
                lang: lang,
                label: langNameMap[lang] || track.name || `Track ${index + 1}`,
                url: track.url || ""
              })
            }
          })
        }
        // Priority 3: Fallback - create manual tracks
        else {
          console.log('[Lecture] No dubTracks or HLS tracks, creating manual tracks')
          const manualTracks = [
            { lang: 'ja', label: '일본어' },
            { lang: 'zh', label: '중국어' },
            { lang: 'en', label: '영어' },
            { lang: 'fr', label: '프랑스어' }
          ]
          manualTracks.forEach(track => {
            tracks.push({
              lang: track.lang,
              label: langNameMap[track.lang] || track.label,
              url: ''
            })
          })
        }

        console.log('[Lecture] Final audio tracks:', tracks)
        setAudioTracks(tracks)

        // Attempt to switch to currentLanguage using robust matcher
        if (hls.audioTracks && hls.audioTracks.length > 0) {
          const switched = switchHlsAudioTrack(currentLanguage)
          if (!switched) {
            // Fallback to default/first (origin)
            const defIdx = hls.audioTracks.findIndex(t => (t as any).default === true)
            const idx = defIdx >= 0 ? defIdx : 0
            console.log(`[Lecture] Using fallback HLS audio track index ${idx}`)
            hls.audioTrack = idx
          }
        }
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('[Lecture] HLS.js error:', data)

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('[Lecture] Network error, attempting recovery:', data.details)
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('[Lecture] Media error, attempting recovery:', data.details)
              hls.recoverMediaError()
              break
            default:
              console.error('[Lecture] Unrecoverable error:', data.details)
              toast.error(`재생 오류가 발생했습니다`)
              break
          }
        }
      })

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_event, data) => {
        console.log('[Lecture] Audio tracks updated:', data)
        console.log('[Lecture] Updated HLS audio tracks:', hls.audioTracks)

        // Now process the audio tracks
        if (hls.audioTracks && hls.audioTracks.length > 0) {
          const tracks: TrackInfo[] = []

          // Add origin track first
          tracks.push({
            lang: 'origin',
            label: langNameMap['origin'] || '원본',
            url: ''
          })

          // Add HLS audio tracks
          hls.audioTracks.forEach((track, index) => {
            if (track.lang && track.lang !== 'origin' && track.lang !== 'ORIGIN') {
              tracks.push({
                lang: track.lang,
                label: langNameMap[track.lang] || track.name || `Track ${index + 1}`,
                url: ''
              })
            }
          })

          console.log('[Lecture] Audio tracks from HLS:', tracks)
          setAudioTracks(tracks)

          // Try to keep current language after update
          const switched = switchHlsAudioTrack(currentLanguage)
          if (!switched) {
            console.log('[Lecture] Could not switch after update, keeping current HLS selection')
          }
        }
      })

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_event, data) => {
        console.log('[Lecture] Audio track switched event:', data)
        console.log('[Lecture] New audio track ID:', data.id)
        if (hls.audioTracks && hls.audioTracks[data.id]) {
          const track = hls.audioTracks[data.id]
          console.log('[Lecture] Switched to track:', {
            id: track.id,
            name: track.name,
            lang: track.lang,
            default: track.default
          })
        }
      })

      // Attach and load
      console.log('[Lecture] Attaching media to video element...')
      hls.attachMedia(video)

      console.log('[Lecture] Loading source:', masterUrl)
      hls.loadSource(masterUrl)
    }

    // Decide which method to use based on platform
    if (isIOS || (isSafari && !isWebView)) {
      // iOS Safari or macOS Safari - use native HLS
      console.log('[Lecture] Detected iOS/Safari, using native HLS')
      const cleanup = setupNativeHLS()
      return cleanup
    } else if (Hls.isSupported()) {
      // Other browsers - use HLS.js
      console.log('[Lecture] Using HLS.js for playback')
      setupHlsJs()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback to native if HLS.js not supported but native might work
      console.log('[Lecture] HLS.js not supported, trying native as fallback')
      const cleanup = setupNativeHLS()
      return cleanup
    } else {
      console.error('[Lecture] No HLS support available')
      toast.error('이 브라우저에서는 비디오 재생이 지원되지 않습니다')
    }

    return () => {
      if (hlsRef.current) {
        console.log('[Lecture] Cleanup: destroying HLS instance')
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [currentSectionId, currentSection, currentVideo, currentLanguage]) // Include all dependencies

  // Update URL when section or language changes
  const updateUrl = (sectionId: number, language: string) => {
    const params = new URLSearchParams()
    params.set("courseId", courseId || "")
    params.set("sectionId", sectionId.toString())
    params.set("subtitleLanguage", language)
    // Include locale in the URL path (모든 언어에 locale prefix 포함)
    router.push(`/${currentLocale}/course/lecture?${params.toString()}`)
  }

  // Handle section navigation
  const handleSectionChange = (sectionId: number) => {
    setCurrentSectionId(sectionId)
    updateUrl(sectionId, currentLanguage)

    // Save learning progress (for future "continue learning" feature)
    if (courseId) {
      localStorage.setItem(`course_${courseId}_lastSection`, sectionId.toString())
      localStorage.setItem(`course_${courseId}_lastLanguage`, currentLanguage)
    }
  }

  // Handle language change
  const handleLanguageChange = (language: string) => {
    console.log('[Lecture] ========== LANGUAGE CHANGE START ==========')
    console.log('[Lecture] Changing language to:', language)
    console.log('[Lecture] Available HLS audio tracks:', hlsRef.current?.audioTracks)
    console.log('[Lecture] Current section:', currentSection?.id)
    setCurrentLanguage(language)
    updateUrl(currentSectionId || 0, language)

    // First try HLS native track switching if available
    if (hlsRef.current && hlsRef.current.audioTracks && hlsRef.current.audioTracks.length > 0) {
      console.log('[Lecture] Using HLS native track switching')
      let trackIndex = -1

      if (language === 'origin' || language === 'ORIGIN') {
        // Find the ORIGIN track or default track
        trackIndex = hlsRef.current.audioTracks.findIndex(t =>
          t.name === 'ORIGIN' || t.lang === 'origin' || t.default
        )
        if (trackIndex === -1) {
          trackIndex = 0 // Use first track as origin
        }
      } else {
        // For other languages, find by lang code
        trackIndex = hlsRef.current.audioTracks.findIndex(t =>
          t.lang === language || t.name === language
        )
      }

      if (trackIndex >= 0) {
        console.log(`[Lecture] Switching to HLS audio track ${trackIndex} for language: ${language}`)
        hlsRef.current.audioTrack = trackIndex
        toast.success(`${langNameMap[language] || language}로 전환되었습니다`)
      } else {
        console.warn('[Lecture] Track not found in HLS for language:', language)
        toast.error(`${langNameMap[language] || language} 트랙을 찾을 수 없습니다`)
      }
    } else {
      // Fallback: try native audioTracks (Safari/iOS)
      const video = videoRef.current as any
      const audioTracks = video?.audioTracks
      if (audioTracks && typeof audioTracks.length === 'number') {
        let changed = false
        const targetLang = (language || 'origin').toLowerCase()
        for (let i = 0; i < audioTracks.length; i++) {
          const track = audioTracks[i]
          const trackLang = (track?.language || track?.lang || '').toLowerCase()
          const isOrigin = targetLang === 'origin'
          const shouldEnable = isOrigin ? (i === 0 || track?.default === true || trackLang === 'origin') : (trackLang === targetLang)
          if (typeof track.enabled === 'boolean') {
            track.enabled = shouldEnable
            if (shouldEnable) changed = true
          }
        }
        if (changed) {
          console.log('[Lecture] Switched native audio track to:', language)
          toast.success(`${langNameMap[language] || language}로 전환되었습니다`)
        } else {
          console.warn('[Lecture] Native audio track not found for language:', language)
          toast.error(`${langNameMap[language] || language} 트랙을 찾을 수 없습니다`)
        }
      } else {
        console.log('[Lecture] No HLS or native audioTracks available')
        toast.info(`${langNameMap[language] || language} 선택됨`)
      }
    }

    setShowLanguageSelector(false)
    console.log('[Lecture] ========== LANGUAGE CHANGE END ==========')
  }

  // Navigate to next/previous section
  const navigateSection = (direction: "next" | "prev") => {
    if (!courseData) return

    const currentIndex = courseData.sections.findIndex(s => s.id === currentSectionId)
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1

    if (newIndex >= 0 && newIndex < courseData.sections.length) {
      const newSection = courseData.sections[newIndex]
      if (newSection.active && newSection.videos.length > 0) {
        handleSectionChange(newSection.id)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    )
  }

  if (error) {
    console.error("[Lecture] Query error:", error)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-muted-foreground mb-2">강의를 불러올 수 없습니다.</div>
          <div className="text-sm text-muted-foreground">
            Course ID: {courseId || "없음"}
          </div>
          <div className="text-xs text-red-500 mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-muted-foreground mb-2">강의를 찾을 수 없습니다.</div>
          <div className="text-sm text-muted-foreground">
            Course ID: {courseId || "없음"}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hide in WebView */}
      {!isInWebView && (
        <div className={`${isSidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden border-r bg-card`}>
        <div className="p-4 border-b space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${currentLocale}/course/${courseId}`)}
            className="w-full justify-start gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            강의 소개로 돌아가기
          </Button>
          <div>
            <h2 className="font-semibold text-lg truncate">{courseData.title}</h2>
            <div className="text-sm text-muted-foreground mt-1">
              {courseData.sections.filter(s => s.active).length}개 수업
            </div>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {courseData.sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => section.active && section.videos.length > 0 && handleSectionChange(section.id)}
              disabled={!section.active || section.videos.length === 0}
              className={`w-full text-left p-4 border-b transition-colors ${
                currentSectionId === section.id
                  ? "bg-primary/10 border-l-4 border-l-primary"
                  : "hover:bg-muted/50"
              } ${
                !section.active || section.videos.length === 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-sm font-medium text-muted-foreground min-w-[24px]">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{section.title}</div>
                  {section.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {section.description}
                    </div>
                  )}
                  {section.dubTracks && section.dubTracks.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {section.dubTracks.map(track => (
                        <span
                          key={track.lang}
                          className="text-xs px-1.5 py-0.5 bg-muted rounded"
                        >
                          {langNameMap[track.lang] || track.lang}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Video Player or WebView List */}
        <div className="flex-1 relative bg-black">
          {currentSection && currentVideo ? (
            isInWebView ? (
              // WebView mode - show video list instead of player
              <div className="bg-background h-full overflow-auto p-4">
                <WebViewVideoList
                  videos={courseData.sections
                    .filter(s => s.active && s.videos.length > 0)
                    .map(s => {
                      const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
                      const masterUrl = `${cdn.replace(/\/$/, "")}/assets/curriculumsection/${s.id}/master.m3u8`

                      // Process dubTracks to ensure they have complete URLs
                      const processedDubTracks = s.dubTracks?.map(track => {
                        // If the track URL is relative, make it absolute
                        let trackUrl = track.url
                        if (trackUrl && !trackUrl.startsWith('http')) {
                          trackUrl = `${cdn.replace(/\/$/, "")}${trackUrl.startsWith('/') ? '' : '/'}${trackUrl}`
                        }
                        return {
                          ...track,
                          url: trackUrl
                        }
                      }) || []

                      return {
                        id: s.id.toString(),
                        title: s.title,
                        url: masterUrl,
                        duration: undefined,
                        completed: false,
                        dubTracks: processedDubTracks,
                        sectionId: s.id // Keep section ID for constructing URLs
                      }
                    })}
                  currentVideoId={currentSectionId?.toString()}
                  courseTitle={courseData.title}
                />
              </div>
            ) : (
              // Normal web mode - show video player
              <video
                ref={videoRef}
                controls
                playsInline
                webkit-playsinline="true"
                autoPlay={false}
              preload="auto"
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
              onLoadStart={() => console.log('[Lecture] Video load started')}
              onLoadedData={() => console.log('[Lecture] Video data loaded')}
              onLoadedMetadata={() => console.log('[Lecture] Video metadata loaded')}
              onCanPlay={() => console.log('[Lecture] Video can play')}
              onError={(e) => {
                console.error('[Lecture] Video element error:', e)
                const video = e.currentTarget
                if (video.error) {
                  console.error('[Lecture] Video error code:', video.error.code)
                  console.error('[Lecture] Video error message:', video.error.message)
                }
              }}
            />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="mb-2">섹션을 선택해주세요</div>
                <div className="text-sm text-gray-400">
                  {!currentSection && "섹션이 선택되지 않았습니다"}
                  {currentSection && !currentVideo && "이 섹션에는 비디오가 없습니다"}
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 z-10 p-2 bg-black/70 hover:bg-black/90 text-white rounded-md transition-colors"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Language Selector */}
          {audioTracks.length > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <div className="relative">
                <button
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                  className="bg-black/70 hover:bg-black/90 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-md text-xs md:text-sm font-medium transition-colors flex items-center gap-1 md:gap-2"
                >
                  <Languages className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">{langNameMap[currentLanguage] || currentLanguage}</span>
                  <span className="sm:hidden">{(langNameMap[currentLanguage] || currentLanguage).slice(0, 2).toUpperCase()}</span>
                </button>

                {showLanguageSelector && (
                  <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-md rounded-md overflow-hidden shadow-xl border border-white/20 min-w-[160px]">
                    {[...audioTracks]
                      .sort((a, b) => {
                        // Check if either track is "origin" (case-insensitive)
                        const aIsOrigin = a.lang.toLowerCase() === "origin"
                        const bIsOrigin = b.lang.toLowerCase() === "origin"

                        if (aIsOrigin) return -1
                        if (bIsOrigin) return 1

                        // Sort other languages alphabetically by label
                        return (a.label || a.lang).localeCompare(b.label || b.lang)
                      })
                      .map((track) => (
                        <button
                          key={track.lang}
                          onClick={() => {
                            handleLanguageChange(track.lang)
                            setShowLanguageSelector(false)
                          }}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            currentLanguage === track.lang
                              ? "bg-primary/80 text-primary-foreground"
                              : "text-white hover:bg-white/10"
                          }`}
                        >
                          {track.label}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="border-t bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateSection("prev")}
                disabled={
                  !courseData ||
                  courseData.sections.findIndex(s => s.id === currentSectionId) === 0
                }
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateSection("next")}
                disabled={
                  !courseData ||
                  courseData.sections.findIndex(s => s.id === currentSectionId) ===
                  courseData.sections.length - 1
                }
              >
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex-1 text-center">
              <h3 className="font-medium">{currentSection?.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.group('[Lecture] Debug Info')
                  console.log('Current Section:', currentSection)
                  console.log('Current Video:', currentVideo)
                  console.log('Section ID:', currentSectionId)
                  console.log('CDN URL:', process.env.NEXT_PUBLIC_CDN_URL)
                  console.log('Master URL:', `${process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"}/assets/curriculumsection/${currentSectionId}/master.m3u8`)
                  console.log('Video Ref:', videoRef.current)
                  console.log('HLS Instance:', hlsRef.current)
                  console.log('Audio Tracks:', audioTracks)
                  console.groupEnd()
                }}
                className="text-xs ml-2"
              >
                디버그
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {currentSection?.files && currentSection.files.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Download files
                    currentSection.files.forEach(file => {
                      const a = document.createElement("a")
                      a.href = file.url
                      a.download = file.filename
                      a.click()
                    })
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  자료 ({currentSection.files.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}