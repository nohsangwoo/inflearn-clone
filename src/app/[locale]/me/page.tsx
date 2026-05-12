"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { Bell, BookOpen, Heart, PlayCircle, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toCdnUrl, withLocalePath } from "@/lib/brand"

type Summary = {
  courseCount: number
  averageProgress: number
  likes: number
  unreadNotifications: number
  purchases: Array<{
    id: number
    progress: number
    lecture: {
      id: number
      title: string
      shortDescription?: string | null
      imageUrl?: string | null
      instructor?: { nickname?: string | null; email?: string } | null
    }
  }>
}

export default function MeDashboardPage() {
  const pathname = usePathname()
  const { data } = useQuery({
    queryKey: ["me-summary"],
    queryFn: async () => {
      const { data } = await axios.get("/api/me/summary")
      return data as Summary
    },
  })

  const summary = data ?? { courseCount: 0, averageProgress: 0, likes: 0, unreadNotifications: 0, purchases: [] }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">Learner dashboard</Badge>
        <h1 className="text-3xl font-black">내 학습</h1>
        <p className="mt-2 text-sm text-muted-foreground">구매한 강의를 이어보고, 관심 강의와 알림을 확인합니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "보유 강의", value: `${summary.courseCount}개`, icon: BookOpen },
          { title: "평균 진도", value: `${summary.averageProgress}%`, icon: TrendingUp },
          { title: "좋아요", value: `${summary.likes}개`, icon: Heart },
          { title: "읽지 않은 알림", value: `${summary.unreadNotifications}개`, icon: Bell },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
                <Icon className="size-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black">{item.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>이어보기</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.purchases.length === 0 ? (
            <div className="rounded-md border bg-background p-8 text-center text-sm text-muted-foreground">
              아직 구매한 강의가 없습니다. 탐색 화면에서 강의를 찾아보세요.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {summary.purchases.map((purchase) => {
                const image = toCdnUrl(purchase.lecture.imageUrl)
                return (
                  <div key={purchase.id} className="grid grid-cols-[96px_1fr] gap-4 rounded-lg border bg-background p-3">
                    <div className="aspect-video overflow-hidden rounded-md bg-muted">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={purchase.lecture.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold">{purchase.lecture.title}</div>
                      <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {purchase.lecture.shortDescription || purchase.lecture.instructor?.nickname || purchase.lecture.instructor?.email}
                      </div>
                      <div className="mt-3 h-2 rounded bg-muted">
                        <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, Math.max(0, purchase.progress))}%` }} />
                      </div>
                      <Button asChild size="sm" className="mt-3">
                        <Link href={withLocalePath(pathname, `/course/${purchase.lecture.id}`)}>
                          <PlayCircle className="size-4" />
                          이어보기
                        </Link>
                      </Button>
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
