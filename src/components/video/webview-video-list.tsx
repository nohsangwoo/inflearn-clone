'use client'

import { useState } from 'react'
import { Play, Clock, CheckCircle, Languages, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Video {
  id: string
  title: string
  duration?: string
  url: string
  thumbnail?: string
  completed?: boolean
  dubTracks?: Array<{
    lang: string
    status: string
    url: string
  }>
  sectionId?: number
}

interface WebViewVideoListProps {
  videos: Video[]
  currentVideoId?: string
  courseTitle?: string
}

const langNameMap: Record<string, string> = {
  origin: '원본',
  ORIGIN: '원본',
  ko: '한국어',
  en: '영어',
  ja: '일본어',
  zh: '중국어',
  es: '스페인어',
  fr: '프랑스어',
  de: '독일어',
  ru: '러시아어',
  pt: '포르투갈어',
  it: '이탈리아어',
  ar: '아랍어',
  hi: '힌디어',
  th: '태국어',
  vi: '베트남어',
  id: '인도네시아어',
}

export function WebViewVideoList({ videos, currentVideoId, courseTitle }: WebViewVideoListProps) {
  // Track selected language for each video
  const [selectedLanguages, setSelectedLanguages] = useState<Record<string, string>>({});
  const handlePlayVideo = (video: Video) => {
    try {
      // Get selected language for this video
      const selectedLang = selectedLanguages[video.id] || 'origin'

      // Build the playback URL based on selected language
      let playbackUrl = video.url // Default to master URL
      const cdn = process.env.NEXT_PUBLIC_CDN_URL ?? 'https://storage.lingoost.com'
      const ensureAbsolute = (u: string) => {
        if (!u) return u
        if (u.startsWith('http')) return u
        return `${cdn.replace(/\/$/, '')}${u.startsWith('/') ? '' : '/'}${u}`
      }
      const candidates: string[] = []

      // Try to construct a language-specific playlist URL
      if (selectedLang !== 'origin' && video.url.includes('/master.m3u8')) {
        // Replace master.m3u8 with language-specific playlist if pattern exists
        // Common patterns: master_ko.m3u8, playlist_ko.m3u8, ko/master.m3u8
        const baseUrl = video.url.replace('/master.m3u8', '')

        // Derive strong candidate and also set as playbackUrl hint
        const primaryLangMaster = `${baseUrl}/master_${selectedLang}.m3u8`
        playbackUrl = primaryLangMaster

        // Additional patterns to try
        const patternUrls = [
          primaryLangMaster,
          `${baseUrl}/playlist_${selectedLang}.m3u8`,
          `${baseUrl}/${selectedLang}/master.m3u8`,
          `${baseUrl}/dub_${selectedLang}.m3u8`,
          // NOTE: audio-only playlists like /dubTracks/{lang}.m3u8 are intentionally excluded
        ]
        patternUrls.forEach(u => candidates.push(u))

        console.log('[WebViewVideoList] Candidate lang-specific URLs:', patternUrls)
      }

      // Log for debugging
      console.log('[WebViewVideoList] Video URL (master):', video.url)
      console.log('[WebViewVideoList] Playback URL:', playbackUrl)
      if (video.dubTracks) {
        console.log('[WebViewVideoList] Available dub tracks:', video.dubTracks)
      }
      console.log('[WebViewVideoList] Selected language:', selectedLang)

      // Send video info to Flutter app
      const videoData = {
        id: video.id,
        title: video.title,
        url: playbackUrl,
        masterUrl: video.url, // Keep master URL as backup
        courseTitle: courseTitle || 'Course',
        selectedLanguage: selectedLang,
        dubTracks: (video.dubTracks || []).map(t => ({ ...t, url: ensureAbsolute(t.url) })), // absolute urls
        sectionId: video.sectionId,
        candidates: candidates,
      }

      // Try JavaScript channel first (preferred method)
      const lingoostVideoPlayer = (window as any).LingoostVideoPlayer
      if (lingoostVideoPlayer && typeof lingoostVideoPlayer.postMessage === 'function') {
        // Send as JSON string with playback URL and selected language
        const message = JSON.stringify({
          url: playbackUrl,
          masterUrl: video.url,
          title: video.title,
          courseTitle: courseTitle || '',
          selectedLanguage: selectedLang,
          dubTracks: (video.dubTracks || []).map(t => ({ ...t, url: ensureAbsolute(t.url) })),
          candidates: candidates,
        })
        lingoostVideoPlayer.postMessage(message)
        console.log('[WebViewVideoList] Sent via JavaScript channel:', videoData)
        console.log('[WebViewVideoList] DubTracks:', video.dubTracks)
        return
      }

      // Fallback methods
      const flutterWebView = (window as any).flutter_inappwebview
      if (flutterWebView && typeof flutterWebView.callHandler === 'function') {
        flutterWebView.callHandler('playVideo', videoData)
        console.log('[WebViewVideoList] Sent via flutter_inappwebview:', videoData)
        return
      }

      // Also try LingoostApp method
      const lingoostApp = (window as any).LingoostApp
      if (lingoostApp && typeof lingoostApp.playVideo === 'function') {
        lingoostApp.playVideo(videoData)
        console.log('[WebViewVideoList] Sent via LingoostApp:', videoData)
        return
      }

      // Final fallback: Use custom event
      const event = new CustomEvent('lingoost-play-video', {
        detail: videoData
      })
      window.dispatchEvent(event)
      console.log('[WebViewVideoList] Sent via custom event:', videoData)
    } catch (e) {
      console.error('[WebViewVideoList] Failed to trigger native playback:', e)
    }
  }

  return (
    <div className="w-full space-y-2">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          📱 앱 전용 재생 모드입니다. 비디오를 클릭하면 네이티브 플레이어에서 재생됩니다.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => handlePlayVideo({
            id: 'test',
            title: 'Test Video - Big Buck Bunny',
            url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            duration: '00:33',
            completed: false
          })}
        >
          테스트 영상 재생 (Big Buck Bunny)
        </Button>
      </div>

      <div className="space-y-2">
        {videos.map((video) => {
          const isActive = video.id === currentVideoId

          return (
            <Card
              key={video.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                isActive ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => handlePlayVideo(video)}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  {video.thumbnail ? (
                    <div className="relative w-20 h-14 bg-muted rounded overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-14 bg-muted rounded flex items-center justify-center">
                      <Play className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm mb-1 line-clamp-2 ${
                    isActive ? 'text-primary' : ''
                  }`}>
                    {video.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {video.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {video.duration}
                      </span>
                    )}
                    {video.completed && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        완료
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Language Selection Dropdown */}
                  {video.dubTracks && video.dubTracks.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Languages className="h-3 w-3" />
                          <span className="text-xs">
                            {langNameMap[selectedLanguages[video.id] || 'origin'] || '원본'}
                          </span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[120px]">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLanguages(prev => ({ ...prev, [video.id]: 'origin' }))
                          }}
                        >
                          <span className={selectedLanguages[video.id] === 'origin' || !selectedLanguages[video.id] ? 'font-semibold' : ''}>
                            원본
                          </span>
                        </DropdownMenuItem>
                        {video.dubTracks.map((track) => (
                          <DropdownMenuItem
                            key={track.lang}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLanguages(prev => ({ ...prev, [video.id]: track.lang }))
                            }}
                          >
                            <span className={selectedLanguages[video.id] === track.lang ? 'font-semibold' : ''}>
                              {langNameMap[track.lang] || track.lang}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {/* Play Button */}
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="gap-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayVideo(video)
                    }}
                  >
                    <Play className="h-4 w-4" />
                    재생
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}