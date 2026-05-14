"use client"

import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toCdnUrl, withLocalePath } from "@/lib/brand"

type LectureRow = {
  id: number
  title: string
  slug?: string | null
  shortDescription?: string | null
  category?: string | null
  level?: string | null
  tags?: string[]
  price: number
  discountPrice?: number | null
  isActive: boolean
  imageUrl?: string | null
  purchaseCount: number
  reviewCount: number
}

export default function AdminCoursesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ["admin-lectures"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/courses")
      return data as LectureRow[]
    },
  })
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await axios.patch(`/api/admin/courses/${id}`, { isActive })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-lectures"] }),
  })

  async function createCourse() {
    const { data: created } = await axios.post("/api/admin/courses", {
      title: "새 강의",
      price: 0,
      category: "웹 개발",
      level: "입문",
    })
    router.push(withLocalePath(pathname, `/admin/courses/${created.id}`))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">Course studio</Badge>
          <h1 className="text-[28px] font-bold leading-[1.43]">강의 관리</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            판매할 강의의 공개 상태, 가격, SEO 완성도와 수강 반응을 확인하세요.
          </p>
        </div>
        <Button onClick={createCourse}>
          <Plus className="size-4" />
          새 강의 만들기
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>등록한 강의</CardTitle>
          <div className="flex h-10 items-center gap-2 rounded-full border bg-background px-3">
            <Search className="size-4 text-muted-foreground" />
            <Input placeholder="목록 내 검색" className="h-8 w-52 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" />
          </div>
        </CardHeader>
        <CardContent>
          {(data ?? []).length === 0 ? (
            <div className="rounded-[14px] border bg-background p-8 text-center text-sm text-muted-foreground">
              아직 강의가 없습니다. 새 강의 만들기로 첫 강의를 등록하세요.
            </div>
          ) : (
            <div className="divide-y rounded-[14px] border">
              {(data ?? []).map((lecture) => {
                const image = toCdnUrl(lecture.imageUrl)
                const effective =
                  typeof lecture.discountPrice === "number" && lecture.discountPrice < lecture.price
                    ? lecture.discountPrice
                    : lecture.price
                return (
                  <div key={lecture.id} className="grid gap-4 p-4 md:grid-cols-[72px_1fr_180px_110px] md:items-center">
                    <button
                      onClick={() => router.push(withLocalePath(pathname, `/admin/courses/${lecture.id}`))}
                      className="aspect-square w-full overflow-hidden rounded-[14px] border bg-muted md:size-[72px]"
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={lecture.title} className="h-full w-full object-cover" />
                      ) : null}
                    </button>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {lecture.category ? <Badge variant="secondary">{lecture.category}</Badge> : null}
                        {lecture.level ? <Badge variant="outline">{lecture.level}</Badge> : null}
                        {(lecture.tags ?? []).slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="bg-background">#{tag}</Badge>
                        ))}
                      </div>
                      <button
                        onClick={() => router.push(withLocalePath(pathname, `/admin/courses/${lecture.id}`))}
                        className="block truncate text-left text-lg font-semibold hover:text-primary"
                      >
                        {lecture.title}
                      </button>
                      <div className="line-clamp-1 text-sm text-muted-foreground">
                        {lecture.shortDescription || lecture.slug || "SEO 요약이 아직 없습니다."}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="font-bold text-foreground">₩{effective.toLocaleString()}</div>
                      <div>수강생 {lecture.purchaseCount}명 · 리뷰 {lecture.reviewCount}개</div>
                    </div>
                    <div className="flex items-center gap-2 md:justify-end">
                      <span className="text-xs text-muted-foreground">비공개</span>
                      <Switch
                        checked={lecture.isActive}
                        onCheckedChange={(value: boolean) => toggleActive.mutate({ id: lecture.id, isActive: Boolean(value) })}
                      />
                      <span className="text-xs text-muted-foreground">공개</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
