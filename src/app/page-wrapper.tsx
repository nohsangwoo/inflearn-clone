"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Heart,
  Mail,
  MonitorPlay,
  Search,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { brand, withLocalePath, withLoginRedirectPath } from "@/lib/brand"
import { getCoursePreviewImage } from "@/lib/course-images"
import { getEnrollmentStatusLabel, type EnrollmentAvailabilityStatus } from "@/lib/enrollment-window"
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"

type ApiCourse = {
  id: number
  title: string
  slug?: string | null
  shortDescription?: string | null
  description: string | null
  category?: string | null
  level?: string | null
  tags?: string[]
  price: number
  discountPrice?: number | null
  imageUrl?: string | null
  createdAt: string
  purchaseCount?: number
  reviewCount?: number
  likeCount?: number
  liked?: boolean
  avgRating?: number
  enrollmentStatus?: EnrollmentAvailabilityStatus | null
  enrollmentCapacity?: number | null
  enrollmentAppliedCount?: number | null
  remainingSeats?: number | null
  instructor?: { nickname?: string | null; email?: string }
}

const categories = ["전체", "웹 개발", "게임 개발", "AI", "미디어", "크리에이터", "비즈니스", "디자인"]
const PAGE_SIZE = 15

const creatorKeywords = [
  "강의 플랫폼 제작",
  "LMS 제작",
  "강의 판매 사이트",
  "홈페이지 제작",
  "HLS 스트리밍",
  "강의 SEO",
  "수강신청 관리",
  "판매자 정산",
]

const platformProofs = [
  {
    icon: MonitorPlay,
    title: "강의 판매 흐름을 실제 화면으로 증명",
    body: "목록, 상세, 수강신청, 입금 확인, 수강권한 부여까지 강의 플랫폼 제작 문의자가 바로 확인할 수 있는 레퍼런스입니다.",
  },
  {
    icon: Code2,
    title: "웹사이트 제작과 LMS 개발을 한 번에",
    body: "Next.js, Neon DB, Firebase Auth, S3, HLS 영상 수강 구조를 연결해 교육용 홈페이지와 운영 대시보드를 함께 설계합니다.",
  },
  {
    icon: Target,
    title: "검색 노출까지 고려한 강의 상세",
    body: "강의 제목, 태그, 커리큘럼, FAQ성 설명, 메타 데이터, sitemap을 강의별로 구성해 SEO 유입을 노립니다.",
  },
]

const buildTracks = [
  ["Discovery", "강의 판매 방식, 수강신청 방식, 정산 흐름, 관리자 권한을 먼저 설계합니다."],
  ["Build", "수강생 화면, 판매자 대시보드, 최고관리자 승인/정산, 영상 업로드 구조를 구현합니다."],
  ["Launch", "SEO, sitemap, OG, 검색 콘솔 등록, 배포 도메인, 운영 체크리스트를 정리합니다."],
]

const seoKeywordDeck = [
  "럿지",
  "주식회사럿지",
  "링구스트",
  "Lingoost",
  "LMS",
  "강의 플랫폼",
  "강의 플랫폼 제작",
  "홈페이지 제작",
  "온라인 교육 플랫폼",
  "영상 강의 플랫폼",
  "HLS 강의",
  "강의 SEO",
]

function formatPrice(course: ApiCourse) {
  const effective =
    typeof course.discountPrice === "number" && course.discountPrice < course.price
      ? course.discountPrice
      : course.price
  if (effective === 0) return "무료"
  return `₩${effective.toLocaleString()}`
}

function getCourseImage(course: ApiCourse) {
  return getCoursePreviewImage(course.imageUrl)
}

