'use client'

import { Play, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Video {
  id: string
  title: string
  duration?: string
  url: string
  thumbnail?: string
  completed?: boolean
}

interface WebViewVideoListProps {
  videos: Video[]
  currentVideoId?: string
  courseTitle?: string
}

export function WebViewVideoList({ videos, currentVideoId, courseTitle }: WebViewVideoListProps) {
  const handlePlayVideo = (video: Video) => {
    try {
      // Send video info to Flutter app
      const videoData = {
        id: video.id,
        title: video.title,
        url: video.url,
        courseTitle: courseTitle || 'Course',
      }

      // Try JavaScript channel first (preferred method)
      const lingoostVideoPlayer = (window as any).LingoostVideoPlayer
      if (lingoostVideoPlayer && typeof lingoostVideoPlayer.postMessage === 'function') {
        const params = new URLSearchParams({
          url: video.url,
          title: video.title,
          courseTitle: courseTitle || '',
        })
        lingoostVideoPlayer.postMessage(params.toString())
        console.log('[WebViewVideoList] Sent via JavaScript channel:', videoData)
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

                <Button
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlayVideo(video)
                  }}
                >
                  <Play className="h-4 w-4 mr-1" />
                  재생
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}