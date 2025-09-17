"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlayCircle } from "lucide-react"
import { useState } from "react"

interface OriginalPlayerProps {
  videoUrl: string
  title?: string
}

export default function OriginalPlayer({ videoUrl, title }: OriginalPlayerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // CDN URL 구성
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
  const videoSrc = /^(https?:)?\/\//.test(videoUrl) ? videoUrl : `${cdnBase}/${videoUrl}`

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <PlayCircle className="h-4 w-4" />
        원본 재생
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title || "원본 영상"}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            <video
              controls
              autoPlay
              className="w-full h-full rounded-md"
              src={videoSrc}
            >
              <source src={videoSrc} type="video/mp4" />
              브라우저가 비디오 재생을 지원하지 않습니다.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}