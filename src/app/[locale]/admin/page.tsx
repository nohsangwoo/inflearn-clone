"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, BadgeCheck, CircleDollarSign, RadioTower, Sparkles, Users, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { withLocalePath } from "@/lib/brand"

type Summary = {
  grossRevenue: number
  estimatedPayout: number
  totalStudents: number
  lectureCount: number
  activeLectureCount: number
  hlsPending: number
  dubReady: number
  lectures: Array<{ id: number; title: string; isActive: boolean; purchaseCount: number; reviewCount: number }>
}

function money(value: number) {
  return `₩${value.toLocaleString()}`
}

export default function AdminDashboardPage() {
  const pathname = usePathname()
  const { data } = useQuery({
    queryKey: ["seller-summary"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/summary")
      return data as Summary
    },
  })

  const summary = data ?? {
    grossRevenue: 0,
    estimatedPayout: 0,
    totalStudents: 0,
    lectureCount: 0,
    activeLectureCount: 0,
    hlsPending: 0,
    dubReady: 0,
    lectures: [],
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">판매자 스튜디오</Badge>
          <h1 className="text-3xl font-black">오늘의 강의 운영</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            강의 판매, 수강생, HLS 처리, 더빙 상태와 정산 예정액을 한 곳에서 확인합니다.
          </p>
        </div>
        <Button asChild>
          <Link href={withLocalePath(pathname, "/admin/courses")}>
            강의 관리
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "누적 결제", value: money(summary.grossRevenue), icon: CircleDollarSign, help: "승인 완료 주문 기준" },
          { title: "정산 예상", value: money(summary.estimatedPayout), icon: BadgeCheck, help: "임시 80% 기준" },
          { title: "수강생", value: `${summary.totalStudents.toLocaleString()}명`, icon: Users, help: `${summary.activeLectureCount}/${summary.lectureCount}개 공개` },
          { title: "HLS 대기", value: `${summary.hlsPending}건`, icon: RadioTower, help: `${summary.dubReady}개 더빙 트랙 ready` },
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
                <div className="mt-1 text-xs text-muted-foreground">{item.help}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>최근 강의 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-md border">
              {summary.lectures.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">아직 등록한 강의가 없습니다.</div>
              ) : (
                summary.lectures.map((lecture) => (
                  <Link
                    key={lecture.id}
                    href={withLocalePath(pathname, `/admin/courses/${lecture.id}`)}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-bold">{lecture.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        수강생 {lecture.purchaseCount}명 · 리뷰 {lecture.reviewCount}개
                      </div>
                    </div>
                    <Badge variant={lecture.isActive ? "secondary" : "outline"}>{lecture.isActive ? "공개" : "비공개"}</Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>업로드 체크리스트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Video, text: "원본 영상 업로드 후 HLS 변환 상태 확인" },
              { icon: Sparkles, text: "ElevenLabs 더빙 언어 선택 및 처리 완료 확인" },
              { icon: BadgeCheck, text: "태그, 메타 타이틀, 설명, OG 이미지 입력" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.text} className="flex gap-3 rounded-md border bg-background p-3 text-sm">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{item.text}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
