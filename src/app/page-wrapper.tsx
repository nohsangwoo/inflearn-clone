"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  Video,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const fallbackCourses: ApiCourse[] = [
  {
    id: 101,
    title: "Next.js 결제형 강의 플랫폼 실전",
    shortDescription: "상품, 결제, 수강권, SEO까지 한 번에 연결하는 웹 서비스 제작",
    description: "웹 우선 강의 플랫폼을 직접 만들며 서비스 구조를 익힙니다.",
    category: "웹 개발",
    level: "중급",
    tags: ["Next.js", "Toss", "SEO"],
    price: 99000,
    discountPrice: 69000,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    purchaseCount: 1240,
    reviewCount: 186,
    avgRating: 4.8,
    instructor: { nickname: "박살랩" },
  },
  {
    id: 102,
    title: "HLS 스트리밍과 다국어 더빙 파이프라인",
    shortDescription: "ffmpeg, S3, CloudFront, ElevenLabs로 유료 강의 영상을 안전하게 운영",
    description: "동영상 강의를 판매할 때 필요한 HLS 운영 전략을 다룹니다.",
    category: "미디어",
    level: "고급",
    tags: ["HLS", "FFmpeg", "ElevenLabs"],
    price: 129000,
    discountPrice: null,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    purchaseCount: 520,
    reviewCount: 73,
    avgRating: 4.9,
    instructor: { nickname: "스트림마스터" },
  },
  {
    id: 103,
    title: "AI 시대 판매되는 강의 기획법",
    shortDescription: "검색되는 커리큘럼, 전환되는 상세 페이지, 완주율 높은 수업 설계",
    description: "강의 판매자가 콘텐츠를 시장에 맞게 설계하는 법을 배웁니다.",
    category: "크리에이터",
    level: "입문",
    tags: ["기획", "마케팅", "커리큘럼"],
    price: 59000,
    discountPrice: 39000,
    imageUrl: null,
    createdAt: new Date().toISOString(),
    purchaseCount: 870,
    reviewCount: 92,
    avgRating: 4.7,
    instructor: { nickname: "콘텐츠빌더" },
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
  const image = toCdnUrl(course.imageUrl)
  if (image) return image
  const palettes = [
    "from-[#123c69] via-[#2f6f8f] to-[#70c1b3]",
    "from-[#1d3557] via-[#457b9d] to-[#f6c85f]",
    "from-[#263238] via-[#607d8b] to-[#ef6f6c]",
  ]
  return palettes[index % palettes.length]
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

  const sellerHref = withLocalePath(pathname, "/admin")
  const dashboardHref = withLocalePath(pathname, "/me")

  return (
    <div className="bg-background">
      <section className="border-b bg-[linear-gradient(180deg,oklch(0.995_0.006_104),oklch(0.965_0.018_230))]">
        <div className="mx-auto grid min-h-[520px] max-w-7xl grid-cols-1 gap-10 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:px-6 md:py-14">
          <div className="flex flex-col justify-center gap-8">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="border border-primary/15 bg-secondary/80 text-secondary-foreground">
                  Web-first course marketplace
                </Badge>
                <Badge variant="outline" className="bg-background/70">
                  HLS · Toss Payments · SEO
                </Badge>
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
                  {brand.name}
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  판매자는 강의를 올리고, 수강생은 결제 후 바로 학습합니다. 검색 노출, 다국어 더빙, 자막, 수동 정산까지 처음부터 웹 플랫폼 기준으로 설계합니다.
                </p>
              </div>
            </div>

            <div className="max-w-3xl space-y-3">
              <div className="flex min-h-14 items-center gap-2 rounded-lg border bg-card p-2 shadow-sm">
                <Search className="ml-2 size-5 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="강의명, 기술, 판매자를 검색하세요"
                  className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
                <Button className="h-11 px-4">
                  탐색
                  <ArrowRight className="size-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      category === item
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ["2단계", "업로드 후 HLS 변환"],
                ["서버확정", "금액 검증 결제 승인"],
                ["SEO", "강의별 메타/사이트맵"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border bg-card px-4 py-3">
                  <div className="text-xl font-black text-primary">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <div className="w-full rounded-lg border bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">오늘의 운영 화면</div>
                  <div className="text-xl font-bold">판매자 대시보드 미리보기</div>
                </div>
                <Button asChild variant="outline">
                  <Link href={sellerHref}>
                    열기
                    <LayoutDashboard className="size-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3">
                {[
                  { icon: Video, label: "HLS 처리 대기", value: "3건", tone: "text-primary" },
                  { icon: Sparkles, label: "더빙 생성 완료", value: "18트랙", tone: "text-emerald-700" },
                  { icon: ShieldCheck, label: "정산 검토 예정", value: "₩1,420,000", tone: "text-red-700" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Icon className={cn("size-5", item.tone)} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <span className="font-black">{item.value}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button asChild className="h-11">
                  <Link href={sellerHref}>강의 판매 시작</Link>
                </Button>
                <Button asChild variant="secondary" className="h-11">
                  <Link href={dashboardHref}>내 학습 보기</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black">지금 열려있는 강의</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              결제, 영상, 자막, 더빙까지 판매 가능한 강의 단위로 정리됩니다.
            </p>
          </div>
          <div className="flex gap-2">
            {[
              ["latest", "최신"],
              ["best", "인기"],
              ["priceAsc", "낮은 가격"],
            ].map(([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={sort === value ? "default" : "outline"}
                onClick={() => setSort(value as typeof sort)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && !data ? (
          <div className="rounded-lg border bg-card p-8 text-sm text-muted-foreground">강의 목록을 불러오는 중입니다.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, index) => (
              <CourseTile key={`${course.id}-${course.title}`} course={course} image={getCourseImage(course, index)} pathname={pathname} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 md:grid-cols-3 md:px-6">
          {[
            { icon: GraduationCap, title: "수강생", body: "구매한 강의만 안전하게 열고, 마지막 수업과 언어 설정을 이어갑니다." },
            { icon: Tags, title: "판매자", body: "태그, SEO, 커리큘럼, 영상, 자막, 더빙 상태를 하나의 편집 화면에서 관리합니다." },
            { icon: ShieldCheck, title: "최고 관리자", body: "결제, 정산, 콘텐츠, 푸시를 전체 플랫폼 단위로 확인하고 제어합니다." },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="border-b py-8 md:border-b-0 md:border-r md:px-6 last:border-r-0">
                <Icon className="mb-4 size-6 text-primary" />
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function CourseTile({ course, image, pathname }: { course: ApiCourse; image: string; pathname: string }) {
  const courseHref = withLocalePath(pathname, `/course/${course.id}`)
  const isCssImage = image.startsWith("from-")
  const discount =
    typeof course.discountPrice === "number" && course.discountPrice < course.price
      ? Math.round((1 - course.discountPrice / course.price) * 100)
      : null

  return (
    <Link href={courseHref} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className={cn("relative aspect-[16/9] overflow-hidden", isCssImage && `bg-gradient-to-br ${image}`)}>
          {isCssImage ? (
            <div className="absolute inset-0 flex items-end p-5 text-white">
              <BookOpen className="size-8 opacity-90" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={course.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          )}
          {discount ? (
            <div className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">
              {discount}% 할인
            </div>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {course.category ? <Badge variant="secondary">{course.category}</Badge> : null}
              {course.level ? <Badge variant="outline">{course.level}</Badge> : null}
            </div>
            <h3 className="min-h-12 text-lg font-black leading-6 line-clamp-2">{course.title}</h3>
            <p className="min-h-12 text-sm leading-6 text-muted-foreground line-clamp-2">
              {course.shortDescription || course.description || "강의 소개가 곧 업데이트됩니다."}
            </p>
          </div>
          <div className="mt-auto space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(course.tags ?? []).slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">{course.instructor?.nickname || course.instructor?.email || "박살강의 판매자"}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3 text-emerald-700" />
                  {course.avgRating?.toFixed(1) ?? "4.8"} · {course.purchaseCount?.toLocaleString() ?? "0"}명
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black">{formatPrice(course)}</div>
                {discount ? <div className="text-xs text-muted-foreground line-through">₩{course.price.toLocaleString()}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
