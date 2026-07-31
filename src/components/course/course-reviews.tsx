"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CornerDownRight,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  Star,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MIN_REVIEW_LENGTH = 10
const MAX_REVIEW_LENGTH = 2_000
const DEFAULT_PAGE_SIZE = 6

type ReviewSort = "latest" | "highest" | "lowest"
type Rating = 1 | 2 | 3 | 4 | 5
type ViewerReason =
  | "LOGIN_REQUIRED"
  | "PURCHASE_REQUIRED"
  | "ALREADY_REVIEWED"
  | "SEED_COURSE"
  | null

type ReviewReply = {
  id: number
  content: string
  createdAt: string
  author: {
    displayName: string
    profileImageUrl: string | null
    role: string | null
  }
}

type ReviewItem = {
  id: number
  content: string
  rating: number
  createdAt: string
  author: {
    displayName: string
    profileImageUrl: string | null
  }
  verifiedPurchase: boolean
  progressPercent: number | null
  replies: ReviewReply[]
}

type ReviewsResponse = {
  isSeedData: boolean
  summary: {
    total: number
    average: number
    distribution: Record<Rating, number>
    verifiedCount: number
  }
  items: ReviewItem[]
  pageInfo: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
  viewer?: {
    authenticated: boolean
    canReview: boolean
    hasPurchased: boolean
    existingReviewId: number | null
    reason: ViewerReason
  }
}

export type CourseReviewsProps = {
  lectureId: number
  className?: string
  pageSize?: number
  initialData?: ReviewsResponse
  isSeedData?: boolean
  loginHref?: string
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    credentials: "same-origin",
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message =
      body && typeof body.message === "string"
        ? body.message
        : "후기 정보를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
    throw new Error(message)
  }
  return body as T
}

function formatCount(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value)
}

function formatReviewDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

function getInitials(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "수"
}

function DisplayStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`5점 만점에 ${rating}점`}
    >
      {[1, 2, 3, 4, 5].map((score) => (
        <Star
          key={score}
          aria-hidden="true"
          className={cn(
            size === "md" ? "size-5" : "size-4",
            score <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-border",
          )}
        />
      ))}
    </span>
  )
}

