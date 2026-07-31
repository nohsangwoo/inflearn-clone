"use client"

import { useMemo, useState, type CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  Captions,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
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
import { withLocalePath, withLoginRedirectPath } from "@/lib/brand"
import type {
  PublicCourseCatalogItem,
  PublicCourseCatalogResult,
} from "@/lib/course-catalog-data"
import { getCoursePreviewImage } from "@/lib/course-images"
import { getEnrollmentStatusLabel } from "@/lib/enrollment-window"
import { defaultHomepageSections, type HomepageSection } from "@/lib/homepage-sections"
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"

type ApiCourse = PublicCourseCatalogItem & {
  liked?: boolean
}

type CatalogResponse = Omit<PublicCourseCatalogResult, "items"> & {
  items: ApiCourse[]
  degraded?: boolean
}

type HomePageWrapperProps = {
  initialCatalog: PublicCourseCatalogResult
  initialHomepageSections: HomepageSection[]
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

export default function HomePageWrapper({
  initialCatalog,
  initialHomepageSections,
}: HomePageWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const [draftKeyword, setDraftKeyword] = useState("")
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState("전체")
  const [sort, setSort] = useState<"latest" | "best" | "priceAsc">("latest")
  const [page, setPage] = useState(1)
  const isInitialCatalogView =
    !keyword && category === "전체" && sort === "latest" && page === 1

  const { data, isLoading } = useQuery({
    queryKey: ["lingoost-courses", user?.id ?? "guest", keyword, category, sort, page],
    queryFn: async ({ signal }) => {
      const { data } = await axios.get("/api/courses", {
        signal,
        params: {
          page,
          pageSize: PAGE_SIZE,
          sort,
          q: keyword || undefined,
          category: category === "전체" ? undefined : category,
        },
      })
      return data as CatalogResponse
    },
    initialData: !user && isInitialCatalogView ? initialCatalog : undefined,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })
  const { data: homepageSectionData } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: async ({ signal }) => {
      const { data } = await axios.get("/api/site/home-sections", { signal })
      return data as { sections: HomepageSection[] }
    },
    initialData: { sections: initialHomepageSections },
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const courses = useMemo(() => {
    return data?.items ?? []
  }, [data?.items])
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const homepageSections = homepageSectionData?.sections ?? defaultHomepageSections
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
    <main className="overflow-hidden bg-background text-foreground">
      <section className="px-3 pt-3 md:px-6 md:pt-6">
        <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[26px] bg-[#191517] text-[#fff9f6] md:rounded-[34px]">
          <div className="signal-grid absolute inset-0 opacity-[0.08]" />
          <div className="relative grid min-h-[620px] lg:grid-cols-[0.88fr_1.12fr]">
            <div className="flex flex-col justify-between px-6 py-10 md:px-10 md:py-12 lg:px-14 lg:py-16">
              <div>
                <div
                  className="editorial-label hero-reveal flex items-center gap-2 text-[#ff9bab]"
                  style={{ "--reveal-index": 0 } as CSSProperties}
                >
                  <span className="size-2 rounded-full bg-[#ff385c]" />
                  Project-based learning · Lingoost
                </div>
                <h1
                  className="font-brand hero-reveal mt-7 text-[clamp(2.7rem,3.7vw,4.8rem)] font-black leading-[0.98] tracking-[-0.055em]"
                  style={{ "--reveal-index": 1 } as CSSProperties}
                >
                  <span className="block">배우고, 완성하고,</span>
                  <span className="block">다음 기회로.</span>
                </h1>
                <p
                  className="hero-reveal mt-7 max-w-[34rem] text-[15px] leading-7 text-[#d9ced1] md:text-base"
                  style={{ "--reveal-index": 2 } as CSSProperties}
                >
                  현업 강의자와 정해진 시즌 동안 하나의 결과물을 완성하세요. 모집 일정,
                  커리큘럼, 수강 방식과 실제 후기를 확인하고 내게 맞는 강의를 선택할 수 있습니다.
                </p>
                <div
                  className="hero-reveal mt-8 flex flex-wrap gap-3"
                  style={{ "--reveal-index": 3 } as CSSProperties}
                >
                  <Button asChild className="rounded-full bg-[#ff385c] px-6 text-[#fff9f6] hover:bg-[#e9284c]">
                    <Link href="#course-catalog">
                      이번 시즌 강의 보기
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-[#665b5f] bg-transparent px-6 text-[#fff9f6] hover:bg-[#2a2427] hover:text-[#fff9f6]">
                    <Link href={user ? withLocalePath(pathname, "/admin") : withLoginRedirectPath(pathname, "/admin")}>
                      강의 개설 안내
                    </Link>
                  </Button>
                </div>
              </div>

              <div
                className="hero-reveal mt-12 grid grid-cols-3 border-t border-[#40373a] pt-5"
                style={{ "--reveal-index": 4 } as CSSProperties}
              >
                {[
                  { icon: Target, label: "프로젝트 중심", body: "결과물이 남는 수업" },
                  { icon: Captions, label: "명확한 커리큘럼", body: "범위와 일정을 먼저 확인" },
                  { icon: Users, label: "시즌 운영", body: "같은 목표로 함께 완주" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="border-l border-[#40373a] px-3 first:border-l-0 first:pl-0 md:px-5">
                      <Icon className="size-4 text-[#ff718b]" />
                      <div className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#fff9f6]">
                        {item.label}
                      </div>
                      <div className="mt-1 text-[11px] text-[#9f9296]">{item.body}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative min-h-[390px] border-t border-[#40373a] p-3 md:min-h-[520px] md:p-5 lg:min-h-0 lg:border-l lg:border-t-0">
              <div className="relative h-full min-h-[365px] overflow-hidden rounded-[20px] md:min-h-[490px] md:rounded-[26px]">
                <Image
                  src="/course-detail-scenes/course-108-workshop.png"
                  alt="강의 등록, 커리큘럼, 모집 일정과 촬영 환경을 함께 관리하는 강의 개설 워크숍"
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#100d0f]/90 via-[#100d0f]/5 to-[#100d0f]/15" />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-[#191517]/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] backdrop-blur md:left-6 md:top-6">
                  <span className="size-1.5 rounded-full bg-[#ff385c]" />
                  Course launch workspace
                </div>
                <div className="absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
                  <div className="max-w-[34rem] rounded-[18px] border border-white/15 bg-[#191517]/82 p-5 shadow-2xl backdrop-blur-md md:p-6">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#ff9bab]">
                      <CirclePlay className="size-4" />
                      첫 강의 출시 워크숍
                    </div>
                    <p className="font-brand mt-3 text-[18px] font-extrabold leading-snug text-white md:text-[22px]">
                      기획부터 공개·운영까지, 실제 흐름으로 배웁니다.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-[#d9ced1]">
                      {["강의 등록", "커리큘럼", "모집 일정", "공개 수업"].map((label) => (
                        <span key={label} className="rounded-full border border-white/15 px-2.5 py-1">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-2 max-w-7xl px-4 md:-mt-8 md:px-6">
        <div className="rounded-[20px] border border-border/80 bg-card p-2 shadow-md md:rounded-[24px]">
          <form
            className="grid divide-y divide-border/80 md:grid-cols-[1.45fr_0.72fr_0.72fr_auto] md:divide-x md:divide-y-0"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              setKeyword(draftKeyword.trim())
              setPage(1)
            }}
          >
            <label className="flex min-w-0 items-center gap-3 px-4 py-3 md:px-5">
              <Search className="size-5 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="editorial-label block text-muted-foreground">Search courses</span>
                <input
                  value={draftKeyword}
                  onChange={(event) => setDraftKeyword(event.target.value)}
                  placeholder="배우고 싶은 기술이나 프로젝트"
                  className="mt-1 w-full bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
                />
              </span>
            </label>
            <label className="px-4 py-3 md:px-5">
              <span className="editorial-label block text-muted-foreground">Category</span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value)
                  setPage(1)
                }}
                className="mt-1 w-full appearance-none bg-transparent text-[14px] font-semibold text-foreground outline-none"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="px-4 py-3 md:px-5">
              <span className="editorial-label block text-muted-foreground">Order</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as typeof sort)
                  setPage(1)
                }}
                className="mt-1 w-full appearance-none bg-transparent text-[14px] font-semibold text-foreground outline-none"
              >
                <option value="latest">최신 강의</option>
                <option value="best">인기 강의</option>
                <option value="priceAsc">낮은 가격</option>
              </select>
            </label>
            <div className="flex items-center p-2">
              <Button type="submit" className="h-12 w-full rounded-[14px] px-5 md:w-auto" aria-label="선택한 조건으로 강의 찾기">
                강의 찾기
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-5 flex items-center gap-4 overflow-x-auto pb-2">
          <span className="editorial-label hidden shrink-0 text-muted-foreground md:block">Browse by topic</span>
          <div className="flex gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setCategory(item)
                  setPage(1)
                }}
                className={cn(
                  "min-h-11 shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-[background-color,color,border-color] duration-150",
                  category === item
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="course-catalog" className="mx-auto max-w-[1440px] scroll-mt-28 px-4 pb-20 pt-16 md:px-6 md:pt-24">
        <div className="mb-8 flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <p className="editorial-label text-primary">Current season</p>
            <h2 className="font-brand mt-3 text-[clamp(1.9rem,3.8vw,3.4rem)] font-extrabold leading-[1.06] tracking-[-0.04em]">
              이번 시즌 강의
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">
              모집 일정과 정원, 커리큘럼과 실제 수강 후기를 비교하고 목표에 맞는 강의를 선택하세요.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden rounded-full px-4 md:inline-flex">
            <Link href={user ? withLocalePath(pathname, "/admin") : withLoginRedirectPath(pathname, "/admin")}>
              강의 제안하기
              <BookOpen className="size-4" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4" aria-label="강의 목록을 불러오는 중">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[1200/781] rounded-[18px] bg-secondary" />
                <div className="mt-4 h-4 w-3/4 rounded-full bg-secondary" />
                <div className="mt-3 h-3 w-full rounded-full bg-secondary" />
                <div className="mt-2 h-3 w-2/3 rounded-full bg-secondary" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyCourseState pathname={pathname} hasFilter={Boolean(keyword || category !== "전체")} />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseTile
                key={`${course.id}-${course.title}`}
                course={course}
                image={getCourseImage(course)}
                pathname={pathname}
                onToggleLike={handleToggleLike}
                isLikePending={likeMutation.isPending}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">{total.toLocaleString()}개</span>의 공개 강의
            {total > 0 ? ` · ${resultStart.toLocaleString()}–${resultEnd.toLocaleString()} 표시` : ""}
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

      {homepageSections.map((section) => (
        <HomepageMarketingSection key={section.sectionKey} section={section} pathname={pathname} />
      ))}
    </main>
  )
}

function EmptyCourseState({ pathname, hasFilter }: { pathname: string; hasFilter: boolean }) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-border bg-card">
      <div className="grid min-h-[440px] lg:grid-cols-[0.82fr_1.18fr]">
        <div className="flex flex-col justify-between border-b border-border p-7 md:p-10 lg:border-b-0 lg:border-r">
          <div>
            <p className="editorial-label text-primary">
              {hasFilter ? "No matching course" : "Next season loading"}
            </p>
            <h3 className="font-brand mt-5 max-w-[11ch] text-[clamp(2rem,4vw,4rem)] font-extrabold leading-[1.03] tracking-[-0.045em]">
              {hasFilter ? "조건에 맞는 강의를 찾지 못했어요." : "첫 공개 시즌을 선별하고 있습니다."}
            </h3>
            <p className="mt-5 max-w-lg text-[14px] leading-7 text-muted-foreground">
              {hasFilter
                ? "검색어를 줄이거나 전체 카테고리에서 다시 살펴보세요. 공개 승인된 강의만 검색 결과에 표시됩니다."
                : "판매자가 등록한 강의는 운영 검수와 모집 준비를 마친 뒤 공개됩니다. 그동안 다음 시즌의 첫 강의를 제안해 주세요."}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-5">
              <Link href={hasFilter ? withLocalePath(pathname, "/") : withLoginRedirectPath(pathname, "/admin")}>
                {hasFilter ? "전체 강의 보기" : "강의 제안하기"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link href="mailto:milli@molluhub.com?subject=%EB%A7%81%EA%B5%AC%EC%8A%A4%ED%8A%B8%20%EA%B0%95%EC%9D%98%20%ED%94%8C%EB%9E%AB%ED%8F%BC%20%EC%A0%9C%EC%9E%91%20%EB%AC%B8%EC%9D%98">
                플랫폼 제작 문의
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[360px] bg-[#201b1e] p-4 md:p-6">
          <div className="signal-grid absolute inset-0 opacity-10" />
          <div className="relative grid h-full grid-cols-[1.2fr_0.8fr] gap-3">
            <div className="relative overflow-hidden rounded-[18px]">
              <Image
                src="/course-previews/course-209.png"
                alt="준비 중인 게임 AI 강의 비공개 미리보기"
                fill
                sizes="(max-width: 1024px) 60vw, 32vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161214]/75 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                <span>Private slate 01</span>
                <span>Review</span>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-3">
              {[
                ["/course-previews/course-105.png", "SEO 강의 비공개 미리보기", "02"],
                ["/course-previews/course-108.png", "강의 제작 비공개 미리보기", "03"],
              ].map(([src, alt, number]) => (
                <div key={src} className="relative overflow-hidden rounded-[16px]">
                  <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 38vw, 20vw" className="object-cover" />
                  <div className="absolute inset-0 bg-[#171315]/25" />
                  <span className="absolute bottom-3 left-3 text-[9px] font-bold tracking-[0.12em] text-white">
                    PRIVATE · {number}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute right-7 top-7 flex items-center gap-2 rounded-full border border-white/15 bg-[#171315]/70 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
            <span className="size-1.5 rounded-full bg-[#ff385c]" />
            Studio queue
          </div>
        </div>
      </div>
    </div>
  )
}

function HomepageMarketingSection({ section, pathname }: { section: HomepageSection; pathname: string }) {
  if (section.sectionKey === "creators") {
    return (
      <section className="border-t border-border bg-[#f2efec]">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 md:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:py-28">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-4">
              <span className="font-brand text-[64px] font-black leading-none text-primary/20">01</span>
              <p className="editorial-label text-primary">{section.eyebrow}</p>
            </div>
            <h2 className="font-brand mt-6 max-w-[14ch] text-[clamp(2rem,4vw,4.2rem)] font-extrabold leading-[1.04] tracking-[-0.045em]">
              {section.title}
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground">{section.description}</p>
            <div className="mt-8 flex max-w-xl flex-wrap gap-x-4 gap-y-2">
              {creatorKeywords.map((keyword) => (
                <span key={keyword} className="text-[12px] font-semibold text-muted-foreground">
                  <span className="mr-2 text-primary">/</span>
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-foreground">
            {platformProofs.map((item, index) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="grid gap-6 border-b border-border py-8 md:grid-cols-[72px_1fr_auto] md:items-start md:py-10">
                  <span className="font-mono text-[12px] font-semibold tabular-nums text-primary">0{index + 1}</span>
                  <div>
                    <h3 className="font-brand text-[20px] font-extrabold leading-tight md:text-[24px]">{item.title}</h3>
                    <p className="mt-3 max-w-2xl text-[14px] leading-7 text-muted-foreground">{item.body}</p>
                  </div>
                  <Icon className="hidden size-6 text-foreground md:block" strokeWidth={1.6} />
                </article>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  if (section.sectionKey === "build-reference") {
    return (
      <section className="relative overflow-hidden bg-[#1b1719] text-[#fff9f6]">
        <div className="signal-grid absolute inset-0 opacity-[0.06]" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-20 md:px-6 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <div className="flex items-center gap-4">
                <span className="font-brand text-[64px] font-black leading-none text-[#ff385c]/30">02</span>
                <p className="editorial-label text-[#ff8da1]">{section.eyebrow}</p>
              </div>
              <h2 className="font-brand mt-6 max-w-[14ch] text-[clamp(2rem,4vw,4.2rem)] font-extrabold leading-[1.04] tracking-[-0.045em]">
                {section.title}
              </h2>
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-[#b9adb1]">{section.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-[#ff385c] px-5 text-white hover:bg-[#e9284c]">
                  <Link href={`mailto:milli@molluhub.com?subject=${encodeURIComponent("링구스트 / 강의 플랫폼 제작 문의")}`}>
                    제작 문의하기
                    <Mail className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#665b5f] bg-transparent px-5 text-[#fff9f6] hover:bg-[#2a2427] hover:text-[#fff9f6]">
                  <Link href={withLocalePath(pathname, "/company")}>
                    럿지 소개 보기
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t border-[#51474b]">
              {buildTracks.map(([title, body], index) => (
                <article key={title} className="grid gap-4 border-b border-[#51474b] py-7 md:grid-cols-[52px_130px_1fr] md:items-start">
                  <span className="font-mono text-[11px] font-semibold text-[#ff718b]">0{index + 1}</span>
                  <h3 className="font-brand text-[18px] font-extrabold">{title}</h3>
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-[#ff718b]" />
                    <p className="text-[13px] leading-6 text-[#b9adb1]">{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-14 border-y border-[#51474b] py-6">
            <div className="grid gap-6 lg:grid-cols-[0.66fr_1.34fr] lg:items-center">
              <div>
                <p className="editorial-label inline-flex items-center gap-2 text-[#ff8da1]">
                  <Sparkles className="size-4" />
                  Search signal map
                </p>
                <h3 className="font-brand mt-3 text-[20px] font-extrabold leading-tight">검색어가 자연스럽게 쌓이는 구조</h3>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {seoKeywordDeck.map((keyword) => (
                  <span key={keyword} className="text-[12px] font-semibold text-[#b9adb1]">
                    <span className="mr-2 text-[#ff718b]">+</span>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-20 md:px-6 lg:grid-cols-[1fr_0.9fr] lg:py-28">
        <div>
          <div className="flex items-center gap-4">
            <span className="font-brand text-[64px] font-black leading-none text-primary/20">03</span>
            <p className="editorial-label text-primary">{section.eyebrow}</p>
          </div>
          <h2 className="font-brand mt-6 max-w-[15ch] text-[clamp(2rem,4vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.045em]">
            {section.title}
          </h2>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-muted-foreground">{section.description}</p>
        </div>
        <div className="border-t border-foreground">
          {[
            ["강의자 모집형", "강사가 직접 강의 소개, 태그, 커리큘럼, 모집기간을 등록합니다."],
            ["계좌입금 MVP", "토스페이먼츠 전에도 수강신청, 입금 확인, 수강권한 부여를 운영할 수 있습니다."],
            ["영상 중심 LMS", "S3 기반 영상 저장, HLS 변환, 자막/더빙 확장을 고려해 설계합니다."],
          ].map(([title, body], index) => (
            <div key={title} className="grid gap-4 border-b border-border py-7 md:grid-cols-[44px_1fr]">
              <span className="font-mono text-[11px] font-semibold text-primary">0{index + 1}</span>
              <div>
                <div className="flex items-center gap-3">
                  <Video className="size-4 text-primary" />
                  <h3 className="font-brand text-[18px] font-extrabold">{title}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CourseTile({
  course,
  image,
  pathname,
  onToggleLike,
  isLikePending,
}: {
  course: ApiCourse
  image: string
  pathname: string
  onToggleLike: (course: ApiCourse) => void
  isLikePending: boolean
}) {
  const courseHref = withLocalePath(pathname, `/course/${course.id}`)
  const discount =
    typeof course.discountPrice === "number" && course.discountPrice < course.price && course.price > 0
      ? Math.round((1 - course.discountPrice / course.price) * 100)
      : null
  const hasRating = course.reviewCount > 0 && course.avgRating > 0
  const isEnrollmentClosed =
    course.enrollmentStatus === "CLOSED" ||
    course.enrollmentStatus === "FULL" ||
    course.enrollmentStatus === "PAUSED"
  const enrollmentSummary = (() => {
    const capacity =
      typeof course.enrollmentCapacity === "number" ? course.enrollmentCapacity : null

    if (course.enrollmentStatus === "FULL") {
      return capacity ? `정원 ${capacity}명 · 전석 마감` : "이번 시즌 전석 마감"
    }
    if (course.enrollmentStatus === "CLOSED") {
      return capacity ? `이번 시즌 모집 완료 · 정원 ${capacity}명` : "이번 시즌 모집 완료"
    }
    if (course.enrollmentStatus === "PAUSED") {
      return "다음 모집 일정을 준비하고 있어요"
    }
    if (course.enrollmentStatus === "NOT_STARTED") {
      return capacity ? `신청 예정 · 정원 ${capacity}명` : "곧 신청이 시작됩니다"
    }
    if (capacity) {
      const remaining = Math.max(0, Number(course.remainingSeats ?? 0))
      return `${course.enrollmentAppliedCount}/${capacity}명 신청 · ${remaining}석 남음`
    }
    return "현재 수강 신청을 받고 있어요"
  })()

  return (
    <article className="group relative min-w-0">
      <Link href={courseHref} className="block min-w-0">
        <div className="relative aspect-[1200/781] overflow-hidden rounded-[18px] bg-secondary">
          <Image
            src={image}
            alt={course.title}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            className="photo-zoom object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
          />
          <div className="absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-[11px] font-semibold shadow-sm">
            {getEnrollmentStatusLabel(course.enrollmentStatus)}
          </div>
          {discount ? (
            <div className="absolute bottom-3 right-3 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-sm">
              {discount}% OFF
            </div>
          ) : null}
        </div>

        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-brand min-w-0 line-clamp-2 text-[17px] font-extrabold leading-[1.3] tracking-[-0.02em] transition-colors group-hover:text-primary">
              {course.title}
            </h3>
            <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-foreground">
              {hasRating ? (
                <>
                  <Star className="size-3.5 fill-foreground" />
                  {course.avgRating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">
                    ({course.reviewCount.toLocaleString()})
                  </span>
                </>
              ) : (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                  신규
                </span>
              )}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 min-h-10 text-[13px] leading-5 text-muted-foreground">
            {course.shortDescription || course.description || "강의 소개가 곧 업데이트됩니다."}
          </p>
          <div
            className={cn(
              "mt-3 border-l-2 pl-3 text-[12px] font-medium",
              isEnrollmentClosed
                ? "border-muted-foreground/50 text-muted-foreground"
                : "border-primary text-foreground",
            )}
          >
            {enrollmentSummary}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(course.tags ?? []).slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full border-border px-2 py-0 text-[11px]">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex items-end justify-between gap-2 border-t border-border/80 pt-3">
            <div className="text-[12px] text-muted-foreground">
              <div>{course.instructor?.nickname || "링구스트 강사"}</div>
              <div className="mt-1 inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {course.purchaseCount?.toLocaleString() ?? "0"}명
              </div>
            </div>
            <div className="text-right text-[13px]">
              <div className="font-bold text-foreground">{formatPrice(course)}</div>
              {discount ? <div className="text-[13px] font-semibold text-primary">얼리버드 {discount}%</div> : null}
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label={course.liked ? "관심 강의에서 삭제" : "관심 강의로 저장"}
        aria-pressed={Boolean(course.liked)}
        disabled={isLikePending}
        onClick={() => onToggleLike(course)}
        className={cn(
          "absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70",
          course.liked && "text-primary",
        )}
      >
        <Heart className={cn("size-5", course.liked && "fill-primary text-primary")} />
      </button>
    </article>
  )
}
