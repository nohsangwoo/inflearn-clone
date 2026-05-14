'use client'

import { useMemo, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  Star,
  Users,
  BookOpen,
  Lock,
  CheckCircle2,
  Tags,
} from 'lucide-react'
import HlsPlayerModal from '@/components/video/shaka-player-modal'
import { toCdnUrl } from '@/lib/brand'
import { getEnrollmentStatusLabel, type EnrollmentAvailabilityStatus } from '@/lib/enrollment-window'
import { getTranslation, useLocale } from '@/lib/translations'

type Detail = {
  id: number
  title: string
  slug?: string | null
  shortDescription?: string | null
  description: string | null
  category?: string | null
  level?: string | null
  tags?: string[]
  targetAudience?: string | null
  requirements?: string | null
  learningOutcomes?: string[]
  price: number
  discountPrice?: number | null
  enrollmentOpen?: boolean
  enrollmentStartAt?: string | null
  enrollmentEndAt?: string | null
  enrollmentCapacity?: number | null
  enrollmentAppliedCount?: number | null
  enrollmentStatus?: EnrollmentAvailabilityStatus
  enrollmentAvailable?: boolean
  remainingSeats?: number | null
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
  isMock?: boolean
  previewSectionId: number | null
  previewSectionTitle: string | null
  sections: { id: number; title: string; description?: string | null; active: boolean; hasVideo: boolean; hlsStatus?: string | null }[]
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

type EnrollmentRequest = {
  id: string
  status: 'AWAITING_PLATFORM_FEE' | 'APPROVED' | 'REJECTED' | 'CANCELED'
  amount: number
  platformFeeRateBps: number
  platformFeeAmount: number
  sellerReceivableAmount: number
  sellerBankName?: string | null
  sellerAccountNumber?: string | null
  sellerAccountHolder?: string | null
  createdAt: string
  approvedAt?: string | null
}

function enrollmentLabel(status: EnrollmentRequest['status']) {
  if (status === 'AWAITING_PLATFORM_FEE') return '입금 확인 대기'
  if (status === 'APPROVED') return '승인 완료'
  if (status === 'REJECTED') return '반려'
  return '취소'
}

function formatDateTime(value?: string | null) {
  if (!value) return '미정'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '미정'
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const detailHeroImages = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
]

export default function CourseDetailPageWrapper() {
  const params = useParams<{ id: string }>()
  const lectureId = Number(params?.id)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale(pathname)
  const t = getTranslation(locale).course
  const queryClient = useQueryClient()
  const [like, setLike] = useState(false)

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
      return data as { purchased: boolean; enrollmentRequest: EnrollmentRequest | null }
    },
  })

  const purchased = Boolean(purchasedRes?.purchased)
  const enrollmentRequest = purchasedRes?.enrollmentRequest ?? null
  const isEnrollmentPending = enrollmentRequest?.status === 'AWAITING_PLATFORM_FEE'
  const enrollmentStatus = detail?.enrollmentStatus ?? 'OPEN'
  const enrollmentAvailable = detail?.enrollmentAvailable ?? true

  // 초기 좋아요 상태
  useQuery({
    queryKey: ['course-like', lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}/like`)
      setLike(Boolean(data?.liked))
      return data as { liked: boolean }
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
  const heroImage = useMemo(() => {
    if (!detail) return ''
    return toCdnUrl(detail.imageUrl) || detailHeroImages[detail.id % detailHeroImages.length]
  }, [detail])

  // 액션
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
  const enroll = useMutation({
    mutationFn: async () => {
      if (!detail) return
      const { data } = await axios.post(`/api/courses/${detail.id}/enrollment`, {})
      return data as { purchased: boolean; message?: string; enrollmentRequest?: EnrollmentRequest }
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['course-purchased', lectureId] })
      await queryClient.invalidateQueries({ queryKey: ['course-detail', lectureId] })
      if (data?.message) alert(data.message)
    },
    onError: (err: unknown) => {
      const anyErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      const status = anyErr?.response?.status
      const message = anyErr?.response?.data?.message || anyErr?.message || '수강 신청 중 오류가 발생했습니다.'
      console.error('[Enrollment] error', { status, message, err })
      alert(`수강 신청에 실패했습니다.\n${message}`)
    },
  })

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
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-8">
          <section className="space-y-5">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt={detail.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-4 top-4 rounded-full bg-background px-3 py-1 text-[11px] font-semibold shadow-sm">
                {detail.category || '강의'}
              </div>
              <button
                type="button"
                aria-label="관심 강의"
                onClick={() => likeToggle.mutate()}
                disabled={likeToggle.isPending}
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-primary disabled:opacity-60"
              >
                <Heart className={like ? 'size-5 fill-primary text-primary' : 'size-5'} />
              </button>
            </div>

            <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {detail.category ? <Badge variant="secondary">{detail.category}</Badge> : null}
              {detail.level ? <Badge variant="outline">{detail.level}</Badge> : null}
              {(detail.tags ?? []).slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="bg-background">
                  <Tags className="size-3" />
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-[22px] font-medium leading-[1.18] md:text-[28px] md:font-bold md:leading-[1.43]">
              {detail.title}
            </h1>
            {detail.shortDescription ? (
              <p className="max-w-3xl text-[16px] leading-6 text-muted-foreground">
                {detail.shortDescription}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
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
              <p className="max-w-4xl whitespace-pre-line text-[16px] leading-7 text-muted-foreground">
                {detail.description}
              </p>
            )}
            </div>
          </section>

          {(detail.learningOutcomes?.length || detail.targetAudience || detail.requirements) ? (
            <section className="grid gap-4 md:grid-cols-3">
              {detail.learningOutcomes?.length ? (
                <div className="rounded-[14px] border bg-card p-5">
                  <h2 className="text-[16px] font-semibold leading-[1.25]">배우게 되는 것</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    {detail.learningOutcomes.slice(0, 5).map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {detail.targetAudience ? (
                <div className="rounded-[14px] border bg-card p-5">
                  <h2 className="text-[16px] font-semibold leading-[1.25]">추천 대상</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{detail.targetAudience}</p>
                </div>
              ) : null}
              {detail.requirements ? (
                <div className="rounded-[14px] border bg-card p-5">
                  <h2 className="text-[16px] font-semibold leading-[1.25]">준비물</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{detail.requirements}</p>
                </div>
              ) : null}
            </section>
          ) : null}

          <div className="space-y-3 rounded-[14px] border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[21px] font-bold leading-[1.43]">{t.curriculum}</h2> {/* "커리큘럼" */}
              <span className="text-sm text-muted-foreground">{detail.sections.length}개 수업</span>
            </div>
            <div className="divide-y rounded-[14px] border bg-background">
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
                      {s.description ? <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</div> : null}
                      {!s.active && (
                        <div className="text-xs text-muted-foreground">
                          {t.private} {/* "비공개" */}
                        </div>
                      )}
                    </div>
                    {s.hasVideo && (
                      <div className="flex items-center gap-2">
                        {purchased ? (
                          <HlsPlayerModal sectionId={s.id} title={s.title} />
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            <Lock className="size-3" />
                            승인 후 공개
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 리뷰 영역 (목록 + 작성) */}
          <Reviews lectureId={detail.id} />
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="text-[21px] font-bold leading-[1.43]">{priceText}</div>
                {typeof detail.discountPrice === 'number' &&
                  (detail.discountPrice as number) < detail.price && (
                    <div className="text-xs text-muted-foreground">
                      {t.originalPrice} ₩{detail.price.toLocaleString()} {/* "정가" */}
                    </div>
                  )}
                <div className="rounded-[14px] border bg-muted/40 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-foreground">{getEnrollmentStatusLabel(enrollmentStatus)}</span>
                    {typeof detail.remainingSeats === 'number' ? (
                      <span className="text-muted-foreground">잔여 {detail.remainingSeats}석</span>
                    ) : null}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-muted-foreground">
                    {detail.enrollmentStartAt || detail.enrollmentEndAt ? (
                      <div>
                        신청 기간 {formatDateTime(detail.enrollmentStartAt)} - {formatDateTime(detail.enrollmentEndAt)}
                      </div>
                    ) : (
                      <div>상시 신청 가능</div>
                    )}
                    {typeof detail.enrollmentCapacity === 'number' ? (
                      <div>이번 시즌 {detail.enrollmentAppliedCount ?? 0}/{detail.enrollmentCapacity}명 신청</div>
                    ) : null}
                    <div>신청 방식: 계좌입금 확인 후 수강권한 부여</div>
                  </div>
                </div>

                <div className="grid gap-2">
                  {!purchased ? (
                    <>
                      <Button
                        className="w-full"
                        onClick={() => enroll.mutate()}
                        disabled={!enrollmentAvailable || enroll.isPending || isEnrollmentPending}
                      >
                        {isEnrollmentPending ? '입금 확인 대기 중' : enrollmentAvailable ? '수강 신청' : getEnrollmentStatusLabel(enrollmentStatus)}
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" variant="secondary" disabled>
                      구입 완료
                    </Button>
                  )}
                </div>

                {enrollmentRequest ? (
                  <div className="space-y-2 rounded-[14px] border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">수강 신청 상태</span>
                      <Badge variant={purchased ? 'secondary' : 'outline'}>{enrollmentLabel(enrollmentRequest.status)}</Badge>
                    </div>
                    <div>신청 금액 ₩{enrollmentRequest.amount.toLocaleString()}</div>
                    <div>계좌입금 확인 후 판매자가 수강권한을 열어줍니다.</div>
                    {!purchased && enrollmentRequest.sellerAccountNumber ? (
                      <div className="rounded-[14px] border bg-background p-2">
                        입금 계좌: {enrollmentRequest.sellerBankName} {enrollmentRequest.sellerAccountNumber}
                        {enrollmentRequest.sellerAccountHolder ? ` (${enrollmentRequest.sellerAccountHolder})` : ''}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <Button
                  className="w-full"
                  variant={purchased ? 'default' : 'outline'}
                  onClick={purchased ? handleStartLearning : undefined}
                  disabled={!purchased}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {purchased ? t.startLearning : '승인 후 이용 가능합니다'}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full rounded-full"
                  onClick={() => likeToggle.mutate()}
                  disabled={likeToggle.isPending}
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      like ? 'fill-primary text-primary' : ''
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
      <h2 className="text-[21px] font-bold leading-[1.43]">{t.reviews} ({reviews.length})</h2> {/* "리뷰" */}
      <div className="space-y-3">
        <Card>
          <CardContent className="p-4">
            <div className="mb-2 text-sm font-medium">{t.writeReview}</div> {/* "리뷰 작성" */}
            <div className="mb-3 flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  className={`text-lg ${
                    i <= rating ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder={t.reviewPlaceholder} // "강의 리뷰를 남겨주세요"
              className="min-h-24 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
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
            <div className="mt-1 text-xs text-muted-foreground">
              {t.sendWithCtrlEnter} {/* "Ctrl+Enter로 전송" */}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-2">
          {reviews.length === 0 && (
            <div className="text-sm text-muted-foreground">
              {t.noReviews} {/* "아직 리뷰가 없습니다." */}
            </div>
          )}
          {reviews.map(
            rv =>
              rv && (
                <div key={rv.id} className="space-y-2 rounded-[14px] border p-4">
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
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="whitespace-pre-line text-sm">
                    {rv.content}
                  </div>
                  <div className="space-y-2 border-l pl-3">
                    {(rv.replies ?? []).map(rep => (
                      <div key={rep.id} className="text-sm text-foreground/90">
                        <span className="mr-1 text-xs text-muted-foreground">
                          {t.reply} {/* "답글" */}
                        </span>
                        {rep.content}
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        placeholder={t.replyPlaceholder} // "답글 작성"
                        className="h-10 flex-1 rounded-lg border bg-background px-3 text-xs outline-none focus:border-foreground"
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
