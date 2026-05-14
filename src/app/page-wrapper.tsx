"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { BookOpen, Heart, Search, Star, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { brand, toCdnUrl, withLocalePath } from "@/lib/brand"
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
  avgRating?: number
  instructor?: { nickname?: string | null; email?: string }
}

const previewImages = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
]

const fallbackCourses: ApiCourse[] = [
  {
    id: 101,
    title: "Next.js로 강의 거래소 만들기",
    shortDescription: "상품, 수강신청, 결제 확장, SEO까지 웹 플랫폼의 뼈대를 완성합니다.",
    description: "웹 우선 강의 플랫폼을 직접 만들며 서비스 구조를 익힙니다.",
    category: "웹 개발",
    level: "중급",
    tags: ["Next.js", "Drizzle", "SEO"],
    price: 99000,
    discountPrice: 69000,
    imageUrl: previewImages[0],
    createdAt: new Date().toISOString(),
    purchaseCount: 1240,
    reviewCount: 186,
    avgRating: 4.88,
    instructor: { nickname: "박살랩" },
  },
  {
    id: 102,
    title: "HLS 스트리밍과 영상 운영",
    shortDescription: "ffmpeg, HLS, 자막, 더빙 트랙을 강의 서비스 흐름에 맞게 설계합니다.",
    description: "동영상 강의를 판매할 때 필요한 HLS 운영 전략을 다룹니다.",
    category: "미디어",
    level: "고급",
    tags: ["HLS", "FFmpeg", "Caption"],
    price: 129000,
    discountPrice: null,
    imageUrl: previewImages[1],
    createdAt: new Date().toISOString(),
    purchaseCount: 520,
    reviewCount: 73,
    avgRating: 4.91,
    instructor: { nickname: "스트림마스터" },
  },
  {
    id: 103,
    title: "AI 시대 판매되는 강의 기획법",
    shortDescription: "검색되는 커리큘럼, 전환되는 상세 페이지, 완주율 높은 수업 설계.",
    description: "강의 판매자가 콘텐츠를 시장에 맞게 설계하는 법을 배웁니다.",
    category: "크리에이터",
    level: "입문",
    tags: ["기획", "마케팅", "커리큘럼"],
    price: 59000,
    discountPrice: 39000,
    imageUrl: previewImages[2],
    createdAt: new Date().toISOString(),
    purchaseCount: 870,
    reviewCount: 92,
    avgRating: 4.74,
    instructor: { nickname: "콘텐츠빌더" },
  },
  {
    id: 104,
    title: "수강생이 끝까지 보는 강의 편집",
    shortDescription: "긴 영상보다 오래 남는 리듬, 챕터, 프리뷰 이미지를 설계합니다.",
    description: "촬영 이후 실제 판매 페이지에 올라가는 결과물을 다듬습니다.",
    category: "디자인",
    level: "입문",
    tags: ["편집", "썸네일", "완주율"],
    price: 79000,
    discountPrice: 59000,
    imageUrl: previewImages[3],
    createdAt: new Date().toISOString(),
    purchaseCount: 438,
    reviewCount: 61,
    avgRating: 4.82,
    instructor: { nickname: "컷앤런" },
  },
  {
    id: 105,
    title: "강의 판매자를 위한 SEO 실전",
    shortDescription: "태그, 메타 타이틀, 사이트맵, 검색 의도를 강의 등록 폼에 녹입니다.",
    description: "강의가 검색 결과에 남도록 구조화하는 방법을 다룹니다.",
    category: "비즈니스",
    level: "중급",
    tags: ["SEO", "검색", "콘텐츠"],
    price: 89000,
    discountPrice: null,
    imageUrl: previewImages[4],
    createdAt: new Date().toISOString(),
    purchaseCount: 312,
    reviewCount: 44,
    avgRating: 4.79,
    instructor: { nickname: "검색설계자" },
  },
  {
    id: 106,
    title: "자동 더빙과 다국어 강의 운영",
    shortDescription: "ElevenLabs 기반 더빙을 수업 단위로 승인하고 운영하는 실전 플로우.",
    description: "다국어 오디오 트랙을 운영하고 관리하는 방식을 배웁니다.",
    category: "AI",
    level: "고급",
    tags: ["AI", "더빙", "글로벌"],
    price: 119000,
    discountPrice: 99000,
    imageUrl: previewImages[5],
    createdAt: new Date().toISOString(),
    purchaseCount: 284,
    reviewCount: 39,
    avgRating: 4.86,
    instructor: { nickname: "보이스빌더" },
  },
  {
    id: 107,
    title: "1인 강사의 정산과 운영 장부",
    shortDescription: "수강신청, 입금 확인, 수수료율 스냅샷, 수동 승인까지 설계합니다.",
    description: "초기 마켓플레이스 운영에 필요한 장부 흐름을 만듭니다.",
    category: "비즈니스",
    level: "입문",
    tags: ["정산", "입금확인", "운영"],
    price: 49000,
    discountPrice: 0,
    imageUrl: previewImages[6],
    createdAt: new Date().toISOString(),
    purchaseCount: 156,
    reviewCount: 21,
    avgRating: 4.67,
    instructor: { nickname: "운영노트" },
  },
  {
    id: 108,
    title: "초보 판매자용 첫 강의 출시",
    shortDescription: "한 편의 프리뷰에서 첫 유료 커리큘럼까지 필요한 최소 단계를 정리합니다.",
    description: "강의를 처음 파는 사람에게 필요한 등록과 출시 체크리스트입니다.",
    category: "크리에이터",
    level: "입문",
    tags: ["출시", "프리뷰", "판매"],
    price: 69000,
    discountPrice: 49000,
    imageUrl: previewImages[7],
    createdAt: new Date().toISOString(),
    purchaseCount: 221,
    reviewCount: 28,
    avgRating: 4.7,
    instructor: { nickname: "첫강의클럽" },
  },
]

