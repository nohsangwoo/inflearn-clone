"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type CourseItem = {
  id: string
  title: string
  thumbnail: string
  author: string
  price: string
  originalPrice?: string
  discountPercent?: number
  summary: string
  tags?: string[]
}

export function CourseCard({ course }: { course: CourseItem }) {
  const [liked, setLiked] = useState(false)
  const pathname = usePathname()

  // URL에서 현재 locale 추출
  const currentLocale = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]
    const locales = [
      'ko', 'en', 'ja', 'vi', 'ru', 'zh', 'zh-CN', 'zh-TW',
      'fr', 'de', 'es', 'pt', 'it', 'id', 'th', 'hi',
      'ar', 'tr', 'pl', 'uk'
    ]
    return locales.includes(firstSegment) ? firstSegment : 'ko'
  }, [pathname])

  // locale을 포함한 경로 생성
  const courseUrl = currentLocale === 'ko' ? `/course/${course.id}` : `/${currentLocale}/course/${course.id}`

  return (
    <Link href={courseUrl} className="block h-full">
      <Card className="group h-full overflow-hidden">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute top-2 right-2 z-10">
            <Button
              onClick={(e) => { e.preventDefault(); setLiked((v) => !v) }}
              variant={liked ? "secondary" : "outline"}
              size="sm"
              className="rounded-full bg-background/80 backdrop-blur"
              aria-label="좋아요"
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-base leading-tight line-clamp-2 min-h-10">
            {course.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="size-6">
              <AvatarImage src="/avatar.png" alt={course.author} />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <span>{course.author}</span>
          </div>
          <p className="text-sm text-foreground/90 line-clamp-3 min-h-[3.75rem]">{course.summary}</p>
          {course.tags && (
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 3).map((t) => (
                <span key={t} className="rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex-1 min-w-0 flex items-baseline gap-1">
              <span className="text-sm font-semibold whitespace-nowrap">{course.price}</span>
              {course.originalPrice && (
                <span className="text-[11px] text-muted-foreground line-through whitespace-nowrap">{course.originalPrice}</span>
              )}
              {typeof course.discountPercent === "number" && course.discountPercent > 0 && (
                <span className="text-[10px] font-semibold text-green-700 bg-green-50 rounded px-1 py-0.5 whitespace-nowrap">-{course.discountPercent}%</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="sm" aria-label="담기" className="px-2" onClick={(e) => { e.preventDefault() }}>
                <ShoppingCart className="h-4 w-4 mr-0 xs:mr-2" />
                <span className="hidden xs:inline">담기</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default CourseCard


