"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { Bell, BookOpen, ClipboardList, Heart, PlayCircle, TrendingUp } from "lucide-react"
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

type EnrollmentRequest = {
  id: string
  status: "AWAITING_PLATFORM_FEE" | "APPROVED" | "REJECTED" | "CANCELED"
  amount: number
  createdAt: string
  lecture?: { id: number; title: string } | null
}

const enrollmentStatusLabel: Record<EnrollmentRequest["status"], string> = {
  AWAITING_PLATFORM_FEE: "입금 확인 대기",
  APPROVED: "수강 승인 완료",
  REJECTED: "반려",
  CANCELED: "취소",
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
  const { data: enrollmentData } = useQuery({
    queryKey: ["me-enrollment-requests"],
    queryFn: async () => {
      const { data } = await axios.get("/api/me/enrollment-requests")
      return data as { requests: EnrollmentRequest[] }
    },
  })

  const summary = data ?? { courseCount: 0, averageProgress: 0, likes: 0, unreadNotifications: 0, purchases: [] }
  const enrollmentRequests = enrollmentData?.requests ?? []

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-7">
        <p className="editorial-label text-primary">Learner dashboard</p>
        <h1 className="font-brand mt-3 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-none tracking-[-0.045em]">내 학습</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">구매한 강의를 이어보고, 관심 강의와 알림을 확인합니다.</p>
      </div>

      <div className="grid overflow-hidden rounded-[18px] border border-border/80 bg-card shadow-2xs sm:grid-cols-2 xl:grid-cols-5 xl:divide-x xl:divide-border">
        {[
          { title: "보유 강의", value: `${summary.courseCount}개`, icon: BookOpen },
          { title: "수강 신청", value: `${enrollmentRequests.length}건`, icon: ClipboardList },
          { title: "평균 진도", value: `${summary.averageProgress}%`, icon: TrendingUp },
          { title: "좋아요", value: `${summary.likes}개`, icon: Heart },
          { title: "읽지 않은 알림", value: `${summary.unreadNotifications}개`, icon: Bell },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="border-b border-border p-5 last:border-b-0 xl:border-b-0">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[12px] font-semibold text-muted-foreground">{item.title}</div>
                <Icon className="size-[18px] text-primary" />
              </div>
              <div className="font-brand mt-5 text-[25px] font-extrabold leading-none tracking-[-0.035em]">{item.value}</div>
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>이어보기</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.purchases.length === 0 ? (
            <div className="rounded-[14px] border bg-background p-8 text-center text-sm text-muted-foreground">
              아직 구매한 강의가 없습니다. 탐색 화면에서 강의를 찾아보세요.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {summary.purchases.map((purchase) => {
                const image = toCdnUrl(purchase.lecture.imageUrl)
                return (
                  <div key={purchase.id} className="grid grid-cols-[96px_1fr] gap-4 rounded-[14px] border bg-background p-3">
                    <div className="aspect-video overflow-hidden rounded-[14px] bg-muted">
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

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>최근 수강 신청</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href={withLocalePath(pathname, "/me/enrollments")}>전체 보기</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {enrollmentRequests.length === 0 ? (
            <div className="rounded-[14px] border bg-background p-8 text-center text-sm text-muted-foreground">
              수강 신청 내역이 없습니다.
            </div>
          ) : (
            <div className="divide-y rounded-[14px] border">
              {enrollmentRequests.slice(0, 4).map((request) => (
                <div key={request.id} className="grid gap-2 p-4 md:grid-cols-[1fr_140px_120px] md:items-center">
                  <div className="min-w-0">
                    <div className="truncate font-bold">{request.lecture?.title ?? "삭제된 강의"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleString("ko-KR")}</div>
                  </div>
                  <Badge variant={request.status === "APPROVED" ? "secondary" : "outline"}>
                    {enrollmentStatusLabel[request.status]}
                  </Badge>
                  {request.status === "APPROVED" && request.lecture ? (
                    <Button asChild size="sm">
                      <Link href={withLocalePath(pathname, `/course/${request.lecture.id}`)}>수강하기</Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>대기중</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
