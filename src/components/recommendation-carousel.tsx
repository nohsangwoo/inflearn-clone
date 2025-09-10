"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Course = { id: string; title: string; thumbnail: string; author?: string; price?: string }

export function RecommendationCarousel({ items }: { items: Course[] }) {
  const visibleItems = items.slice(0, 20)
  const [viewportRef, embla] = useEmblaCarousel({ dragFree: true, loop: false, align: "start" })

  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla])

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">추천 강의</h2>
        <div className="hidden sm:flex gap-2">
          <Button size="sm" variant="outline" onClick={scrollPrev} aria-label="이전">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={scrollNext} aria-label="다음">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={viewportRef}>
        <div className="flex gap-4">
          {visibleItems.map((c) => (
            <div
              key={c.id}
              className="shrink-0 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
            >
              <div className="rounded-lg border overflow-hidden bg-card h-full">
                <div className="aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-sm font-medium line-clamp-2 min-h-10">{c.title}</div>
                  {c.author && <div className="text-xs text-muted-foreground">{c.author}</div>}
                  {c.price && <div className="text-sm font-semibold">{c.price}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RecommendationCarousel


