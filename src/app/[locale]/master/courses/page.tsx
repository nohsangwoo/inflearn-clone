"use client"

import axios from "axios"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, Eye, Lock, Search, Settings2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getCoursePreviewImage } from "@/lib/course-images"
import type { HomepageSection } from "@/lib/homepage-sections"

type MasterCourse = {
  id: number
  title: string
  slug?: string | null
  shortDescription?: string | null
  category?: string | null
  level?: string | null
  price: number
  discountPrice?: number | null
  isActive: boolean
  isSeedData: boolean
  enrollmentOpen: boolean
  enrollmentStartAt?: string | null
  enrollmentEndAt?: string | null
  enrollmentCapacity?: number | null
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
  purchaseCount: number
  reviewCount: number
  likeCount: number
  enrollmentRequestCount: number
  instructor?: { email?: string | null; nickname?: string | null }
}

type CoursesResponse = {
  page: number
  pageSize: number
  total: number
  items: MasterCourse[]
}

const EMPTY_SECTIONS: HomepageSection[] = []

function money(value: number) {
  return `₩${value.toLocaleString()}`
}

function formatDate(value?: string | null) {
  if (!value) return "미정"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "미정"
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date)
}

function normalizePositions(sections: HomepageSection[]) {
  return sections.map((section, index) => ({ ...section, position: (index + 1) * 10 }))
}

function getSectionsKey(sections: HomepageSection[]) {
  return sections
    .map((section) => `${section.sectionKey}:${section.position}:${section.isEnabled}:${section.title}:${section.eyebrow}:${section.description}`)
    .join("|")
}

