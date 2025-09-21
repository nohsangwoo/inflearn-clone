"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
  likeCount?: number
}

export function CourseCard({ course }: { course: CourseItem }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(course.likeCount || 0)
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const courseId = Number(course.id)

  // URL에서 현재 locale 추출
  const currentLocale = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    const firstSegment = segments[0]
    const locales = [
      "ko", "en", "ja", "vi", "ru", "zh", "zh-CN", "zh-TW",
      "fr", "de", "es", "pt", "it", "id", "th", "hi",
      "ar", "tr", "pl", "uk"
    ]
    return locales.includes(firstSegment) ? firstSegment : "ko"
  }, [pathname])

  // locale을 포함한 경로 생성
  const courseUrl = currentLocale === "ko" ? `/course/${course.id}` : `/${currentLocale}/course/${course.id}`

  // 초기 좋아요 상태 확인
  const { data: likeData } = useQuery({
    queryKey: ["course-like", courseId],
    enabled: Number.isFinite(courseId),
    queryFn: async () => {
      try {
        const { data } = await axios.get(`/api/courses/${courseId}/like`)
        return data as { liked: boolean }
      } catch (error) {
        console.error("Failed to fetch like status:", error)
        return { liked: false }
      }
    },
  })

  // likeData가 변경될 때 liked 상태 업데이트
  useEffect(() => {
    if (likeData) {
      setLiked(Boolean(likeData.liked))
    }
  }, [likeData])

  // 좋아요 토글 mutation
  const likeToggle = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/courses/${courseId}/like`)
      return data as { liked: boolean }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["course-like", courseId] })

      // Save previous values
      const previousLiked = liked
      const previousLikeCount = likeCount

      // Optimistic update
      const newLikedState = !liked
      setLiked(newLikedState)
      setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1))

      return { previousLiked, previousLikeCount }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context) {
        setLiked(context.previousLiked)
        setLikeCount(context.previousLikeCount)
      }
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ["course-like", courseId] })
    },
    onSuccess: (res) => {
      setLiked(Boolean(res?.liked))
    },
  })

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    likeToggle.mutate()
  }

  return (
    <Link href={courseUrl} className="block h-full">
      <Card className="group h-full overflow-hidden">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <div className="absolute top-2 right-2 z-10">
            <Button
              onClick={handleLikeClick}
              variant={liked ? "secondary" : "outline"}
              size="sm"
              className="rounded-full bg-background/80 backdrop-blur"
              aria-label="좋아요"
              disabled={likeToggle.isPending}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current text-red-500" : ""}`} />
              {likeCount > 0 && (
                <span className="ml-1 text-xs">{likeCount}</span>
              )}
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
