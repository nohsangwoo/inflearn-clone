"use client"

import { useMemo, useState } from "react"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import RecommendationCarousel from "@/components/recommendation-carousel"
import { CourseCard, type CourseItem } from "@/components/course-card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import CreatorsShowcase from "@/components/creators-showcase"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { getTranslation, useLocale } from "@/lib/translations"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ApiCourse = {
  id: number
  title: string
  description: string | null
  price: number
  discountPrice?: number | null
  imageUrl?: string | null
  createdAt: string
  instructor?: { nickname?: string | null; email?: string }
}

function usePageParam() {
  const sp = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : undefined), [])
  const current = Number(sp.get("page") || "1") || 1
  return current
}

export default function HomePageWrapper() {
  const pathname = usePathname()
  const locale = useLocale(pathname)
  const t = getTranslation(locale).homepage
  const currentPage = usePageParam()
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<"latest" | "best" | "priceAsc" | "priceDesc">("latest")

  const { data: list } = useQuery({
    queryKey: ["courses", currentPage, keyword, category, sort],
    queryFn: async () => {
      const apiCategory = category === t.filters.frontend ? "frontend" :
                         category === t.filters.backend ? "backend" :
                         category === t.filters.ai ? "ai" : undefined
      const { data } = await axios.get(`/api/courses`, {
        params: {
          page: currentPage,
          pageSize: 12,
          sort,
          q: keyword || undefined,
          category: apiCategory,
        },
      })
      return data as { page: number; pageSize: number; total: number; items: ApiCourse[] }
    },
  })

  const items: CourseItem[] = (list?.items ?? []).map((c) => {
    const hasDiscount = typeof c.discountPrice === "number" && c.discountPrice < c.price
    const effectivePrice = hasDiscount ? (c.discountPrice as number) : c.price
    return {
      id: String(c.id),
      title: c.title,
      author: c.instructor?.nickname || c.instructor?.email || "",
      price: effectivePrice === 0 ? t.price.free : `${t.price.currency}${effectivePrice.toLocaleString()}`, // "무료" -> t.price.free
      originalPrice: hasDiscount ? `${t.price.currency}${c.price.toLocaleString()}` : undefined,
      discountPercent: hasDiscount ? Math.round((1 - (c.discountPrice as number) / c.price) * 100) : undefined,
      thumbnail: (c.imageUrl ? `${process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"}/${c.imageUrl}` : "/window.svg"),
      summary: c.description ?? "",
      tags: [],
    }
  })

  const totalPages = Math.max(1, Math.ceil((list?.total ?? 0) / (list?.pageSize ?? 12)))

  const { data: reco } = useQuery({
    queryKey: ["courses-reco"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/courses`, { params: { page: 1, pageSize: 20, sort: "latest" } })
      return data as { items: ApiCourse[] }
    },
  })

  const recoItems = (reco?.items ?? []).map((c) => {
    const hasDiscount = typeof c.discountPrice === "number" && c.discountPrice < c.price
    const effectivePrice = hasDiscount ? (c.discountPrice as number) : c.price
    return {
      id: String(c.id),
      title: c.title,
      thumbnail: (c.imageUrl ? `${process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"}/${c.imageUrl}` : "/window.svg"),
      author: c.instructor?.nickname || c.instructor?.email || "",
      price: effectivePrice === 0 ? t.price.free : `${t.price.currency}${effectivePrice.toLocaleString()}`, // "무료" -> t.price.free
    }
  })

  return (
    <div className="space-y-8">
      <section className="pt-4">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t.search.placeholder} // "강의, 강사, 키워드를 검색하세요"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                key="all"
                variant={!category ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCategory(null)}
              >{t.filters.all}</Button> {/* "전체" */}
              <Button
                key="new"
                variant={sort === "latest" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSort("latest")}
              >{t.filters.new}</Button> {/* "신규" */}
              <Button
                key="best"
                variant={sort === "best" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSort("best")}
              >{t.filters.best}</Button> {/* "베스트" */}
              {([t.filters.frontend, t.filters.backend, t.filters.ai]).map((categoryName) => ( // ["프론트엔드","백엔드","AI"]
                <Button
                  key={categoryName}
                  variant={category === categoryName ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCategory(categoryName)}
                >{categoryName}</Button>
              ))}
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      {sort === "latest" && `${t.sort.sortBy}${t.sort.latest}`} {/* "정렬: 최신순" */}
                      {sort === "best" && `${t.sort.sortBy}${t.sort.best}`} {/* "정렬: 베스트" */}
                      {sort === "priceAsc" && `${t.sort.sortBy}${t.sort.priceDown}`} {/* "정렬: 가격↓" */}
                      {sort === "priceDesc" && `${t.sort.sortBy}${t.sort.priceUp}`} {/* "정렬: 가격↑" */}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t.sort.label}</DropdownMenuLabel> {/* "정렬" */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSort("latest")}>{t.sort.latest}</DropdownMenuItem> {/* "최신순" */}
                    <DropdownMenuItem onClick={() => setSort("best")}>{t.sort.best}</DropdownMenuItem> {/* "베스트" */}
                    <DropdownMenuItem onClick={() => setSort("priceAsc")}>{t.sort.priceAsc}</DropdownMenuItem> {/* "가격 낮은순" */}
                    <DropdownMenuItem onClick={() => setSort("priceDesc")}>{t.sort.priceDesc}</DropdownMenuItem> {/* "가격 높은순" */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </section>

      {currentPage === 1 && (
        <section>
          <div className="mx-auto max-w-6xl px-4">
            <RecommendationCarousel items={recoItems} />
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((c) => (
              <div key={c.id}>
                <CourseCard course={c} />
              </div>
            ))}
          </div>
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              {t.noResults} {/* "검색 결과가 없습니다" */}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4">
          <CreatorsShowcase creators={[]} />
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href={`?page=${Math.max(1, currentPage - 1)}`} />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  const p = idx + 1
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink href={`?page=${p}`} isActive={currentPage === p}>{p}</PaginationLink>
                    </PaginationItem>
                  )
                })}
                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext href={`?page=${Math.min(totalPages, currentPage + 1)}`} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </section>
    </div>
  )
}