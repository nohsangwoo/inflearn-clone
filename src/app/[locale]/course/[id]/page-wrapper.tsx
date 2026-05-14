'use client'

import { useMemo, useState } from 'react'
import axios from 'axios'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
  Clock3,
  FileText,
  MonitorPlay,
} from 'lucide-react'
import HlsPlayerModal from '@/components/video/shaka-player-modal'
import FreePreviewPlayerModal from '@/components/video/free-preview-player-modal'
import { getCoursePreviewImage } from '@/lib/course-images'
import type { CourseDetail as Detail } from '@/lib/course-detail-data'
import { getEnrollmentStatusLabel } from '@/lib/enrollment-window'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getTranslation, useLocale } from '@/lib/translations'

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

function formatDuration(totalSeconds?: number | null) {
  const seconds = Math.max(0, Number(totalSeconds ?? 0))
  if (!seconds) return '미정'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60))
  if (!hours) return `${minutes}분`
  return `${hours}시간 ${minutes}분`
}

export default function CourseDetailPageWrapper({ initialDetail = null }: { initialDetail?: Detail | null }) {
  const params = useParams<{ id: string }>()
  const lectureId = Number(params?.id)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale(pathname)
  const t = getTranslation(locale).course
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [like, setLike] = useState(false)

  const { data: detail, isLoading } = useQuery({
    queryKey: ['course-detail', lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses/${lectureId}`)
      return data as Detail
    },
    initialData: initialDetail && initialDetail.id === lectureId ? initialDetail : undefined,
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
    return getCoursePreviewImage(detail.imageUrl)
  }, [detail])
  const freePreviewSection = useMemo(
    () => detail?.sections.find((section) => section.isFreePreview && section.previewVideoUrl) ?? null,
    [detail?.sections],
  )
  const activeSections = detail?.sections.filter((section) => section.active) ?? []
  const totalDurationSeconds = activeSections.reduce((sum, section) => sum + Number(section.durationSeconds ?? 0), 0)
  const freePreviewCount = activeSections.filter((section) => section.isFreePreview && section.previewVideoUrl).length
  const curriculumSummary = `${activeSections.length}개 수업 · 총 ${formatDuration(totalDurationSeconds)}${freePreviewCount > 0 ? ` · 무료 공개 ${freePreviewCount}개` : ''}`
  const curriculumGroups = useMemo(() => {
    const groups = new Map<string, { title: string; sections: Detail["sections"]; durationSeconds: number }>()
    for (const section of detail?.sections ?? []) {
      const title = section.moduleTitle || '커리큘럼'
      const current = groups.get(title) ?? { title, sections: [], durationSeconds: 0 }
      current.sections.push(section)
      current.durationSeconds += Number(section.durationSeconds ?? 0)
      groups.set(title, current)
    }
    return Array.from(groups.values())
  }, [detail?.sections])
  const includedFeatures = detail?.includedFeatures?.length
    ? detail.includedFeatures
    : [
        `${formatDuration(totalDurationSeconds)} 분량 커리큘럼`,
        `${activeSections.length}개 수업`,
        '계좌입금 승인 후 수강',
        '모바일/데스크톱 수강',
        '검색 최적화된 강의 상세',
      ]

  // 액션
  const likeToggle = useMutation({
    mutationFn: async (nextLiked: boolean) => {
      const { data } = await axios.post(`/api/courses/${lectureId}/like`, { liked: nextLiked })
      return data as { liked: boolean }
    },
    onMutate: async (nextLiked) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['course-detail', lectureId] })

      // Save previous values
      const previousLike = like
      const previousDetail = queryClient.getQueryData<Detail>(['course-detail', lectureId])

      // Optimistic update
      setLike(nextLiked)

      // Update the cached detail with new like count
      if (previousDetail) {
        const updatedDetail = {
          ...previousDetail,
          likeCount: nextLiked
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
      const anyErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      if (anyErr?.response?.status === 401) {
        toast.error('로그인 후 관심 강의를 저장할 수 있습니다.')
        router.push(`/${locale}/login`)
        return
      }
      toast.error(anyErr?.response?.data?.message || anyErr?.message || '관심 강의 저장에 실패했습니다.')
    },
    onSettled: () => {
      // Refetch to ensure we have the latest data from server
      if (!detail?.isMock) queryClient.invalidateQueries({ queryKey: ['course-detail', lectureId] })
    },
    onSuccess: res => setLike(Boolean(res?.liked)),
  })
  const handleLikeToggle = () => {
    if (!user) {
      toast.error('로그인 후 관심 강의를 저장할 수 있습니다.')
      router.push(`/${locale}/login`)
      return
    }
    likeToggle.mutate(!like)
  }
  const enroll = useMutation({
    mutationFn: async () => {
      if (!detail) return
      const { data } = await axios.post(`/api/courses/${detail.id}/enrollment`, {})
      return data as { purchased: boolean; message?: string; enrollmentRequest?: EnrollmentRequest }
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['course-purchased', lectureId] })
      await queryClient.invalidateQueries({ queryKey: ['course-detail', lectureId] })
      if (data?.message) toast.success(data.message)
    },
    onError: (err: unknown) => {
      const anyErr = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      const status = anyErr?.response?.status
      const message = anyErr?.response?.data?.message || anyErr?.message || '수강 신청 중 오류가 발생했습니다.'
      console.error('[Enrollment] error', { status, message, err })
      if (status === 401) {
        toast.error('로그인 후 수강 신청할 수 있습니다.')
        router.push(`/${locale}/login`)
        return
      }
      toast.error(message)
    },
  })
  const handleEnroll = () => {
    if (!user) {
      toast.error('로그인 후 수강 신청할 수 있습니다.')
      router.push(`/${locale}/login`)
      return
    }
    enroll.mutate()
  }

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
            <div className="relative aspect-[1200/781] overflow-hidden rounded-[14px] bg-secondary">
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
                onClick={handleLikeToggle}
                disabled={likeToggle.isPending}
                className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-primary disabled:opacity-60"
              >
                <Heart className={like ? 'size-5 fill-primary text-primary' : 'size-5'} />
              </button>
              {freePreviewSection?.previewVideoUrl ? (
                <div className="absolute bottom-4 left-4 w-[210px] max-w-[calc(100%-2rem)]">
                  <FreePreviewPlayerModal
                    src={freePreviewSection.previewVideoUrl}
                    title={freePreviewSection.title}
                    label="무료 공개 보기"
                  />
                </div>
              ) : null}
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

          <section className="space-y-5 rounded-[14px] border bg-card p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[21px] font-bold leading-[1.43]">이 강의는 다음을 포함합니다</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {curriculumSummary}
                </p>
              </div>
              {detail.lastUpdatedAt ? (
                <span className="text-xs text-muted-foreground">최근 업데이트 {formatDateTime(detail.lastUpdatedAt)}</span>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {includedFeatures.slice(0, 6).map((feature, index) => {
                const Icon = index % 3 === 0 ? MonitorPlay : index % 3 === 1 ? FileText : Clock3
                return (
                  <div key={feature} className="flex items-center gap-3 rounded-[14px] border bg-background p-3 text-sm">
                    <Icon className="size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </div>
                )
              })}
            </div>
            {(detail.relatedTopics ?? detail.tags ?? []).length ? (
              <div>
                <h3 className="text-[16px] font-semibold leading-[1.25]">관련 주제</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(detail.relatedTopics ?? detail.tags ?? []).slice(0, 12).map((topic) => (
                    <Badge key={topic} variant="outline" className="rounded-full bg-background px-3 py-1">
                      {topic}
                    </Badge>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  링구스트는 온라인 강의, 시즌제 강의, 강의 판매, 수강 신청, 계좌입금 승인, HLS 영상 수강처럼
                  학습자와 강의 판매자가 실제로 검색하는 흐름을 기준으로 강의 상세 정보를 구성합니다.
                </p>
              </div>
            ) : null}
          </section>

          <div className="space-y-3 rounded-[14px] border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[21px] font-bold leading-[1.43]">{t.curriculum}</h2> {/* "커리큘럼" */}
              <span className="text-sm text-muted-foreground">{curriculumSummary}</span>
            </div>
            <div className="space-y-3">
              {detail.sections.length === 0 ? (
                <div className="rounded-[14px] border bg-background p-3 text-sm text-muted-foreground">
                  {t.noCurriculum} {/* "커리큘럼이 아직 없습니다." */}
                </div>
              ) : (
                curriculumGroups.map((group, groupIndex) => (
                  <div key={group.title} className="overflow-hidden rounded-[14px] border bg-background">
                    <div className="flex flex-col gap-2 border-b bg-muted/35 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-bold text-primary">섹션 {groupIndex + 1}</div>
                        <h3 className="mt-1 text-[20px] font-semibold leading-[1.2]">{group.title}</h3>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {group.sections.length}개 수업 · {formatDuration(group.durationSeconds)}
                      </div>
                    </div>
                    <div className="divide-y">
                      {group.sections.map((s, lessonIndex) => (
                        <div key={s.id} className="flex gap-3 p-3">
                          <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                            {s.hasVideo ? <MonitorPlay className="size-4" /> : <FileText className="size-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-medium text-muted-foreground">수업 {lessonIndex + 1}</span>
                              {s.isFreePreview ? <Badge variant="secondary" className="rounded-full">무료공개</Badge> : null}
                            </div>
                            <div className="mt-1 font-medium">{s.title}</div>
                            {s.description ? <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</div> : null}
                            {s.resources?.length ? (
                              <div className="mt-2 text-xs text-muted-foreground">자료 {s.resources.length}개 포함</div>
                            ) : null}
                            {!s.active && (
                              <div className="text-xs text-muted-foreground">
                                {t.private} {/* "비공개" */}
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end justify-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDuration(s.durationSeconds)}</span>
                            {s.hasVideo ? (
                              purchased ? (
                                <HlsPlayerModal sectionId={s.id} title={s.title} />
                              ) : s.isFreePreview && s.previewVideoUrl ? (
                                <FreePreviewPlayerModal src={s.previewVideoUrl} title={s.title} label="미리 보기" variant="link" />
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                  <Lock className="size-3" />
                                  승인 후 공개
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                                영상 등록 전
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
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
                  {freePreviewSection?.previewVideoUrl ? (
                    <FreePreviewPlayerModal
                      src={freePreviewSection.previewVideoUrl}
                      title={freePreviewSection.title}
                      label="무료 공개 수업 보기"
                    />
                  ) : null}
                  {!purchased ? (
                    <>
                      <Button
                        className="w-full"
                        onClick={handleEnroll}
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
                  onClick={handleLikeToggle}
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
