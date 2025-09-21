'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Heart,
  ShoppingCart,
  Star,
  Users,
  BookOpen,
} from 'lucide-react'
import HlsPlayerModal from '@/components/video/shaka-player-modal'
import { getTranslation, useLocale } from '@/lib/translations'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'

type Detail = {
  id: number
  title: string
  description: string | null
  price: number
  discountPrice?: number | null
  imageUrl?: string | null
  createdAt: string
  instructor: {
    id: number
    email: string
    nickname?: string | null
    profileImageUrl?: string | null
  }
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

export default function CourseDetailPageWrapper() {
  const params = useParams<{ id: string }>()
  const lectureId = Number(params?.id)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale(pathname)
  const t = getTranslation(locale).course
  const queryClient = useQueryClient()
  const [like, setLike] = useState(false)
  const [inCart, setInCart] = useState(false)
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const widgetsRef = useRef<unknown>(null)
  const orderRef = useRef<{
    orderId: string
    orderName: string
    amount: number
    successUrl: string
    failUrl: string
  } | null>(null)

  const { data: detail, isLoading } = useQuery({
    queryKey: ['course-detail', lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}`)
      return data as Detail
    },
  })

  // 구매 여부
  const { data: purchasedRes } = useQuery({
    queryKey: ['course-purchased', lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/purchased`, { params: { lectureId } })
      return data as { purchased: boolean }
    },
  })

  console.log("purchasedRes: ",purchasedRes)
  const purchased = Boolean(purchasedRes?.purchased)

  // 초기 좋아요/장바구니 상태
  useQuery({
    queryKey: ['course-like', lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}/like`)
      setLike(Boolean(data?.liked))
      return data as { liked: boolean }
    },
  })
  useQuery({
    queryKey: ['course-cart', lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}/cart`)
      setInCart(Boolean(data?.inCart))
      return data as { inCart: boolean }
    },
  })

  const priceText = useMemo(() => {
    if (!detail) return ''
    const hasDiscount =
      typeof detail.discountPrice === 'number' &&
      (detail.discountPrice as number) < detail.price
    const effective = hasDiscount
      ? (detail.discountPrice as number)
      : detail.price
    return effective === 0 ? t.free : `₩${effective.toLocaleString()}` // "무료"
  }, [detail, t.free])

  // 액션
  const addToCart = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/courses/${lectureId}/cart`)
      return data as { inCart: boolean }
    },
    onSuccess: res => setInCart(Boolean(res?.inCart)),
  })
  const likeToggle = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/courses/${lectureId}/like`)
      return data as { liked: boolean }
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['course-detail', lectureId] })

      // Save previous values
      const previousLike = like
      const previousDetail = queryClient.getQueryData<Detail>(['course-detail', lectureId])

      // Optimistic update
      const newLikeState = !like
      setLike(newLikeState)

      // Update the cached detail with new like count
      if (previousDetail) {
        const updatedDetail = {
          ...previousDetail,
          likeCount: newLikeState
            ? previousDetail.likeCount + 1
            : Math.max(0, previousDetail.likeCount - 1)
        }
        queryClient.setQueryData(['course-detail', lectureId], updatedDetail)
      }

      return { previousLike, previousDetail }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context) {
        setLike(context.previousLike)
        if (context.previousDetail) {
          queryClient.setQueryData(['course-detail', lectureId], context.previousDetail)
        }
      }
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ['course-detail', lectureId] })
    },
    onSuccess: res => setLike(Boolean(res?.liked)),
  })
  const purchase = useMutation({
    mutationFn: async () => {
      if (!detail) return
      console.log('[Purchase] creating order for lecture', detail.id)
      // 1) 서버에서 주문 생성
      const { data: order } = await axios.post(`/api/payments/orders`, {
        lectureId: detail.id,
        force: true,
      })

      // 2) 결제 위젯 호출 (Redirect 방식)
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      if (!clientKey) {
        console.error('[Purchase] missing env NEXT_PUBLIC_TOSS_CLIENT_KEY')
        alert('결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요. (clientKey)')
        return
      }

      const toss = await loadTossPayments(clientKey)
      const widgets = toss.widgets({ customerKey: ANONYMOUS })

      const successUrl = `${window.location.origin}/${locale}/payments/success`
      const failUrl = `${window.location.origin}/${locale}/payments/fail`

      const amount = Number(order.amount)
      if (!Number.isFinite(amount) || amount < 100) {
        alert('결제 금액이 유효하지 않습니다. (최소 100원)')
        return
      }

      // 결제창에서 허용될만한 안전한 주문명으로 정규화 (개행/제어문자 제거)
      const normalizedOrderName = String(order.orderName || '')
        .replace(/\s+/g, ' ')
        .replace(/[\r\n\t]/g, ' ')
        .replace(/[^\p{L}\p{N} _\-\[\]\(\)·.,!?]/gu, '')
        .trim()
        .slice(0, 100) || '강의 결제'

      console.log('[Purchase] opening payment widget (v2 widgets)', {
        orderId: order.orderId,
        amount,
        orderName: normalizedOrderName,
        successUrl,
        failUrl,
      })

      // 위젯 UI 렌더 후 사용자가 결제수단 선택 → 결제하기 버튼으로 요청
      widgetsRef.current = widgets
      orderRef.current = {
        orderId: order.orderId,
        orderName: normalizedOrderName,
        amount,
        successUrl,
        failUrl,
      }
      setIsWidgetOpen(true)
    },
    onSuccess: () => {
      // 결제창 호출 직후에는 아직 결제 전일 수 있으나, 성공 후 페이지에서 확정됨
      // 여기서는 낙관적 UX로 구매여부 재조회 트리거
      queryClient.invalidateQueries({ queryKey: ['course-purchased', lectureId] })
    },
    onError: (err: unknown) => {
      const anyErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      const status = anyErr?.response?.status
      const message = anyErr?.response?.data?.message || anyErr?.message || '결제 요청 중 오류가 발생했습니다.'
      console.error('[Purchase] error', { status, message, err })
      alert(`결제 요청에 실패했습니다.\n${message}`)
    },
  })

  // 위젯 오픈 시 결제수단/약관 UI 렌더링
  useEffect(() => {
    const renderWidgets = async () => {
      if (!isWidgetOpen) return
      const widgets = widgetsRef.current as
        | { setAmount: (p: { currency: string; value: number }) => Promise<void>; renderPaymentMethods: (p: { selector: string; variantKey?: string }) => Promise<void>; renderAgreement: (p: { selector: string; variantKey?: string }) => Promise<void> }
        | null
      const ord = orderRef.current
      if (!widgets || !ord) return
      await widgets.setAmount({ currency: 'KRW', value: ord.amount })
      await Promise.all([
        widgets.renderPaymentMethods({ selector: '#toss-payments-methods', variantKey: 'DEFAULT' }),
        widgets.renderAgreement({ selector: '#toss-payments-agreement', variantKey: 'AGREEMENT' }),
      ])
    }
    void renderWidgets()
  }, [isWidgetOpen])

  // 학습하기 버튼 핸들러
  const handleStartLearning = () => {
    if (!detail) return

    // 이어학습하기: 마지막으로 본 섹션과 언어 확인
    const lastSectionId = localStorage.getItem(
      `course_${detail.id}_lastSection`,
    )
    const lastLanguage = localStorage.getItem(
      `course_${detail.id}_lastLanguage`,
    )

    let targetSectionId: number | undefined
    let targetLanguage = 'origin'

    if (lastSectionId) {
      // 마지막으로 본 섹션이 있으면 그 섹션으로
      const section = detail.sections.find(
        s => s.id === parseInt(lastSectionId),
      )
      if (section && section.hasVideo && section.active) {
        targetSectionId = section.id
      }
    }

    // 마지막 섹션이 없거나 유효하지 않으면 첫 번째 비디오가 있는 섹션으로
    if (!targetSectionId) {
      const firstSection = detail.sections.find(s => s.hasVideo && s.active)
      targetSectionId = firstSection?.id
    }

    if (lastLanguage) {
      targetLanguage = lastLanguage
    }

    if (targetSectionId) {
      // 모든 언어에 locale prefix 포함 (한국어도 /ko 사용)
      const url = `/${locale}/course/lecture?courseId=${detail.id}&sectionId=${targetSectionId}&subtitleLanguage=${targetLanguage}`
      console.log('[PageWrapper] Navigating to:', url)
      router.push(url)
    } else {
      console.log('[PageWrapper] No targetSectionId found')
    }
  }

  if (isLoading || !detail) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-sm text-muted-foreground">{t.loading}</div> {/* "불러오는 중..." */}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* 헤더 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold leading-tight">
              {detail.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-foreground">
                  {detail.avgRating?.toFixed(1)}
                </span>
                <span>({detail.reviewCount})</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{t.students} {detail.purchaseCount.toLocaleString()}</span> {/* "수강생" */}
              </div>
              <span className="hidden sm:inline">·</span>
              <div className="inline-flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage
                    src={detail.instructor.profileImageUrl || '/avatar.png'}
                    alt={detail.instructor.nickname || detail.instructor.email}
                  />
                  <AvatarFallback>AU</AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[200px]">
                  {detail.instructor.nickname || detail.instructor.email}
                </span>
              </div>
            </div>
            {detail.description && (
              <p className="text-sm text-foreground/90 whitespace-pre-line">
                {detail.description}
              </p>
            )}
          </div>

          <Separator />

          {/* 커리큘럼 요약 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">{t.curriculum}</h2> {/* "커리큘럼" */}
            </div>
            <div className="divide-y rounded-md border">
              {detail.sections.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  {t.noCurriculum} {/* "커리큘럼이 아직 없습니다." */}
                </div>
              ) : (
                detail.sections.map(s => (
                  <div
                    key={s.id}
                    className="p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{s.title}</div>
                      {!s.active && (
                        <div className="text-xs text-muted-foreground">
                          {t.private} {/* "비공개" */}
                        </div>
                      )}
                    </div>
                    {s.hasVideo && (
                      <div className="flex items-center gap-2">
                        <HlsPlayerModal sectionId={s.id} title={s.title} />
                      </div>
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
                {typeof detail.discountPrice === 'number' &&
                  (detail.discountPrice as number) < detail.price && (
                    <div className="text-xs text-muted-foreground">
                      {t.originalPrice} ₩{detail.price.toLocaleString()} {/* "정가" */}
                    </div>
                  )}
                <div className="flex gap-2">
                  {!purchased ? (
                    <>
                      <Button
                        className="flex-1"
                        onClick={() => purchase.mutate()}
                        disabled={purchase.isPending}
                      >
                        {t.enroll}
                      </Button>
                      <Button
                        variant={inCart ? 'secondary' : 'outline'}
                        className="flex-1"
                        onClick={() => addToCart.mutate()}
                        disabled={addToCart.isPending}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" /> {inCart ? t.inCart : t.addToCart}
                      </Button>
                    </>
                  ) : (
                    <Button className="flex-1" variant="secondary" disabled>
                      구입 완료
                    </Button>
                  )}
                </div>

              {isWidgetOpen && (
                <div className="space-y-3">
                  <div id="toss-payments-methods" />
                  <div id="toss-payments-agreement" />
                  <Button
                    className="w-full"
                    onClick={async () => {
                      const widgets = widgetsRef.current as
                        | { requestPayment: (p: { orderId: string; orderName: string; successUrl: string; failUrl: string }) => Promise<void> }
                        | null
                      const ord = orderRef.current
                      if (!widgets || !ord) return
                      await widgets.requestPayment({
                        orderId: ord.orderId,
                        orderName: ord.orderName,
                        successUrl: ord.successUrl,
                        failUrl: ord.failUrl,
                      })
                    }}
                  >
                    {t.enroll}
                  </Button>
                </div>
              )}

                <Button
                  className="w-full"
                  variant={purchased ? 'default' : 'outline'}
                  onClick={purchased ? handleStartLearning : undefined}
                  disabled={!purchased}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {purchased ? t.startLearning : '구매 후 이용 가능합니다'}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => likeToggle.mutate()}
                  disabled={likeToggle.isPending}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      like ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />{' '}
                  {detail.likeCount.toLocaleString()}{t.peoplesLikes} {/* "명이 좋아함" */}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// 리뷰 컴포넌트
function Reviews({ lectureId }: { lectureId: number }) {
  const pathname = usePathname()
  const locale = useLocale(pathname)
  const t = getTranslation(locale).course
  const [rating, setRating] = useState(5)
  const { data: reviews = [], refetch } = useQuery({
    queryKey: ['course-reviews', lectureId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}/reviews`)
      const raw = data as ReviewItem[]
      // parentId=null인 항목만 골라내고, 각 항목의 replies에 대댓글 붙이기
      const roots = raw.filter(
        r => r.parentId === null || r.parentId === undefined,
      )
      const subs = raw.filter(
        r => r.parentId !== null && r.parentId !== undefined,
      )
      roots.forEach(r => {
        r.replies = subs.filter(s => s.parentId === r.id)
      })
      return roots
    },
  })
  const addReview = useMutation({
    mutationFn: async (p: { content: string; rating: number }) => {
      await axios.post(`/api/courses/${lectureId}/reviews`, p)
    },
    onSuccess: () => refetch(),
  })
  const addReply = useMutation({
    mutationFn: async (p: { parentId: number; content: string }) => {
      await axios.post(`/api/courses/${lectureId}/reviews`, { ...p, rating: 5 })
    },
    onSuccess: () => refetch(),
  })
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{t.reviews} ({reviews.length})</h2> {/* "리뷰" */}
      <div className="space-y-3">
        {/* 작성 */}
        <Card>
          <CardContent className="p-3">
            <div className="text-sm font-medium mb-1">{t.writeReview}</div> {/* "리뷰 작성" */}
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  className={`text-lg ${
                    i <= rating ? 'text-yellow-500' : 'text-muted-foreground'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder={t.reviewPlaceholder} // "강의 리뷰를 남겨주세요"
              className="w-full border rounded px-2 py-1 text-sm bg-background"
              rows={2}
              onKeyDown={e => {
                if (e.ctrlKey && e.key === 'Enter') {
                  const v = (e.target as HTMLTextAreaElement).value
                  if (v.trim()) {
                    addReview.mutate({ content: v.trim(), rating })
                    ;(e.target as HTMLTextAreaElement).value = ''
                  }
                }
              }}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {t.sendWithCtrlEnter} {/* "Ctrl+Enter로 전송" */}
            </div>
          </CardContent>
        </Card>
        {/* 목록 */}
        <div className="space-y-2">
          {reviews.length === 0 && (
            <div className="text-sm text-muted-foreground">
              {t.noReviews} {/* "아직 리뷰가 없습니다." */}
            </div>
          )}
          {reviews.map(
            rv =>
              rv && (
                <div key={rv.id} className="border rounded p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback>
                        {rv.user?.nickname?.[0] ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">
                      {rv.user?.nickname ?? rv.user?.email ?? '익명'}
                    </div>
                    <div className="flex gap-0 text-xs">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span
                          key={i}
                          className={
                            i <= rv.rating
                              ? 'text-yellow-500'
                              : 'text-muted-foreground'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-line">
                    {rv.content}
                  </div>
                  {/* 대댓글 1뎁스 */}
                  <div className="pl-3 border-l space-y-2">
                    {(rv.replies ?? []).map(rep => (
                      <div key={rep.id} className="text-sm text-foreground/90">
                        <span className="text-xs text-muted-foreground mr-1">
                          {t.reply} {/* "답글" */}
                        </span>
                        {rep.content}
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        placeholder={t.replyPlaceholder} // "답글 작성"
                        className="flex-1 border rounded px-2 py-1 text-xs bg-background"
                        onKeyDown={e => {
                          const v = (e.target as HTMLInputElement).value
                          if (e.key === 'Enter' && v.trim()) {
                            addReply.mutate({
                              parentId: rv.id,
                              content: v.trim(),
                            })
                            ;(e.target as HTMLInputElement).value = ''
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  )
}