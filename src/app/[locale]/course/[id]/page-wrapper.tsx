'use client'

import { useMemo, useState } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  Heart,
  Lock,
  PlayCircle,
  ShieldCheck,
  Star,
  Tags,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { CourseAudienceRotator } from '@/components/course/course-audience-rotator'
import CourseReviews from '@/components/course/course-reviews'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { CourseDetail as Detail } from '@/lib/course-detail-data'
import { getCourseAudienceSignals } from '@/lib/course-audience-signals'
import { getCoursePreviewImage } from '@/lib/course-images'
import { getEnrollmentStatusLabel } from '@/lib/enrollment-window'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLocale } from '@/lib/translations'

const HlsPlayerModal = dynamic(() => import('@/components/video/shaka-player-modal'))
const FreePreviewPlayerModal = dynamic(() => import('@/components/video/free-preview-player-modal'))

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

function formatDate(value?: string | null) {
  if (!value) return '일정 미정'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '일정 미정'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatDuration(totalSeconds?: number | null) {
  const seconds = Math.max(0, Number(totalSeconds ?? 0))
  if (!seconds) return '분량 준비 중'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60))
  if (!hours) return `${minutes}분`
  return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`
}

function enrollmentRequestLabel(status: EnrollmentRequest['status']) {
  if (status === 'AWAITING_PLATFORM_FEE') return '입금 확인 대기'
  if (status === 'APPROVED') return '승인 완료'
  if (status === 'REJECTED') return '반려'
  return '취소'
}

function enrollmentSummary(detail: Detail) {
  const capacity = detail.enrollmentCapacity
  const applied = detail.enrollmentAppliedCount ?? 0

  if (detail.enrollmentStatus === 'OPEN') {
    return typeof detail.remainingSeats === 'number'
      ? `신청 가능 · 잔여 ${detail.remainingSeats}석`
      : '현재 신청 가능'
  }
  if (detail.enrollmentStatus === 'FULL') {
    return typeof capacity === 'number' ? `정원 마감 · ${capacity}/${capacity}명` : '정원 마감'
  }
  if (detail.enrollmentStatus === 'NOT_STARTED') {
    return `${formatDate(detail.enrollmentStartAt)} 신청 시작`
  }
  if (detail.enrollmentStatus === 'CLOSED') return '신청 기간이 종료되었습니다'
  return applied > 0 && typeof capacity === 'number'
    ? `운영 준비 중 · ${applied}/${capacity}명`
    : '다음 모집을 준비하고 있습니다'
}

function imageNeedsUnoptimized(src: string) {
  return /^https?:\/\//.test(src)
}

export default function CourseDetailPageWrapper({
  initialDetail = null,
}: {
  initialDetail?: Detail | null
}) {
  const params = useParams<{ id: string }>()
  const lectureId = Number(params?.id)
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale(pathname)
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [likeOverride, setLikeOverride] = useState<{
    lectureId: number
    value: boolean
  } | null>(null)

  const { data: detail, isLoading } = useQuery({
    queryKey: ['course-detail', lectureId],
    enabled: Number.isFinite(lectureId),
    queryFn: async ({ signal }) => {
      const { data } = await axios.get(`/api/courses/${lectureId}`, { signal })
      return data as Detail
    },
    initialData: initialDetail?.id === lectureId ? initialDetail : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const { data: purchasedResponse } = useQuery({
    queryKey: ['course-purchased', lectureId],
    enabled: Boolean(user) && Number.isFinite(lectureId),
    queryFn: async ({ signal }) => {
      const { data } = await axios.get('/api/courses/purchased', {
        params: { lectureId },
        signal,
      })
      return data as {
        purchased: boolean
        enrollmentRequest: EnrollmentRequest | null
      }
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  })

  const { data: likeResponse } = useQuery({
    queryKey: ['course-like', lectureId],
    enabled: Boolean(user) && Number.isFinite(lectureId),
    queryFn: async ({ signal }) => {
      const { data } = await axios.get(`/api/courses/${lectureId}/like`, { signal })
      return data as { liked: boolean }
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const liked = likeOverride?.lectureId === lectureId
    ? likeOverride.value
    : Boolean(likeResponse?.liked)

  const purchased = Boolean(purchasedResponse?.purchased)
  const enrollmentRequest = purchasedResponse?.enrollmentRequest ?? null
  const isEnrollmentPending = enrollmentRequest?.status === 'AWAITING_PLATFORM_FEE'

  const activeSections = useMemo(
    () => detail?.sections.filter((section) => section.active) ?? [],
    [detail?.sections],
  )
  const totalDurationSeconds = useMemo(
    () => activeSections.reduce(
      (sum, section) => sum + Number(section.durationSeconds ?? 0),
      0,
    ),
    [activeSections],
  )
  const freePreviewSection = useMemo(
    () => activeSections.find(
      (section) => section.isFreePreview && section.previewVideoUrl,
    ) ?? null,
    [activeSections],
  )
  const curriculumGroups = useMemo(() => {
    const groups = new Map<
      string,
      { title: string; sections: Detail['sections']; durationSeconds: number }
    >()
    for (const section of activeSections) {
      const groupTitle = section.moduleTitle || '커리큘럼'
      const group = groups.get(groupTitle) ?? {
        title: groupTitle,
        sections: [],
        durationSeconds: 0,
      }
      group.sections.push(section)
      group.durationSeconds += Number(section.durationSeconds ?? 0)
      groups.set(groupTitle, group)
    }
    return Array.from(groups.values())
  }, [activeSections])

  const detailSceneImages = useMemo(() => {
    const scene = detail?.detailScene
    if (!scene) return []
    if (scene.images?.length) return scene.images
    if (!scene.imageUrl) return []
    return [{
      title: scene.title,
      imageUrl: scene.imageUrl,
      alt: scene.alt ?? scene.title,
      caption: scene.caption ?? '',
    }]
  }, [detail?.detailScene])

  const heroImage = detailSceneImages[0]?.imageUrl
    || getCoursePreviewImage(detail?.imageUrl)

  const audienceSignals = useMemo(
    () => detail
      ? getCourseAudienceSignals({
          id: detail.id,
          title: detail.title,
          category: detail.category,
          tags: detail.tags,
        })
      : [],
    [detail],
  )

  const includedFeatures = detail?.includedFeatures?.length
    ? detail.includedFeatures
    : [
        `${formatDuration(totalDurationSeconds)} 커리큘럼`,
        `${activeSections.length}개 수업`,
        '모바일·데스크톱 수강',
        '수업 자료와 프로젝트 가이드',
      ]

  const effectivePrice = detail
    ? typeof detail.discountPrice === 'number' && detail.discountPrice < detail.price
      ? detail.discountPrice
      : detail.price
    : 0
  const priceLabel = effectivePrice === 0
    ? '무료'
    : new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
        maximumFractionDigits: 0,
      }).format(effectivePrice)

  const likeToggle = useMutation({
    mutationFn: async (nextLiked: boolean) => {
      const { data } = await axios.post(`/api/courses/${lectureId}/like`, {
        liked: nextLiked,
      })
      return data as { liked: boolean }
    },
    onMutate: async (nextLiked) => {
      await queryClient.cancelQueries({ queryKey: ['course-detail', lectureId] })
      const previousLiked = liked
      const previousDetail = queryClient.getQueryData<Detail>([
        'course-detail',
        lectureId,
      ])
      setLikeOverride({ lectureId, value: nextLiked })
      if (previousDetail) {
        queryClient.setQueryData<Detail>(['course-detail', lectureId], {
          ...previousDetail,
          likeCount: nextLiked
            ? previousDetail.likeCount + 1
            : Math.max(0, previousDetail.likeCount - 1),
        })
      }
      return { previousLiked, previousDetail }
    },
    onError: (error, _nextLiked, context) => {
      setLikeOverride({
        lectureId,
        value: context?.previousLiked ?? false,
      })
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ['course-detail', lectureId],
          context.previousDetail,
        )
      }
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } }
      }
      if (apiError.response?.status === 401) {
        toast.error('로그인 후 관심 강의를 저장할 수 있습니다.')
        router.push(`/${locale}/login`)
        return
      }
      toast.error(apiError.response?.data?.message ?? '관심 강의 저장에 실패했습니다.')
    },
    onSuccess: (data) => {
      setLikeOverride({ lectureId, value: Boolean(data.liked) })
      queryClient.setQueryData(['course-like', lectureId], data)
    },
  })

  const enroll = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/courses/${lectureId}/enrollment`, {})
      return data as {
        purchased: boolean
        message?: string
        enrollmentRequest?: EnrollmentRequest
      }
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['course-purchased', lectureId] }),
        queryClient.invalidateQueries({ queryKey: ['course-detail', lectureId] }),
      ])
      if (data.message) toast.success(data.message)
    },
    onError: (error) => {
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } }
      }
      if (apiError.response?.status === 401) {
        toast.error('로그인 후 수강 신청할 수 있습니다.')
        router.push(`/${locale}/login`)
        return
      }
      toast.error(
        apiError.response?.data?.message ?? '수강 신청 중 오류가 발생했습니다.',
      )
    },
  })

  function handleLikeToggle() {
    if (!user) {
      toast.error('로그인 후 관심 강의를 저장할 수 있습니다.')
      router.push(`/${locale}/login`)
      return
    }
    likeToggle.mutate(!liked)
  }

  function handleEnroll() {
    if (!detail) return
    if (detail.isSeedData) {
      toast.info('운영 예시 강의입니다. 실제 공개 강의에서 신청할 수 있습니다.')
      return
    }
    if (!user) {
      toast.error('로그인 후 수강 신청할 수 있습니다.')
      router.push(`/${locale}/login`)
      return
    }
    enroll.mutate()
  }

  function handleStartLearning() {
    if (!detail) return
    const lastSectionId = localStorage.getItem(`course_${detail.id}_lastSection`)
    const lastLanguage = localStorage.getItem(`course_${detail.id}_lastLanguage`) || 'origin'
    const savedSection = lastSectionId
      ? detail.sections.find(
          (section) => section.id === Number(lastSectionId)
            && section.hasVideo
            && section.active,
        )
      : null
    const targetSection = savedSection
      ?? detail.sections.find((section) => section.hasVideo && section.active)
    if (!targetSection) {
      toast.info('재생 가능한 수업을 준비하고 있습니다.')
      return
    }
    router.push(
      `/${locale}/course/lecture?courseId=${detail.id}&sectionId=${targetSection.id}&subtitleLanguage=${lastLanguage}`,
    )
  }

  if (isLoading || !detail) {
    return (
      <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-12">
        <div className="grid animate-pulse gap-8 rounded-[28px] border p-6 lg:grid-cols-2 lg:p-10">
          <div className="space-y-5 py-4">
            <div className="h-6 w-32 rounded-full bg-secondary" />
            <div className="h-32 rounded-[18px] bg-secondary" />
            <div className="h-20 rounded-[18px] bg-secondary" />
          </div>
          <div className="aspect-[4/3] rounded-[22px] bg-secondary" />
        </div>
      </main>
    )
  }

  const enrollmentAvailable = Boolean(detail.enrollmentAvailable) && !detail.isSeedData
  const enrollmentButtonLabel = detail.isSeedData
    ? '운영 예시 강의'
    : isEnrollmentPending
      ? '입금 확인 대기 중'
      : enrollmentAvailable
        ? '수강 신청하기'
        : getEnrollmentStatusLabel(detail.enrollmentStatus ?? 'PAUSED')
  const occupancy = typeof detail.enrollmentCapacity === 'number'
    ? Math.min(
        100,
        Math.round(
          ((detail.enrollmentAppliedCount ?? 0) / detail.enrollmentCapacity) * 100,
        ),
      )
    : 0
  const freePreviewCount = activeSections.filter(
    (section) => section.isFreePreview && section.previewVideoUrl,
  ).length
  const curriculumSummary = `${activeSections.length}개 수업 · ${formatDuration(totalDurationSeconds)}${
    freePreviewCount ? ` · 무료 공개 ${freePreviewCount}개` : ''
  }`

  return (
    <main className="pb-40 md:pb-24 lg:pb-0">
      <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 md:py-10">
        <nav aria-label="경로" className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => router.push(`/${locale}`)}
            className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            강의
          </button>
          <span aria-hidden="true">/</span>
          <span>{detail.category || '전체'}</span>
        </nav>

        <section className="overflow-hidden rounded-[28px] border border-border/80 bg-card shadow-[0_20px_70px_-48px_rgba(15,23,42,0.6)]">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full">{detail.category || '실전 강의'}</Badge>
                {detail.level ? (
                  <Badge variant="outline" className="rounded-full">{detail.level}</Badge>
                ) : null}
                <Badge variant="outline" className="rounded-full">
                  {getEnrollmentStatusLabel(detail.enrollmentStatus ?? 'PAUSED')}
                </Badge>
              </div>

              <h1 className="font-brand mt-6 max-w-[18ch] text-balance text-[clamp(2.15rem,5vw,4.25rem)] font-extrabold leading-[1.04] tracking-[-0.05em]">
                {detail.title}
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-[16px] leading-7 text-muted-foreground md:text-[18px]">
                {detail.shortDescription || detail.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                <a href="#reviews" className="inline-flex items-center gap-1.5 font-semibold hover:text-primary">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {detail.avgRating > 0 ? detail.avgRating.toFixed(2) : '신규'}
                  <span className="font-normal text-muted-foreground">
                    후기 {detail.reviewCount.toLocaleString()}개
                  </span>
                </a>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-4" />
                  누적 수강 {detail.purchaseCount.toLocaleString()}명
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock3 className="size-4" />
                  {formatDuration(totalDurationSeconds)}
                </span>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={!enrollmentAvailable || enroll.isPending || isEnrollmentPending}
                  className="rounded-full px-7"
                >
                  {enrollmentButtonLabel}
                  {enrollmentAvailable ? <ArrowRight className="size-4" /> : null}
                </Button>
                {freePreviewSection?.previewVideoUrl ? (
                  <FreePreviewPlayerModal
                    src={freePreviewSection.previewVideoUrl}
                    title={freePreviewSection.title}
                    label="무료 수업 미리 보기"
                  />
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="rounded-full px-7"
                    onClick={() => document.getElementById('curriculum')?.scrollIntoView({
                      behavior: 'smooth',
                    })}
                  >
                    <PlayCircle className="size-4" />
                    커리큘럼 보기
                  </Button>
                )}
              </div>

              <div className="mt-7 flex items-center gap-3 border-t pt-5">
                <Avatar className="size-11 border">
                  <AvatarImage
                    src={detail.instructor.profileImageUrl || '/avatar.png'}
                    alt={detail.instructor.nickname || '강사'}
                  />
                  <AvatarFallback>
                    {(detail.instructor.nickname || '강사').slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">이 강의를 만든 사람</p>
                  <p className="truncate font-semibold">
                    {detail.instructor.nickname || '링구스트 강사'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLikeToggle}
                  disabled={likeToggle.isPending}
                  aria-label={liked ? '관심 강의에서 삭제' : '관심 강의로 저장'}
                  aria-pressed={liked}
                  className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                >
                  <Heart className={liked ? 'size-4 fill-primary text-primary' : 'size-4'} />
                  {detail.likeCount.toLocaleString()}
                </button>
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden bg-secondary lg:min-h-[600px]">
              <Image
                src={heroImage}
                alt={detailSceneImages[0]?.alt || detail.title}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                unoptimized={imageNeedsUnoptimized(heroImage)}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-5 pt-20 text-white md:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                  완성 프로젝트
                </p>
                <p className="mt-2 max-w-xl text-sm font-medium leading-6 md:text-base">
                  {detailSceneImages[0]?.caption
                    || detail.learningOutcomes?.[0]
                    || '배운 내용을 실제 결과물로 완성합니다.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <CourseAudienceRotator signals={audienceSignals} className="mt-5" />

        <nav
          aria-label="강의 상세 섹션"
          className="sticky top-[64px] z-20 mt-6 -mx-4 overflow-x-auto border-y bg-background/95 px-4 backdrop-blur md:mx-0 md:rounded-full md:border"
        >
          <div className="flex min-w-max items-center gap-1 py-2 md:px-2">
            {[
              ['outcomes', '강의 소개'],
              ['projects', '결과물'],
              ['curriculum', '커리큘럼'],
              ['instructor', '강사'],
              ['reviews', '후기'],
              ['faq', '안내'],
            ].map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:gap-14">
          <div className="min-w-0 space-y-8">
            <section
              id="outcomes"
              className="scroll-mt-28 rounded-[24px] border border-border/80 bg-card p-5 md:p-8"
            >
              <p className="editorial-label text-primary">COURSE OUTCOMES</p>
              <h2 className="font-brand mt-3 text-balance text-[28px] font-extrabold tracking-[-0.035em] md:text-[36px]">
                듣고 끝나는 대신, 설명할 수 있는 결과물을 만듭니다
              </h2>
              {detail.description ? (
                <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-muted-foreground md:text-base">
                  {detail.description}
                </p>
              ) : null}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {(detail.learningOutcomes ?? []).map((outcome, index) => (
                  <div
                    key={outcome}
                    className="flex gap-3 rounded-[16px] border bg-background p-4"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-6">{outcome}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-4 border-t pt-7 md:grid-cols-2">
                <div className="rounded-[16px] bg-muted/50 p-5">
                  <h3 className="flex items-center gap-2 font-bold">
                    <Users className="size-4 text-primary" />
                    이런 분께 추천합니다
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {detail.targetAudience || '결과물 중심으로 실무 역량을 쌓고 싶은 분'}
                  </p>
                </div>
                <div className="rounded-[16px] bg-muted/50 p-5">
                  <h3 className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="size-4 text-primary" />
                    시작 전 확인하세요
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                    {detail.requirements || '별도의 선수 지식 없이 시작할 수 있습니다.'}
                  </p>
                </div>
              </div>
            </section>

            {detail.detailScene && detailSceneImages.length > 0 ? (
              <section
                id="projects"
                className="scroll-mt-28 overflow-hidden rounded-[24px] border border-border/80 bg-card"
              >
                <div className="p-5 md:p-8">
                  <p className="editorial-label text-primary">PROJECT PREVIEW</p>
                  <h2 className="font-brand mt-3 text-[28px] font-extrabold tracking-[-0.035em] md:text-[36px]">
                    {detail.detailScene.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                    수업에서 다루는 도구와 작업 흐름을 실제 프로젝트 장면으로 확인하세요.
                    결과만 복제하는 대신, 각 선택을 설명할 수 있도록 제작 과정을 함께 익힙니다.
                  </p>
                </div>
                <div className="grid gap-px bg-border">
                  {detailSceneImages.map((image) => (
                    <figure key={image.imageUrl} className="bg-background">
                      <div className="relative aspect-video overflow-hidden bg-secondary">
                        <Image
                          src={image.imageUrl}
                          alt={image.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 760px"
                          className="object-cover"
                          unoptimized={imageNeedsUnoptimized(image.imageUrl)}
                        />
                      </div>
                      <figcaption className="p-5 md:p-6">
                        <p className="font-bold">{image.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {image.caption}
                        </p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            <section
              id="curriculum"
              className="scroll-mt-28 rounded-[24px] border border-border/80 bg-card p-5 md:p-8"
            >
              <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="editorial-label text-primary">CURRICULUM</p>
                  <h2 className="font-brand mt-3 text-[28px] font-extrabold tracking-[-0.035em] md:text-[36px]">
                    완성까지 이어지는 커리큘럼
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">{curriculumSummary}</p>
              </div>

              {curriculumGroups.length ? (
                <Accordion
                  type="multiple"
                  defaultValue={curriculumGroups.slice(0, 1).map((_, index) => `module-${index}`)}
                  className="mt-2"
                >
                  {curriculumGroups.map((group, groupIndex) => (
                    <AccordionItem
                      key={`${group.title}-${groupIndex}`}
                      value={`module-${groupIndex}`}
                      className="border-b last:border-b-0"
                    >
                      <AccordionTrigger className="py-5 hover:no-underline">
                        <div className="pr-3 text-left">
                          <p className="text-xs font-bold text-primary">모듈 {groupIndex + 1}</p>
                          <h3 className="mt-1 text-base font-bold md:text-lg">{group.title}</h3>
                          <p className="mt-1 text-xs font-normal text-muted-foreground">
                            {group.sections.length}개 수업 · {formatDuration(group.durationSeconds)}
                          </p>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-5">
                        <ol className="divide-y overflow-hidden rounded-[16px] border bg-background">
                          {group.sections.map((section, lessonIndex) => (
                            <li
                              key={section.id}
                              className="flex items-start gap-3 p-4"
                            >
                              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                                {lessonIndex + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-semibold leading-6">{section.title}</p>
                                  {section.isFreePreview ? (
                                    <Badge variant="secondary" className="rounded-full">
                                      무료 공개
                                    </Badge>
                                  ) : null}
                                </div>
                                {section.description ? (
                                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {section.description}
                                  </p>
                                ) : null}
                                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  <span>{formatDuration(section.durationSeconds)}</span>
                                  {section.resources?.length ? (
                                    <span>자료 {section.resources.length}개</span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="shrink-0 self-center">
                                {section.hasVideo ? (
                                  purchased ? (
                                    <HlsPlayerModal sectionId={section.id} title={section.title} />
                                  ) : section.isFreePreview && section.previewVideoUrl ? (
                                    <FreePreviewPlayerModal
                                      src={section.previewVideoUrl}
                                      title={section.title}
                                      label="미리 보기"
                                      variant="link"
                                    />
                                  ) : (
                                    <span
                                      className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                                      title="승인 후 공개"
                                    >
                                      <Lock className="size-3.5" />
                                    </span>
                                  )
                                ) : (
                                  <FileText className="size-4 text-muted-foreground" />
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="mt-6 rounded-[16px] bg-muted/50 p-5 text-sm text-muted-foreground">
                  커리큘럼을 준비하고 있습니다.
                </p>
              )}
            </section>

            <section
              id="instructor"
              className="scroll-mt-28 rounded-[24px] border border-border/80 bg-card p-5 md:p-8"
            >
              <p className="editorial-label text-primary">INSTRUCTOR</p>
              <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-start">
                <Avatar className="size-20 border md:size-24">
                  <AvatarImage
                    src={detail.instructor.profileImageUrl || '/avatar.png'}
                    alt={detail.instructor.nickname || '강사'}
                  />
                  <AvatarFallback className="text-xl">
                    {(detail.instructor.nickname || '강사').slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary">{detail.category} 강사</p>
                  <h2 className="font-brand mt-1 text-[28px] font-extrabold">
                    {detail.instructor.nickname || '링구스트 강사'}
                  </h2>
                  <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground md:text-base">
                    {detail.instructor.description
                      || `${detail.category || '해당 분야'}의 핵심 작업 흐름을 결과물 중심으로 안내합니다. 각 수업에서 무엇을 만들고, 어떤 기준으로 점검해야 하는지 구체적으로 설명합니다.`}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(detail.tags ?? []).slice(0, 5).map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <CourseReviews
              lectureId={detail.id}
              isSeedData={detail.isSeedData}
              loginHref={`/${locale}/login`}
              className="rounded-[24px] border border-border/80 bg-card p-5 md:p-8"
            />

            <section
              id="faq"
              className="scroll-mt-28 rounded-[24px] border border-border/80 bg-card p-5 md:p-8"
            >
              <p className="editorial-label text-primary">BEFORE YOU START</p>
              <h2 className="font-brand mt-3 text-[28px] font-extrabold tracking-[-0.035em] md:text-[36px]">
                수강 전 안내
              </h2>
              <Accordion type="single" collapsible className="mt-5">
                <AccordionItem value="access">
                  <AccordionTrigger>언제부터 수강할 수 있나요?</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">
                    실제 공개 강의는 신청과 결제 확인이 완료되면 내 강의실에서 바로
                    시작할 수 있습니다. 승인 상태는 계정의 신청 내역에서 확인할 수 있습니다.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="devices">
                  <AccordionTrigger>어떤 기기에서 볼 수 있나요?</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">
                    최신 브라우저가 설치된 데스크톱과 모바일에서 수강할 수 있습니다.
                    영상과 제공 자료는 강의별 공개 범위에 따라 제공됩니다.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="policy">
                  <AccordionTrigger>취소와 환불 기준은 어떻게 확인하나요?</AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground">
                    신청 전 강의별 안내와 이용약관의 취소·환불 기준을 확인해 주세요.
                    결제 또는 승인 상태에 따른 문의는 고객 지원을 통해 확인할 수 있습니다.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>

          <aside className="lg:sticky lg:top-[136px]">
            <Card className="overflow-hidden border-border/80 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.7)]">
              <CardContent className="p-5 md:p-6">
                {detail.isSeedData ? (
                  <div className="mb-5 rounded-[14px] border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
                    <span className="font-bold text-primary">운영 예시 강의</span>
                    <br />
                    실제 강의가 공개되면 같은 흐름으로 신청과 수강이 진행됩니다.
                  </div>
                ) : null}

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  이번 모집
                </p>
                <p className="font-brand mt-3 text-[32px] font-extrabold tracking-[-0.04em]">
                  {priceLabel}
                </p>
                {typeof detail.discountPrice === 'number'
                  && detail.discountPrice < detail.price ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      정가 <span className="line-through">₩{detail.price.toLocaleString()}</span>
                    </p>
                  ) : null}

                <div className="mt-5 rounded-[16px] border bg-muted/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">
                      {getEnrollmentStatusLabel(detail.enrollmentStatus ?? 'PAUSED')}
                    </span>
                    {detail.enrollmentStatus === 'OPEN'
                      && typeof detail.remainingSeats === 'number' ? (
                        <span className="text-sm font-semibold text-primary">
                          잔여 {detail.remainingSeats}석
                        </span>
                      ) : null}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {enrollmentSummary(detail)}
                  </p>
                  {(detail.enrollmentStatus === 'OPEN'
                    || detail.enrollmentStatus === 'FULL')
                    && typeof detail.enrollmentCapacity === 'number' ? (
                      <div className="mt-4">
                        <div className="h-1.5 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                          <span>{detail.enrollmentAppliedCount ?? 0}명 신청</span>
                          <span>정원 {detail.enrollmentCapacity}명</span>
                        </div>
                      </div>
                    ) : null}
                </div>

                <div className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground">
                  {detail.enrollmentStartAt || detail.enrollmentEndAt ? (
                    <p className="flex gap-2">
                      <CalendarDays className="mt-0.5 size-3.5 shrink-0" />
                      {formatDate(detail.enrollmentStartAt)} – {formatDate(detail.enrollmentEndAt)}
                    </p>
                  ) : null}
                  <p className="flex gap-2">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                    승인 완료 후 내 강의실에서 수강
                  </p>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="mt-5 w-full rounded-full"
                  onClick={handleEnroll}
                  disabled={!enrollmentAvailable || enroll.isPending || isEnrollmentPending}
                >
                  {enrollmentButtonLabel}
                </Button>

                {enrollmentRequest ? (
                  <div className="mt-4 rounded-[14px] border bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">신청 상태</span>
                      <Badge variant="outline">
                        {enrollmentRequestLabel(enrollmentRequest.status)}
                      </Badge>
                    </div>
                    <p className="mt-2">신청 금액 ₩{enrollmentRequest.amount.toLocaleString()}</p>
                    {!purchased && enrollmentRequest.sellerAccountNumber ? (
                      <p className="mt-2 rounded-lg bg-background p-2">
                        입금 계좌 {enrollmentRequest.sellerBankName}{' '}
                        {enrollmentRequest.sellerAccountNumber}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {purchased ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full rounded-full"
                    onClick={handleStartLearning}
                  >
                    <BookOpen className="size-4" />
                    이어서 학습하기
                  </Button>
                ) : null}

                <div className="mt-6 space-y-3 border-t pt-5">
                  {includedFeatures.slice(0, 5).map((feature) => (
                    <p key={feature} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </p>
                  ))}
                </div>

                {(detail.relatedTopics ?? detail.tags ?? []).length ? (
                  <div className="mt-6 border-t pt-5">
                    <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Tags className="size-3.5" />
                      관련 주제
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(detail.relatedTopics ?? detail.tags ?? []).slice(0, 8).map((topic) => (
                        <Badge key={topic} variant="outline" className="rounded-full">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <div
        data-course-enrollment-bar
        className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t bg-background/95 p-3 backdrop-blur md:bottom-0 lg:hidden"
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-brand text-lg font-extrabold">{priceLabel}</p>
            <p className="truncate text-xs text-muted-foreground">
              {enrollmentSummary(detail)}
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 rounded-full"
            onClick={handleEnroll}
            disabled={!enrollmentAvailable || enroll.isPending || isEnrollmentPending}
          >
            {enrollmentButtonLabel}
          </Button>
        </div>
      </div>
    </main>
  )
}