const categories = ["전체", "웹 개발", "AI", "미디어", "크리에이터", "비즈니스", "디자인"]

function formatPrice(course: ApiCourse) {
  const effective =
    typeof course.discountPrice === "number" && course.discountPrice < course.price
      ? course.discountPrice
      : course.price
  if (effective === 0) return "무료"
  return `₩${effective.toLocaleString()}`
}

function getCourseImage(course: ApiCourse, index: number) {
  return toCdnUrl(course.imageUrl) || previewImages[index % previewImages.length]
}

export default function HomePageWrapper() {
  const pathname = usePathname()
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState("전체")
  const [sort, setSort] = useState<"latest" | "best" | "priceAsc">("latest")

  const { data, isLoading } = useQuery({
    queryKey: ["baksal-courses", keyword, category, sort],
    queryFn: async () => {
      const { data } = await axios.get("/api/courses", {
        params: {
          page: 1,
          pageSize: 12,
          sort,
          q: keyword || undefined,
          category: category === "전체" ? undefined : category,
        },
      })
      return data as { total: number; items: ApiCourse[] }
    },
    placeholderData: { total: fallbackCourses.length, items: fallbackCourses },
    retry: false,
  })

  const courses = useMemo(() => {
    const items = data?.items?.length ? data.items : fallbackCourses
    if (!keyword && category === "전체") return items
    return items.filter((course) => {
      const text = [
        course.title,
        course.shortDescription,
        course.description,
        course.category,
        course.level,
        ...(course.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      const matchesKeyword = keyword ? text.includes(keyword.toLowerCase()) : true
      const matchesCategory = category === "전체" ? true : course.category === category
      return matchesKeyword && matchesCategory
    })
  }, [category, data?.items, keyword])

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
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="HLS, Next.js, 강의 기획"
                className="mt-1 w-full bg-transparent text-[14px] text-muted-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>
            <label className="px-5 py-3">
              <span className="block text-[14px] font-medium text-foreground">카테고리</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
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
                onChange={(event) => setSort(event.target.value as typeof sort)}
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
              onClick={() => setCategory(item)}
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

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-medium leading-[1.18]">프리뷰 강의</h2>
            <p className="mt-2 text-[14px] leading-[1.43] text-muted-foreground">
              아직 DB가 비어 있어도 시장에 보일 강의 카탈로그를 먼저 확인할 수 있습니다.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden rounded-full px-4 md:inline-flex">
            <Link href={withLocalePath(pathname, "/admin")}>
              강의 올리기
              <BookOpen className="size-4" />
            </Link>
          </Button>
        </div>

        {isLoading && !data ? (
          <div className="rounded-[14px] border border-border bg-card p-8 text-sm text-muted-foreground">강의 목록을 불러오는 중입니다.</div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course, index) => (
              <CourseTile key={`${course.id}-${course.title}`} course={course} image={getCourseImage(course, index)} pathname={pathname} index={index} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
          {[
            ["Support", "수강 신청, 계좌입금, 수강권한을 단계별로 확인합니다."],
            ["Hosting", "판매자는 계좌, 커리큘럼, HLS, 자막, 더빙 상태를 관리합니다."],
            ["Baksal", "지금은 0% 수수료 이벤트, 이후 수수료율 스냅샷으로 운영됩니다."],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="text-[16px] font-medium">{title}</h3>
              <p className="mt-3 text-[14px] leading-[1.43] text-muted-foreground">{body}</p>
            </div>
          ))}
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
}: {
  course: ApiCourse
  image: string
  pathname: string
  index: number
}) {
  const courseHref = withLocalePath(pathname, `/course/${course.id}`)
  const discount =
    typeof course.discountPrice === "number" && course.discountPrice < course.price && course.price > 0
      ? Math.round((1 - course.discountPrice / course.price) * 100)
      : null

  return (
    <Link href={courseHref} className="group block min-w-0">
      <article className="min-w-0">
        <div className="relative aspect-square overflow-hidden rounded-[14px] bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={course.title}
            className="photo-zoom h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-3 top-3 rounded-full bg-background px-3 py-1 text-[11px] font-semibold shadow-sm">
            {index < 3 ? "인기 프리뷰" : course.category || "강의"}
          </div>
          <button
            type="button"
            aria-label="관심 강의"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors group-hover:text-primary"
          >
            <Heart className="size-5" />
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(course.tags ?? []).slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full border-border px-2 py-0 text-[11px]">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div className="text-[14px] text-muted-foreground">
              <div>{course.instructor?.nickname || course.instructor?.email || "박살강의 판매자"}</div>
              <div className="mt-1 inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {course.purchaseCount?.toLocaleString() ?? "0"}명
              </div>
            </div>
            <div className="text-right text-[14px]">
              <div className="font-semibold text-foreground">{formatPrice(course)}</div>
              {discount ? <div className="text-[13px] text-muted-foreground">{discount}% off</div> : null}
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
