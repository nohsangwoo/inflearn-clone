"use client"

import { useMemo, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Heart, ShoppingCart, PlayCircle, Star, Users } from "lucide-react"
import HlsPlayerModal from "@/components/video/shaka-player-modal"

type Detail = {
  id: number
  title: string
  description: string | null
  price: number
  discountPrice?: number | null
  imageUrl?: string | null
  createdAt: string
  instructor: { id: number; email: string; nickname?: string | null; profileImageUrl?: string | null }
  purchaseCount: number
  reviewCount: number
  avgRating: number
  likeCount: number
  previewSectionId: number | null
  previewSectionTitle: string | null
  sections: { id: number; title: string; active: boolean; hasVideo: boolean }[]
}

type ReviewItem = {
  id: number
  content: string
  rating: number
  createdAt: string
  user?: { id: number; nickname?: string | null; email: string }
  parentId?: number | null
  replies?: ReviewItem[]
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>()
  const lectureId = Number(params?.id)
  const router = useRouter()
  const [like, setLike] = useState(false)
  const [inCart, setInCart] = useState(false)

  const { data: detail, isLoading } = useQuery({
    queryKey: ["course-detail", lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}`)
      return data as Detail
    },
  })

  // 초기 좋아요/장바구니 상태
  useQuery({
    queryKey: ["course-like", lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}/like`)
      setLike(Boolean(data?.liked))
      return data as { liked: boolean }
    },
  })
  useQuery({
    queryKey: ["course-cart", lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}/cart`)
      setInCart(Boolean(data?.inCart))
      return data as { inCart: boolean }
    },
  })

  const priceText = useMemo(() => {
    if (!detail) return ""
    const hasDiscount = typeof detail.discountPrice === "number" && (detail.discountPrice as number) < detail.price
    const effective = hasDiscount ? (detail.discountPrice as number) : detail.price
    return effective === 0 ? "무료" : `₩${effective.toLocaleString()}`
  }, [detail])

  // 액션
  const addToCart = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/courses/${lectureId}/cart`)
      return data as { inCart: boolean }
    },
    onSuccess: (res) => setInCart(Boolean(res?.inCart)),
  })
  const likeToggle = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/courses/${lectureId}/like`)
      return data as { liked: boolean }
    },
    onSuccess: (res) => setLike(Boolean(res?.liked)),
  })
  const purchase = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/courses/${lectureId}/purchase`)
    },
    onSuccess: () => {
      // 결제 연동 전: 임시로 수강 페이지 이동 혹은 토스트 등을 넣을 수 있음
    },
  })

  if (isLoading || !detail) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-sm text-muted-foreground">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* 헤더 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold leading-tight">{detail.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-foreground">{detail.avgRating?.toFixed(1)}</span>
                <span>({detail.reviewCount})</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>수강생 {detail.purchaseCount.toLocaleString()}명</span>
              </div>
              <span className="hidden sm:inline">·</span>
              <div className="inline-flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={detail.instructor.profileImageUrl || "/avatar.png"} alt={detail.instructor.nickname || detail.instructor.email} />
                  <AvatarFallback>AU</AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[200px]">{detail.instructor.nickname || detail.instructor.email}</span>
              </div>
            </div>
            {detail.description && (
              <p className="text-sm text-foreground/90 whitespace-pre-line">{detail.description}</p>
            )}
          </div>

          <Separator />

          {/* 커리큘럼 요약 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">커리큘럼</h2>
              {detail.previewSectionId && (
                <HlsPlayerModal sectionId={detail.previewSectionId} title={detail.previewSectionTitle || "미리보기"} />
              )}
            </div>
            <div className="divide-y rounded-md border">
              {detail.sections.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">커리큘럼이 아직 없습니다.</div>
              ) : (
                detail.sections.map((s) => (
                  <div key={s.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.title}</div>
                      {!s.active && <div className="text-xs text-muted-foreground">비공개</div>}
                    </div>
                    {s.hasVideo && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => {}}>
                        <PlayCircle className="h-4 w-4" />
                        미리보기
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          {/* 리뷰 영역 (목록 + 작성) */}
          <Reviews lectureId={detail.id} />
        </div>

        {/* 우측 플로팅 카드 */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="text-2xl font-bold">{priceText}</div>
                {typeof detail.discountPrice === "number" && (detail.discountPrice as number) < detail.price && (
                  <div className="text-xs text-muted-foreground">정가 ₩{detail.price.toLocaleString()}</div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => purchase.mutate()} disabled={purchase.isPending}>수강 신청</Button>
                  <Button variant={inCart ? "secondary" : "outline"} className="flex-1" onClick={() => addToCart.mutate()} disabled={addToCart.isPending}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> {inCart ? "담김" : "장바구니"}
                  </Button>
                </div>
                <Button variant={like ? "secondary" : "outline"} className="w-full" onClick={() => likeToggle.mutate()} disabled={likeToggle.isPending}>
                  <Heart className={`h-4 w-4 mr-2 ${like ? "fill-current" : ""}`} /> {like ? "좋아요 취소" : "좋아요"}
                </Button>
                {detail.description && (
                  <div className="text-sm text-muted-foreground line-clamp-4">{detail.description}</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function Reviews({ lectureId }: { lectureId: number }) {
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(5)

  const { data: list, refetch } = useQuery({
    queryKey: ["reviews", lectureId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}/reviews`)
      return data as ReviewItem[]
    },
  })

  const addReview = useMutation({
    mutationFn: async () => {
      await axios.post(`/api/courses/${lectureId}/reviews`, { content, rating })
    },
    onSuccess: () => {
      setContent("")
      refetch()
    },
  })

  const addReply = useMutation({
    mutationFn: async ({ parentId, content: replyContent }: { parentId: number; content: string }) => {
      await axios.post(`/api/reviews/${parentId}/replies`, { content: replyContent })
    },
    onSuccess: () => {
      refetch()
    },
  })

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">리뷰</h2>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value) || 5)}
            className="border rounded px-2 py-1 text-sm bg-background"
          >
            {[5,4,3,2,1].map((r) => (
              <option key={r} value={r}>{r}점</option>
            ))}
          </select>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="리뷰를 작성하세요"
            className="flex-1 border rounded px-2 py-1 text-sm bg-background"
          />
          <Button size="sm" onClick={() => addReview.mutate()}>등록</Button>
        </div>
        <div className="divide-y rounded-md border">
          {(list ?? []).length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">아직 리뷰가 없습니다.</div>
          ) : (
            (list ?? []).map((rv) => (
              <div key={rv.id} className="p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{rv.rating}</span>
                  <span className="text-muted-foreground">· {new Date(rv.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm whitespace-pre-line">{rv.content}</div>
                {/* 대댓글 1뎁스 */}
                <div className="pl-3 border-l space-y-2">
                  {(rv.replies ?? []).map((rep) => (
                    <div key={rep.id} className="text-sm text-foreground/90">
                      <span className="text-xs text-muted-foreground mr-1">답글</span>
                      {rep.content}
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="답글 작성"
                      className="flex-1 border rounded px-2 py-1 text-xs bg-background"
                      onKeyDown={(e) => {
                        const v = (e.target as HTMLInputElement).value
                        if (e.key === "Enter" && v.trim()) {
                          addReply.mutate({ parentId: rv.id, content: v.trim() })
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


