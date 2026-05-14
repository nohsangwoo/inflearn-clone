"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Props = {
  src: string
  title: string
  label?: string
  variant?: "button" | "link"
}

export default function FreePreviewPlayerModal({ src, title, label = "무료 공개 보기", variant = "button" }: Props) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!open || !videoRef.current) return
    const video = videoRef.current
    setError(null)

    if (src.endsWith(".m3u8") && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setError("무료 공개 영상을 불러오지 못했습니다.")
      })
      return () => hls.destroy()
    }

    video.src = src
    return () => {
      video.removeAttribute("src")
      video.load()
    }
  }, [open, src])

  return (
    <>
      <Button
        type="button"
        size={variant === "link" ? "sm" : "default"}
        variant={variant === "link" ? "ghost" : "secondary"}
        className={variant === "link" ? "h-auto rounded-full px-2 py-1 text-primary" : "w-full rounded-full"}
        onClick={() => setOpen(true)}
      >
        <PlayCircle className="size-4" />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>무료 공개로 설정된 강의 영상을 재생합니다.</DialogDescription>
          </DialogHeader>
          <div className="aspect-video overflow-hidden rounded-[14px] bg-black">
            <video ref={videoRef} controls autoPlay playsInline className="h-full w-full">
              브라우저가 비디오 재생을 지원하지 않습니다.
            </video>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