function RatingPicker({
  value,
  onChange,
  disabled,
}: {
  value: Rating
  onChange: (rating: Rating) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="후기 평점">
      {([1, 2, 3, 4, 5] as const).map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={value === score}
          aria-label={`${score}점 선택`}
          disabled={disabled}
          onClick={() => onChange(score)}
          className="grid size-10 place-items-center rounded-full text-amber-400 transition-[background-color,transform] hover:bg-amber-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          <Star
            aria-hidden="true"
            className={cn(
              "size-6",
              score <= value ? "fill-current" : "fill-transparent text-border",
            )}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="space-y-3" aria-label="후기를 불러오는 중">
      {[1, 2, 3].map((item) => (
        <div key={item} className="animate-pulse rounded-[18px] border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-3 w-40 rounded bg-muted" />
            </div>
          </div>
          <div className="mt-5 h-3 w-full rounded bg-muted" />
          <div className="mt-2 h-3 w-4/5 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function viewerMessage(reason: ViewerReason) {
  if (reason === "LOGIN_REQUIRED") return "로그인 후 수강 후기를 작성할 수 있습니다."
  if (reason === "PURCHASE_REQUIRED") return "수강이 확인된 회원만 후기를 작성할 수 있습니다."
  if (reason === "ALREADY_REVIEWED") return "이 강의에는 이미 후기를 작성했습니다."
  if (reason === "SEED_COURSE") return "운영 예시 강의의 후기는 읽기 전용으로 제공됩니다."
  return null
}

export function CourseReviews({
  lectureId,
  className,
  pageSize = DEFAULT_PAGE_SIZE,
  initialData,
  isSeedData = false,
  loginHref,
}: CourseReviewsProps) {
  const queryClient = useQueryClient()
  const normalizedPageSize = Math.min(20, Math.max(1, Math.floor(pageSize)))
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<Rating | null>(null)
  const [sort, setSort] = useState<ReviewSort>("latest")
  const [draftRating, setDraftRating] = useState<Rating>(5)
  const [content, setContent] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)

  const reviewsQuery = useQuery({
    queryKey: [
      "course-reviews",
      lectureId,
      { page, pageSize: normalizedPageSize, rating: ratingFilter, sort },
    ],
    enabled: Number.isInteger(lectureId) && lectureId > 0,
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams({
        page: String(page),
        pageSize: String(normalizedPageSize),
        sort,
      })
      if (ratingFilter) searchParams.set("rating", String(ratingFilter))
      return requestJson<ReviewsResponse>(
        `/api/courses/${lectureId}/reviews?${searchParams.toString()}`,
        { signal },
      )
    },
    initialData:
      page === 1 &&
      ratingFilter === null &&
      sort === "latest" &&
      initialData?.pageInfo.pageSize === normalizedPageSize
        ? initialData
        : undefined,
    placeholderData: (previous) => previous,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const submitReview = useMutation({
    mutationFn: async () =>
      requestJson<{ review: { id: number } | null }>(
        `/api/courses/${lectureId}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, rating: draftRating }),
        },
      ),
    onSuccess: async () => {
      setContent("")
      setDraftRating(5)
      setSubmitError(null)
      setRatingFilter(null)
      setSort("latest")
      setPage(1)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["course-reviews", lectureId] }),
        queryClient.invalidateQueries({ queryKey: ["course-detail", lectureId] }),
      ])
    },
    onError: (error) => {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "후기를 등록하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      )
    },
  })

  const data = reviewsQuery.data
  const summary = data?.summary
  const viewer = data?.viewer
  const seedContent = data?.isSeedData ?? isSeedData
  const selectedRating = ratingFilter
  const totalPages = data?.pageInfo.totalPages ?? 1
  const visiblePages = useMemo(() => {
    const count = Math.min(5, totalPages)
    const start = Math.max(1, Math.min(page - 2, totalPages - count + 1))
    return Array.from({ length: count }, (_, index) => start + index)
  }, [page, totalPages])

  const handleRatingFilter = (rating: Rating | null) => {
    setRatingFilter((current) => (current === rating ? null : rating))
    setPage(1)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = content.trim()
    setSubmitError(null)
    if (trimmed.length < MIN_REVIEW_LENGTH || trimmed.length > MAX_REVIEW_LENGTH) {
      setSubmitError(
        `후기는 ${MIN_REVIEW_LENGTH}자 이상 ${formatCount(MAX_REVIEW_LENGTH)}자 이하로 작성해 주세요.`,
      )
      return
    }
    submitReview.mutate()
  }

  return (
    <section
      id="reviews"
      aria-labelledby="course-reviews-heading"
      className={cn("scroll-mt-28 space-y-6", className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="editorial-label text-primary">검증된 수강 후기</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2
              id="course-reviews-heading"
              className="font-brand text-[28px] font-extrabold leading-tight tracking-[-0.025em]"
            >
              수강생 후기
            </h2>
            {seedContent ? (
              <Badge variant="secondary" className="rounded-full">
                운영 예시 후기
              </Badge>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            실제 수강 경험과 강사 답변을 한곳에서 확인하세요.
          </p>
        </div>
        {reviewsQuery.isFetching && !reviewsQuery.isPending ? (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            후기 업데이트 중…
          </span>
        ) : null}
      </div>

      {seedContent ? (
        <Alert>
          <ShieldCheck aria-hidden="true" />
          <AlertTitle>운영 화면을 위한 예시 데이터입니다</AlertTitle>
          <AlertDescription>
            후기 작성 흐름과 화면 구성을 보여주기 위한 읽기 전용 데이터이며 실제 재직·수강 사실을 의미하지 않습니다.
          </AlertDescription>
        </Alert>
      ) : null}

      {reviewsQuery.isPending ? (
        <ReviewSkeleton />
      ) : reviewsQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>후기를 불러오지 못했습니다</AlertTitle>
          <AlertDescription>
            <p>
              {reviewsQuery.error instanceof Error
                ? reviewsQuery.error.message
                : "네트워크 상태를 확인한 뒤 다시 시도해 주세요."}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => reviewsQuery.refetch()}
            >
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card className="overflow-hidden rounded-[22px] border-border/80 shadow-none">
            <CardContent className="grid gap-7 p-5 md:grid-cols-[220px_minmax(0,1fr)] md:p-7">
              <div className="flex flex-col items-center justify-center rounded-[18px] bg-muted/40 px-5 py-7 text-center">
                <strong className="font-brand text-5xl font-extrabold tracking-[-0.05em] tabular-nums">
                  {(summary?.average ?? 0).toFixed(2)}
                </strong>
                <div className="mt-3">
                  <DisplayStars rating={summary?.average ?? 0} size="md" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  후기 {formatCount(summary?.total ?? 0)}개
                </p>
                {(summary?.verifiedCount ?? 0) > 0 ? (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
                    수강 확인 {formatCount(summary?.verifiedCount ?? 0)}개
                  </p>
                ) : null}
              </div>

              <div className="space-y-2" aria-label="평점별 후기 분포">
                {([5, 4, 3, 2, 1] as const).map((score) => {
                  const count = summary?.distribution[score] ?? 0
                  const percentage =
                    (summary?.total ?? 0) > 0
                      ? Math.round((count / (summary?.total ?? 1)) * 100)
                      : 0
                  const active = selectedRating === score
                  return (
                    <button
                      key={score}
                      type="button"
                      aria-pressed={active}
                      aria-label={`${score}점 후기 ${formatCount(count)}개, ${percentage}%`}
                      onClick={() => handleRatingFilter(score)}
                      className={cn(
                        "grid w-full grid-cols-[34px_minmax(0,1fr)_52px] items-center gap-3 rounded-xl px-2 py-2 text-left transition-[background-color,color] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        active && "bg-primary/8 text-primary",
                      )}
                    >
                      <span className="text-sm font-semibold tabular-nums">{score}점</span>
                      <span
                        aria-hidden="true"
                        className="h-2 overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          className="block h-full rounded-full bg-amber-400 transition-[width] duration-300 motion-reduce:transition-none"
                          style={{ width: `${percentage}%` }}
                        />
                      </span>
                      <span className="text-right text-xs text-muted-foreground tabular-nums">
                        {formatCount(count)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {viewer?.canReview && !seedContent ? (
            <Card className="rounded-[22px] border-border/80 shadow-none">
              <CardContent className="p-5 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">수강 후기를 남겨주세요</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      좋았던 점과 아쉬웠던 점을 구체적으로 적으면 다음 수강생에게 도움이 됩니다.
                    </p>
                  </div>
                  <div>
                    <span id="review-rating-label" className="text-sm font-semibold">
                      평점
                    </span>
                    <div className="mt-1" aria-labelledby="review-rating-label">
                      <RatingPicker
                        value={draftRating}
                        onChange={setDraftRating}
                        disabled={submitReview.isPending}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor={`course-${lectureId}-review`} className="text-sm font-semibold">
                        후기 내용
                      </label>
                      <span
                        id={`course-${lectureId}-review-count`}
                        className="text-xs text-muted-foreground tabular-nums"
                      >
                        {formatCount(content.length)} / {formatCount(MAX_REVIEW_LENGTH)}
                      </span>
                    </div>
                    <Textarea
                      id={`course-${lectureId}-review`}
                      name="review"
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="어떤 부분이 실무나 학습에 도움이 되었는지 알려주세요…"
                      rows={5}
                      minLength={MIN_REVIEW_LENGTH}
                      maxLength={MAX_REVIEW_LENGTH}
                      required
                      disabled={submitReview.isPending}
                      aria-invalid={Boolean(submitError)}
                      aria-describedby={`course-${lectureId}-review-count course-${lectureId}-review-error`}
                      className="mt-2 min-h-32 resize-y"
                    />
                    <p
                      id={`course-${lectureId}-review-error`}
                      className={cn(
                        "mt-2 min-h-5 text-sm",
                        submitError ? "text-destructive" : "text-muted-foreground",
                      )}
                      aria-live="polite"
                    >
                      {submitError ?? `최소 ${MIN_REVIEW_LENGTH}자 이상 작성해 주세요.`}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        submitReview.isPending ||
                        content.trim().length < MIN_REVIEW_LENGTH
                      }
                    >
                      {submitReview.isPending ? (
                        <>
                          <Loader2 aria-hidden="true" className="animate-spin" />
                          등록 중…
                        </>
                      ) : (
                        "후기 등록"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : viewer ? (
            <div className="flex flex-col gap-3 rounded-[18px] border bg-muted/30 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MessageSquareText aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{viewerMessage(seedContent ? "SEED_COURSE" : viewer.reason)}</span>
              </div>
              {viewer.reason === "LOGIN_REQUIRED" && loginHref && !seedContent ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={loginHref}>로그인</Link>
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={ratingFilter === null ? "secondary" : "ghost"}
                aria-pressed={ratingFilter === null}
                onClick={() => handleRatingFilter(null)}
              >
                전체 {formatCount(summary?.total ?? 0)}
              </Button>
              {ratingFilter ? (
                <Badge variant="outline" className="rounded-full">
                  {ratingFilter}점 후기 {formatCount(data?.pageInfo.totalItems ?? 0)}개
                </Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor={`course-${lectureId}-review-sort`} className="text-sm text-muted-foreground">
                정렬
              </label>
              <select
                id={`course-${lectureId}-review-sort`}
                name="reviewSort"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as ReviewSort)
                  setPage(1)
                }}
                className="h-10 rounded-xl border bg-card px-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
              >
                <option value="latest">최신순</option>
                <option value="highest">높은 평점순</option>
                <option value="lowest">낮은 평점순</option>
              </select>
            </div>
          </div>

          {data?.items.length ? (
            <div className="space-y-3" aria-busy={reviewsQuery.isFetching}>
              {data.items.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[18px] border border-border/80 bg-card p-5 md:p-6"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10 shrink-0">
                      {review.author.profileImageUrl ? (
                        <AvatarImage
                          src={review.author.profileImageUrl}
                          alt=""
                        />
                      ) : null}
                      <AvatarFallback>{getInitials(review.author.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-bold">
                          {review.author.displayName}
                        </h3>
                        {review.verifiedPurchase ? (
                          <Badge
                            variant="secondary"
                            className="rounded-full px-2 py-0.5 text-[11px]"
                          >
                            <CheckCircle2 aria-hidden="true" className="size-3" />
                            수강 확인
                          </Badge>
                        ) : null}
                        {typeof review.progressPercent === "number" &&
                        review.progressPercent > 0 ? (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            수강 {review.progressPercent}%
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <DisplayStars rating={review.rating} />
                        <span className="text-xs text-muted-foreground">
                          {formatReviewDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap break-words text-pretty text-[15px] leading-7 text-foreground/90">
                    {review.content}
                  </p>

                  {review.replies.length ? (
                    <div className="mt-5 space-y-3">
                      {review.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-[14px] border border-primary/15 bg-primary/[0.035] p-4"
                        >
                          <div className="flex items-center gap-2">
                            <CornerDownRight
                              aria-hidden="true"
                              className="size-4 text-primary"
                            />
                            <Avatar className="size-6">
                              {reply.author.profileImageUrl ? (
                                <AvatarImage
                                  src={reply.author.profileImageUrl}
                                  alt=""
                                />
                              ) : null}
                              <AvatarFallback>
                                {getInitials(reply.author.displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold">
                              {reply.author.displayName}
                            </span>
                            <Badge
                              variant="outline"
                              className="rounded-full border-primary/20 text-[10px] text-primary"
                            >
                              {reply.author.role === "ADMIN" ? "운영자 답변" : "강사 답변"}
                            </Badge>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {formatReviewDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/85">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed bg-muted/20 px-5 py-12 text-center">
              <MessageSquareText
                aria-hidden="true"
                className="mx-auto size-8 text-muted-foreground"
              />
              <h3 className="mt-3 font-bold">
                {ratingFilter ? `${ratingFilter}점 후기가 없습니다` : "아직 등록된 후기가 없습니다"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {ratingFilter
                  ? "다른 평점을 선택하거나 전체 후기를 확인해 보세요."
                  : "첫 번째 수강 후기를 기다리고 있습니다."}
              </p>
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="후기 페이지"
              className="flex flex-wrap items-center justify-center gap-1 pt-2"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="이전 후기 페이지"
                disabled={!data?.pageInfo.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              {visiblePages.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  size="icon"
                  variant={pageNumber === page ? "outline" : "ghost"}
                  aria-label={`후기 ${pageNumber}페이지`}
                  aria-current={pageNumber === page ? "page" : undefined}
                  onClick={() => setPage(pageNumber)}
                  className="tabular-nums"
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="다음 후기 페이지"
                disabled={!data?.pageInfo.hasNextPage}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  )
}

export default CourseReviews
