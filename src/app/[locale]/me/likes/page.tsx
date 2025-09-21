'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2, AlertCircle, BookOpen } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

interface Instructor {
  id: number
  nickname: string | null
  email: string
  profileImageUrl: string | null
}

interface Lecture {
  id: number
  title: string
  description: string | null
  price: number
  discountPrice: number | null
  imageUrl: string | null
  instructor: Instructor | null
}

interface Like {
  id: number
  createdAt: string
  lecture: Lecture | null
}

interface LikesResponse {
  likes: Like[]
}


// URL 유효성 검증 함수
const getValidImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  try {
    // 절대 경로인 경우 그대로 사용
    if (url.startsWith("/")) return url
    // http/https URL인 경우 유효성 검증
    new URL(url)
    return url
  } catch {
    // 잘못된 URL인 경우 null 반환
    return null
  }
}

export default function MeLikesPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery<LikesResponse>({
    queryKey: ['myLikes'],
    queryFn: async () => {
      const response = await axios.get('/api/me/likes')
      return response.data
    }
  })

  const unlikeMutation = useMutation({
    mutationFn: async (lectureId: number) => {
      await axios.delete(`/api/me/likes?lectureId=${lectureId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLikes'] })
      toast.success('좋아요가 취소되었습니다.')
    },
    onError: () => {
      toast.error('좋아요 취소에 실패했습니다.')
    }
  })

  const handleUnlike = (lectureId: number) => {
    if (confirm('정말로 좋아요를 취소하시겠습니까?')) {
      unlikeMutation.mutate(lectureId)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">오류가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground">
          좋아요 목록을 불러올 수 없습니다.
        </p>
      </div>
    )
  }

  const likes = data?.likes || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">좋아요</h1>
        <p className="text-sm text-muted-foreground mt-1">
          좋아요한 강의 {likes.length}개
        </p>
      </div>

      {likes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">좋아요한 강의가 없습니다</h3>
            <p className="text-sm text-muted-foreground mb-4">
              관심 있는 강의에 좋아요를 눌러보세요
            </p>
            <Button asChild>
              <Link href="/">
                <BookOpen className="mr-2 h-4 w-4" />
                강의 둘러보기
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {likes.map((like) => {
            const lecture = like.lecture
            if (!lecture) return null

            const finalPrice = lecture.discountPrice || lecture.price
            const hasDiscount = lecture.discountPrice && lecture.discountPrice < lecture.price

            const validImageUrl = getValidImageUrl(lecture.imageUrl)
            const validInstructorImageUrl = getValidImageUrl(lecture.instructor?.profileImageUrl)

            return (
              <Card key={like.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/course/${lecture.id}`}>
                  <div className="relative aspect-[16/9] bg-muted">
                    {validImageUrl ? (
                      <Image
                        src={validImageUrl}
                        alt={lecture.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </Link>

                <CardContent className="p-4">
                  <Link href={`/course/${lecture.id}`}>
                    <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
                      {lecture.title}
                    </h3>
                  </Link>

                  {lecture.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {lecture.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    {validInstructorImageUrl ? (
                      <Image
                        src={validInstructorImageUrl}
                        alt={lecture.instructor?.nickname || lecture.instructor?.email || '강사 정보 없음'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {(lecture.instructor?.nickname || lecture.instructor?.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {lecture.instructor?.nickname || lecture.instructor?.email || '강사 정보 없음'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {hasDiscount && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm line-through text-muted-foreground">
                            {formatPrice(lecture.price)}
                          </span>
                          <span className="text-xs font-semibold text-destructive">
                            {Math.round(((lecture.price - finalPrice) / lecture.price) * 100)}% 할인
                          </span>
                        </div>
                      )}
                      <div className="text-lg font-bold">
                        {formatPrice(finalPrice)}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault()
                        handleUnlike(lecture.id)
                      }}
                      disabled={unlikeMutation.isPending}
                    >
                      {unlikeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4 fill-current text-destructive" />
                      )}
                      <span className="sr-only">좋아요 취소</span>
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground mt-3">
                    {formatDistanceToNow(new Date(like.createdAt), {
                      addSuffix: true,
                      locale: ko
                    })} 좋아요
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}