export default function HomePageWrapper() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState("전체")
  const [sort, setSort] = useState<"latest" | "best" | "priceAsc">("latest")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["lingoost-courses", keyword, category, sort, page],
    queryFn: async () => {
      const { data } = await axios.get("/api/courses", {
        params: {
          page,
          pageSize: PAGE_SIZE,
          sort,
          q: keyword || undefined,
          category: category === "전체" ? undefined : category,
        },
      })
      return data as { total: number; items: ApiCourse[]; degraded?: boolean }
    },
    retry: false,
  })

  const courses = useMemo(() => {
    return data?.items ?? []
  }, [data?.items])
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const visiblePages = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    const end = Math.min(totalPages, start + 4)
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [page, totalPages])
  const resultStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const resultEnd = Math.min(total, page * PAGE_SIZE)

  const likeMutation = useMutation<
    { liked: boolean },
    unknown,
    { courseId: number; nextLiked: boolean },
    { previousQueries: Array<[readonly unknown[], { total: number; items: ApiCourse[] } | undefined]> }
  >({
    mutationFn: async ({ courseId, nextLiked }) => {
      const { data } = await axios.post(`/api/courses/${courseId}/like`, { liked: nextLiked })
      return data as { liked: boolean }
    },
    onMutate: async ({ courseId, nextLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["lingoost-courses"] })
      const previousQueries = queryClient.getQueriesData<{ total: number; items: ApiCourse[] }>({
        queryKey: ["lingoost-courses"],
      })

      queryClient.setQueriesData<{ total: number; items: ApiCourse[] }>(
        { queryKey: ["lingoost-courses"] },
        (current) => {
          if (!current) return current
          return {
            ...current,
            items: current.items.map((item) => {
              if (item.id !== courseId) return item
              const wasLiked = Boolean(item.liked)
              return {
                ...item,
                liked: nextLiked,
                likeCount: nextLiked && !wasLiked
                  ? (item.likeCount ?? 0) + 1
                  : !nextLiked && wasLiked
                    ? Math.max(0, (item.likeCount ?? 0) - 1)
                    : item.likeCount,
              }
            }),
          }
        },
      )

      return { previousQueries }
    },
    onError: (error, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, previous]) => {
        queryClient.setQueryData(queryKey, previous)
      })
      const anyError = error as { response?: { status?: number; data?: { message?: string } }; message?: string }
      if (anyError?.response?.status === 401) {
        toast.error("로그인 후 관심 강의를 저장할 수 있습니다.")
        return
      }
      toast.error(anyError?.response?.data?.message || anyError?.message || "관심 강의 저장에 실패했습니다.")
    },
    onSuccess: ({ liked }, { courseId }) => {
      queryClient.setQueriesData<{ total: number; items: ApiCourse[] }>(
        { queryKey: ["lingoost-courses"] },
        (current) => {
          if (!current) return current
          return {
            ...current,
            items: current.items.map((item) => item.id === courseId ? { ...item, liked } : item),
          }
        },
      )
    },
  })

  const handleToggleLike = (course: ApiCourse) => {
    if (!user) {
      toast.error("로그인 후 관심 강의를 저장할 수 있습니다.")
      router.push(withLocalePath(pathname, "/login"))
      return
    }
    likeMutation.mutate({ courseId: course.id, nextLiked: !course.liked })
  }

  return (
    <main className="bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-6 md:pb-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[14px] font-medium text-muted-foreground">강의 판매자와 수강생을 잇는 웹 우선 마켓</p>
          <h1 className="mt-3 text-[28px] font-bold leading-[1.43] md:text-[32px]">
            {brand.name}에서 다음 강의를 찾아보세요
          </h1>
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-full border border-border bg-background p-2 marketplace-shadow">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-[1.2fr_0.8fr_0.8fr_56px] md:divide-x md:divide-y-0">
            <label className="px-5 py-3">
              <span className="block text-[14px] font-medium text-foreground">무엇을 배우나요?</span>
              <input
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value)
                  setPage(1)
                }}
                placeholder="HLS, Next.js, 강의 기획"
                className="mt-1 w-full bg-transparent text-[14px] text-muted-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
            <label className="px-5 py-3">
              <span className="block text-[14px] font-medium text-foreground">카테고리</span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value)
                  setPage(1)
                }}
                className="mt-1 w-full appearance-none bg-transparent text-[14px] text-muted-foreground outline-none"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="px-5 py-3">
              <span className="block text-[14px] font-medium text-foreground">정렬</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as typeof sort)
                  setPage(1)
                }}
                className="mt-1 w-full appearance-none bg-transparent text-[14px] text-muted-foreground outline-none"
              >
                <option value="latest">최신 강의</option>
                <option value="best">인기 강의</option>
                <option value="priceAsc">낮은 가격</option>
              </select>
            </label>
            <div className="flex items-center justify-center p-2">
              <Button size="icon" className="size-12 rounded-full" aria-label="검색">
                <Search className="size-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => {
                setCategory(item)
                setPage(1)
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-[14px] font-medium transition-colors",
                category === item
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-medium leading-[1.18]">시즌제 강의 둘러보기</h2>
            <p className="mt-2 text-[14px] leading-[1.43] text-muted-foreground">
              계좌 입금 확인 후 판매자가 수강권한을 열어주는 시즌제 강의입니다.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden rounded-full px-4 md:inline-flex">
            <Link href={user ? withLocalePath(pathname, "/admin") : withLoginRedirectPath(pathname, "/admin")}>
              강의 올리기
              <BookOpen className="size-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-[14px] border border-border bg-card p-8 text-sm text-muted-foreground">강의 목록을 불러오는 중입니다.</div>
        ) : courses.length === 0 ? (
          <div className="rounded-[14px] border border-border bg-card p-8 text-sm text-muted-foreground">
            조건에 맞는 강의가 아직 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {courses.map((course, index) => (
              <CourseTile
                key={`${course.id}-${course.title}`}
                course={course}
                image={getCourseImage(course)}
                pathname={pathname}
                index={index}
                onToggleLike={handleToggleLike}
                isLikePending={likeMutation.isPending}
              />
            ))}
          </div>
        )}

        <div className="mt-9 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[14px] text-muted-foreground">
            총 <span className="font-semibold text-foreground">{total.toLocaleString()}</span>개 강의
            {total > 0 ? ` 중 ${resultStart.toLocaleString()}-${resultEnd.toLocaleString()}개 표시` : ""}
          </p>
          {totalPages > 1 ? (
            <nav aria-label="강의 목록 페이지" className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 rounded-full"
                disabled={page === 1 || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                aria-label="이전 페이지"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex items-center gap-1">
                {visiblePages.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    type="button"
                    variant={pageNumber === page ? "default" : "ghost"}
                    className="size-10 rounded-full px-0 text-[14px]"
                    disabled={isLoading}
                    onClick={() => setPage(pageNumber)}
                    aria-current={pageNumber === page ? "page" : undefined}
                  >
                    {pageNumber}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 rounded-full"
                disabled={page === totalPages || isLoading}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                aria-label="다음 페이지"
              >
                <ChevronRight className="size-4" />
              </Button>
            </nav>
          ) : null}
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[0.92fr_1.08fr] md:px-6 md:py-16">
          <div>
            <p className="text-[14px] font-semibold text-primary">For course creators</p>
            <h2 className="mt-3 text-[26px] font-semibold leading-[1.18] md:text-[32px]">
              강의를 팔고 싶다면, 업로드 버튼보다 먼저 필요한 건 운영 흐름입니다.
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
              링구스트는 수강생에게는 강의 마켓처럼 보이지만, 강의 판매자와 운영자에게는 모집, 입금 확인,
              수강권한, 정산, SEO 노출까지 이어지는 실제 강의 플랫폼 제작 레퍼런스입니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {creatorKeywords.map((keyword) => (
                <Badge key={keyword} variant="outline" className="rounded-full bg-background px-3 py-1">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {platformProofs.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="rounded-[14px] border border-border bg-card p-5 marketplace-shadow">
                  <div className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-[16px] font-semibold">{item.title}</h3>
                      <p className="mt-2 text-[14px] leading-6 text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <p className="text-[14px] font-semibold text-muted-foreground">LMS / Website build reference</p>
              <h2 className="mt-3 text-[24px] font-semibold leading-[1.2] md:text-[30px]">
                이 사이트 자체가 강의 플랫폼 제작 문의를 받기 위한 포트폴리오입니다.
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
                주식회사 럿지는 공공기관, 교육, 병원, 브랜드 홈페이지, 업무 시스템, AI 자동화 프로젝트를
                다뤄온 개발사입니다. 링구스트는 그 경험을 강의 판매형 LMS로 압축한 레퍼런스입니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-5">
                  <Link href={`mailto:milli@molluhub.com?subject=${encodeURIComponent("링구스트 / 강의 플랫폼 제작 문의")}`}>
                    제작 문의하기
                    <Mail className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href={withLocalePath(pathname, "/company")}>
                    럿지 소개 보기
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {buildTracks.map(([title, body], index) => (
                <article key={title} className="rounded-[14px] border border-border bg-background p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-primary">0{index + 1}</span>
                    <CheckCircle2 className="size-5 text-foreground" />
                  </div>
                  <h3 className="text-[16px] font-semibold">{title}</h3>
                  <p className="mt-3 text-[14px] leading-6 text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[24px] border border-border bg-background p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary">
                  <Sparkles className="size-4" />
                  SEO keyword map
                </p>
                <h3 className="mt-3 text-[22px] font-semibold leading-[1.2]">검색어가 자연스럽게 쌓이는 구조</h3>
                <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                  키워드를 억지로 반복하기보다, 강의 목록, 상세, 커리큘럼, 회사 정보, 푸터, sitemap,
                  JSON-LD에 같은 의미망을 일관되게 배치합니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {seoKeywordDeck.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-secondary px-3 py-2 text-[13px] font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-[1fr_0.9fr] md:px-6">
          <div>
            <p className="text-[14px] font-semibold text-muted-foreground">What buyers ask first</p>
            <h2 className="mt-3 text-[24px] font-semibold leading-[1.2] md:text-[30px]">
              “인프런 같은 강의 플랫폼을 우리 브랜드로 만들 수 있나요?”
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
              가능합니다. 다만 처음부터 거대한 플랫폼을 복제하기보다, 판매할 강의의 모집 방식과 결제/입금 확인,
              수강권한, 영상 보안, SEO 유입, 운영자 승인 흐름을 먼저 맞추는 것이 비용과 운영 리스크를 줄입니다.
            </p>
          </div>
          <div className="grid gap-3">
            {[
              ["강의자 모집형", "강사가 직접 강의 소개, 태그, 커리큘럼, 모집기간을 등록합니다."],
              ["계좌입금 MVP", "토스페이먼츠 전에도 수강신청, 입금 확인, 수강권한 부여를 운영할 수 있습니다."],
              ["영상 중심 LMS", "S3 기반 영상 저장, HLS 변환, 자막/더빙 확장을 고려해 설계합니다."],
            ].map(([title, body]) => (
              <div key={title} className="flex gap-4 rounded-[14px] border border-border p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary">
                  <Video className="size-4" />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{title}</h3>
                  <p className="mt-1 text-[14px] leading-6 text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function CourseTile({
  course,
  image,
  pathname,
  index,
  onToggleLike,
  isLikePending,
}: {
  course: ApiCourse
  image: string
  pathname: string
  index: number
  onToggleLike: (course: ApiCourse) => void
  isLikePending: boolean
}) {
  const courseHref = withLocalePath(pathname, `/course/${course.id}`)
  const discount =
    typeof course.discountPrice === "number" && course.discountPrice < course.price && course.price > 0
      ? Math.round((1 - course.discountPrice / course.price) * 100)
      : null

  return (
    <Link href={courseHref} className="group block min-w-0">
      <article className="min-w-0">
        <div className="relative aspect-[1200/781] overflow-hidden rounded-[14px] bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={course.title}
            className="photo-zoom h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-[11px] font-semibold shadow-sm">
            {course.enrollmentStatus
              ? getEnrollmentStatusLabel(course.enrollmentStatus)
              : index < 3 ? "인기 강의" : course.category || "강의"}
          </div>
          {discount ? (
            <div className="absolute bottom-3 right-3 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-sm">
              {discount}% OFF
            </div>
          ) : null}
          <button
            type="button"
            aria-label="관심 강의"
            aria-pressed={Boolean(course.liked)}
            disabled={isLikePending}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onToggleLike(course)
            }}
            className={cn(
              "absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-primary disabled:cursor-wait disabled:opacity-70",
              course.liked && "text-primary",
            )}
          >
            <Heart className={cn("size-5", course.liked && "fill-primary text-primary")} />
          </button>
          <div className="absolute bottom-3 left-3 flex gap-1">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className={cn("size-1.5 rounded-full bg-background", dot === 0 ? "opacity-100" : "opacity-60")} />
            ))}
          </div>
        </div>

        <div className="pt-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 truncate text-[16px] font-semibold leading-[1.25]">{course.title}</h3>
            <span className="inline-flex shrink-0 items-center gap-1 text-[14px] text-foreground">
              <Star className="size-3.5 fill-foreground" />
              {course.avgRating?.toFixed(2) ?? "4.80"}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 min-h-10 text-[14px] leading-[1.43] text-muted-foreground">
            {course.shortDescription || course.description || "강의 소개가 곧 업데이트됩니다."}
          </p>
          {typeof course.enrollmentCapacity === "number" ? (
            <div className="mt-2 text-[13px] text-muted-foreground">
              이번 시즌 {course.enrollmentAppliedCount ?? 0}/{course.enrollmentCapacity}명 신청
              {typeof course.remainingSeats === "number" ? ` · 잔여 ${course.remainingSeats}석` : ""}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(course.tags ?? []).slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full border-border px-2 py-0 text-[11px]">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="text-[14px] text-muted-foreground">
              <div>{course.instructor?.nickname || course.instructor?.email || "링구스트 판매자"}</div>
              <div className="mt-1 inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {course.purchaseCount?.toLocaleString() ?? "0"}명
              </div>
            </div>
            <div className="text-right text-[14px]">
              <div className="font-semibold text-foreground">{formatPrice(course)}</div>
              {discount ? <div className="text-[13px] font-semibold text-primary">얼리버드 {discount}%</div> : null}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