export default function MasterCoursesPage() {
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const localeBase = `/${pathname.split("/").filter(Boolean)[0] || "ko"}`
  const [kind, setKind] = useState<"all" | "real" | "seed">("all")
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [sectionDraftState, setSectionDraftState] = useState<{ baseKey: string; sections: HomepageSection[] } | null>(null)

  const coursesQuery = useQuery({
    queryKey: ["master-courses", kind, q, page],
    queryFn: async () => {
      const { data } = await axios.get("/api/master/courses", { params: { kind, q, page, pageSize: 30 } })
      return data as CoursesResponse
    },
  })

  const sectionsQuery = useQuery({
    queryKey: ["master-site-sections"],
    queryFn: async () => {
      const { data } = await axios.get("/api/master/site-sections")
      return data as { sections: HomepageSection[] }
    },
  })

  const loadedSections = sectionsQuery.data?.sections ?? EMPTY_SECTIONS
  const loadedSectionsKey = useMemo(() => getSectionsKey(loadedSections), [loadedSections])
  const sectionDraft = sectionDraftState?.sections ?? loadedSections
  const setDraftSections = (next: HomepageSection[] | ((current: HomepageSection[]) => HomepageSection[])) => {
    const sections = typeof next === "function" ? next(sectionDraft) : next
    setSectionDraftState({ baseKey: loadedSectionsKey, sections })
  }

  const updateCourse = useMutation({
    mutationFn: async (payload: { id: number; isActive?: boolean; enrollmentOpen?: boolean }) => {
      const { data } = await axios.patch("/api/master/courses", payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-courses"] })
      queryClient.invalidateQueries({ queryKey: ["courses"] })
      queryClient.invalidateQueries({ queryKey: ["master-overview"] })
    },
  })

  const saveSections = useMutation({
    mutationFn: async () => {
      const { data } = await axios.patch("/api/master/site-sections", { sections: normalizePositions(sectionDraft) })
      return data
    },
    onSuccess: (data: { sections: HomepageSection[] }) => {
      setSectionDraftState({ baseKey: getSectionsKey(data.sections), sections: data.sections })
      queryClient.invalidateQueries({ queryKey: ["master-site-sections"] })
      queryClient.invalidateQueries({ queryKey: ["homepage-sections"] })
    },
  })

  const courses = useMemo(() => coursesQuery.data?.items ?? [], [coursesQuery.data?.items])
  const total = coursesQuery.data?.total ?? 0
  const pageSize = coursesQuery.data?.pageSize ?? 30
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const summary = useMemo(() => {
    const seed = courses.filter((course) => course.isSeedData).length
    const publicCount = courses.filter((course) => course.isActive).length
    return { seed, publicCount }
  }, [courses])

  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...sectionDraft]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const current = next[index]
    next[index] = next[target]
    next[target] = current
    setDraftSections(normalizePositions(next))
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">최고 관리자</Badge>
        <h1 className="text-[28px] font-bold leading-[1.43]">강의 관리</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          실제 입점 강의와 시드 강의를 DB 기준으로 분리합니다. 공개 화면에서는 시드 표시 없이 정상 강의처럼 노출되고,
          시드 여부는 이 최고관리자 화면에서만 확인됩니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="size-5 text-primary" />
            강의 데이터 바인딩 상태
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[14px] border bg-background p-4">
            <div className="text-sm text-muted-foreground">현재 목록</div>
            <div className="mt-2 text-[22px] font-semibold">{total.toLocaleString()}개</div>
          </div>
          <div className="rounded-[14px] border bg-background p-4">
            <div className="text-sm text-muted-foreground">이 페이지 시드</div>
            <div className="mt-2 text-[22px] font-semibold">{summary.seed.toLocaleString()}개</div>
          </div>
          <div className="rounded-[14px] border bg-background p-4">
            <div className="text-sm text-muted-foreground">이 페이지 공개</div>
            <div className="mt-2 text-[22px] font-semibold">{summary.publicCount.toLocaleString()}개</div>
          </div>
          <div className="rounded-[14px] border bg-background p-4">
            <div className="text-sm text-muted-foreground">홈 섹션</div>
            <div className="mt-2 text-[22px] font-semibold">{sectionDraft.length.toLocaleString()}개</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>등록 강의</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex w-fit rounded-full border bg-background p-1">
              {[
                ["all", "전체"],
                ["real", "실제 강의"],
                ["seed", "시드 전용"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setKind(value as "all" | "real" | "seed")
                    setPage(1)
                  }}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    kind === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              className="relative w-full max-w-sm"
              onSubmit={(event) => {
                event.preventDefault()
                setPage(1)
                queryClient.invalidateQueries({ queryKey: ["master-courses"] })
              }}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="강의명, 카테고리, 강사 검색"
                className="h-11 rounded-full pl-10"
              />
            </form>
          </div>

          <div className="divide-y rounded-[14px] border">
            {coursesQuery.isLoading ? (
              <div className="p-5 text-sm text-muted-foreground">강의를 불러오는 중입니다.</div>
            ) : courses.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">조건에 맞는 강의가 없습니다.</div>
            ) : (
              courses.map((course) => {
                const effectivePrice = course.discountPrice ?? course.price
                return (
                  <article key={course.id} className="grid gap-4 p-4 lg:grid-cols-[160px_1fr_220px] lg:items-center">
                    <div className="relative aspect-[1200/781] overflow-hidden rounded-[14px] bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getCoursePreviewImage(course.imageUrl)} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={course.isSeedData ? "outline" : course.isActive ? "secondary" : "outline"}>
                          {course.isSeedData ? "시드 전용" : course.isActive ? "공개" : "비공개"}
                        </Badge>
                        {course.isSeedData ? (
                          <Badge variant="secondary" className="gap-1">
                            <Lock className="size-3" />
                            관리자 식별
                          </Badge>
                        ) : null}
                        {course.category ? <Badge variant="outline">{course.category}</Badge> : null}
                        {course.level ? <Badge variant="outline">{course.level}</Badge> : null}
                      </div>
                      <h2 className="mt-3 line-clamp-2 text-[16px] font-semibold leading-[1.25]">{course.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {course.shortDescription || "강의 소개가 아직 입력되지 않았습니다."}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>ID {course.id}</span>
                        <span>{course.instructor?.nickname || course.instructor?.email || "강사 미지정"}</span>
                        <span>생성 {formatDate(course.createdAt)}</span>
                        <span>신청 {course.enrollmentRequestCount.toLocaleString()}건</span>
                        <span>수강 {course.purchaseCount.toLocaleString()}명</span>
                        <span>좋아요 {course.likeCount.toLocaleString()}개</span>
                      </div>
                    </div>
                    <div className="space-y-3 rounded-[14px] border bg-background p-4">
                      <div>
                        <div className="text-xs text-muted-foreground">판매가</div>
                        <div className="mt-1 text-[18px] font-semibold">{money(effectivePrice)}</div>
                        {course.discountPrice ? (
                          <div className="text-xs text-muted-foreground line-through">{money(course.price)}</div>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span>공개</span>
                        <Switch
                          checked={course.isActive}
                          disabled={updateCourse.isPending}
                          onCheckedChange={(checked) => updateCourse.mutate({ id: course.id, isActive: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span>모집</span>
                        <Switch
                          checked={course.enrollmentOpen}
                          disabled={updateCourse.isPending}
                          onCheckedChange={(checked) => updateCourse.mutate({ id: course.id, enrollmentOpen: checked })}
                        />
                      </div>
                      {course.isActive ? (
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`${localeBase}/course/${course.id}`}>
                            <Eye className="size-4" />
                            공개 상세 보기
                          </Link>
                        </Button>
                      ) : (
                        <div className="rounded-[14px] bg-secondary px-3 py-2 text-xs leading-5 text-muted-foreground">
                          비공개 강의입니다.
                        </div>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              {total.toLocaleString()}개 중 {courses.length.toLocaleString()}개 표시
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page <= 1 || coursesQuery.isLoading} onClick={() => setPage((value) => value - 1)}>
                이전
              </Button>
              <Button variant="outline" disabled={page >= totalPages || coursesQuery.isLoading} onClick={() => setPage((value) => value + 1)}>
                다음
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>홈 화면 섹션 순서</CardTitle>
          <p className="text-sm text-muted-foreground">
            공개 홈의 강의 목록 아래에 붙는 후킹 섹션을 DB에서 제어합니다. 비활성화하면 public 홈 화면에서 숨겨집니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionDraft.map((section, index) => (
            <div key={section.sectionKey} className="rounded-[14px] border bg-background p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{section.sectionKey}</Badge>
                  <Badge variant={section.isEnabled ? "secondary" : "outline"}>
                    {section.isEnabled ? "노출" : "숨김"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" disabled={index === 0} onClick={() => moveSection(index, -1)}>
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={index === sectionDraft.length - 1}
                    onClick={() => moveSection(index, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Switch
                    checked={section.isEnabled}
                    onCheckedChange={(checked) =>
                      setDraftSections((current) =>
                        current.map((item) => item.sectionKey === section.sectionKey ? { ...item, isEnabled: checked } : item),
                      )
                    }
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                <Input
                  value={section.eyebrow}
                  onChange={(event) =>
                    setDraftSections((current) =>
                      current.map((item) => item.sectionKey === section.sectionKey ? { ...item, eyebrow: event.target.value } : item),
                    )
                  }
                  placeholder="Eyebrow"
                />
                <Input
                  value={section.title}
                  onChange={(event) =>
                    setDraftSections((current) =>
                      current.map((item) => item.sectionKey === section.sectionKey ? { ...item, title: event.target.value } : item),
                    )
                  }
                  placeholder="제목"
                />
                <div className="hidden md:block" />
                <Textarea
                  value={section.description}
                  onChange={(event) =>
                    setDraftSections((current) =>
                      current.map((item) =>
                        item.sectionKey === section.sectionKey ? { ...item, description: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="설명"
                  className="min-h-24"
                />
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <Button disabled={saveSections.isPending || !sectionDraft.length} onClick={() => saveSections.mutate()}>
              섹션 순서와 문구 저장
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
