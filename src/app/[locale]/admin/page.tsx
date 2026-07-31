"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, BadgeCheck, CircleDollarSign, RadioTower, Sparkles, Users, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { withLocalePath } from "@/lib/brand"

type Summary = {
  grossRevenue: number
  estimatedPayout: number
  totalStudents: number
  lectureCount: number
  activeLectureCount: number
  hlsPending: number
  dubReady: number
  pendingEnrollmentCount: number
  pendingPlatformFeeAmount: number
  lectures: Array<{ id: number; title: string; isActive: boolean; purchaseCount: number; reviewCount: number }>
}

type BankAccount = {
  settlementBankName?: string | null
  settlementAccountNumber?: string | null
  settlementAccountHolder?: string | null
}

type SellerEnrollmentResponse = {
  requests: Array<{
    id: string
    amount: number
    platformFeeRateBps: number
    platformFeeAmount: number
    sellerBankName?: string | null
    sellerAccountNumber?: string | null
    sellerAccountHolder?: string | null
    createdAt: string
    user: { email: string; nickname?: string | null }
    lecture: { id: number; title: string }
  }>
}

function money(value: number) {
  return `₩${value.toLocaleString()}`
}

export default function AdminDashboardPage() {
  const pathname = usePathname()
  const qc = useQueryClient()
  const [bankForm, setBankForm] = useState<BankAccount>({})
  const { data } = useQuery({
    queryKey: ["seller-summary"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/summary")
      return data as Summary
    },
  })
  const { data: bankAccount } = useQuery({
    queryKey: ["seller-bank-account"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/bank-account")
      return data as BankAccount
    },
  })
  const { data: pendingEnrollments } = useQuery({
    queryKey: ["seller-enrollment-requests"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/enrollment-requests")
      return data as SellerEnrollmentResponse
    },
  })
  const saveBank = useMutation({
    mutationFn: async () => {
      const { data } = await axios.patch("/api/admin/bank-account", bankForm)
      return data as BankAccount
    },
    onSuccess: (saved) => {
      setBankForm(saved)
      qc.invalidateQueries({ queryKey: ["seller-bank-account"] })
    },
  })
  const updateEnrollment = useMutation({
    mutationFn: async (payload: { id: string; status: "APPROVED" | "REJECTED" }) => {
      await axios.patch("/api/admin/enrollment-requests", payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-enrollment-requests"] })
      qc.invalidateQueries({ queryKey: ["seller-summary"] })
    },
  })

  useEffect(() => {
    if (bankAccount) setBankForm(bankAccount)
  }, [bankAccount])

  const summary = data ?? {
    grossRevenue: 0,
    estimatedPayout: 0,
    totalStudents: 0,
    lectureCount: 0,
    activeLectureCount: 0,
    hlsPending: 0,
    dubReady: 0,
    pendingEnrollmentCount: 0,
    pendingPlatformFeeAmount: 0,
    lectures: [],
  }
  const enrollmentRequests = pendingEnrollments?.requests ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 border-b border-border pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="editorial-label text-primary">Creator studio</p>
          <h1 className="font-brand mt-3 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-none tracking-[-0.045em]">오늘의 강의 운영</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
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

      <div className="grid overflow-hidden rounded-[18px] border border-border/80 bg-card shadow-2xs sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-border">
        {[
          { title: "누적 입금 승인", value: money(summary.grossRevenue), icon: CircleDollarSign, help: "승인 완료 수강 신청 기준" },
          { title: "정산 예상", value: money(summary.estimatedPayout), icon: BadgeCheck, help: "운영 정산 정책 기준" },
          { title: "수강생", value: `${summary.totalStudents.toLocaleString()}명`, icon: Users, help: `${summary.activeLectureCount}/${summary.lectureCount}개 공개` },
          { title: "입금 확인 대기", value: `${summary.pendingEnrollmentCount}건`, icon: RadioTower, help: `확인할 입금 ${money(summary.pendingPlatformFeeAmount)}` },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="border-b border-border p-5 last:border-b-0 xl:border-b-0 xl:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[12px] font-semibold text-muted-foreground">{item.title}</div>
                <Icon className="size-[18px] text-primary" />
              </div>
              <div className="font-brand mt-5 text-[25px] font-extrabold leading-none tracking-[-0.035em]">{item.value}</div>
              <div className="mt-2 text-[11px] text-muted-foreground">{item.help}</div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>판매자 입금 계좌</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                placeholder="은행명"
                value={bankForm.settlementBankName ?? ""}
                onChange={(event) => setBankForm((prev) => ({ ...prev, settlementBankName: event.target.value }))}
              />
              <Input
                placeholder="계좌번호"
                value={bankForm.settlementAccountNumber ?? ""}
                onChange={(event) => setBankForm((prev) => ({ ...prev, settlementAccountNumber: event.target.value }))}
              />
              <Input
                placeholder="예금주"
                value={bankForm.settlementAccountHolder ?? ""}
                onChange={(event) => setBankForm((prev) => ({ ...prev, settlementAccountHolder: event.target.value }))}
              />
            </div>
            <Button size="sm" onClick={() => saveBank.mutate()} disabled={saveBank.isPending}>
              계좌 저장
            </Button>
            <p className="text-xs text-muted-foreground">
              수강생이 입금할 판매자 계좌입니다. 수강 신청 시점의 계좌 정보가 신청 기록에 저장됩니다.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>수강 승인 대기</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollmentRequests.length === 0 ? (
              <div className="rounded-[14px] border bg-background p-4 text-sm text-muted-foreground">입금 확인 대기 중인 수강 신청이 없습니다.</div>
            ) : (
              <div className="divide-y rounded-[14px] border">
                {enrollmentRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="grid gap-2 p-3 text-sm md:grid-cols-[1fr_150px] md:items-center">
                    <div className="min-w-0">
                      <div className="truncate font-bold">{request.lecture.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">신청자 {request.user.nickname || request.user.email}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        입금 계좌 {request.sellerBankName || "계좌 미등록"} {request.sellerAccountNumber || ""}
                        {request.sellerAccountHolder ? ` (${request.sellerAccountHolder})` : ""}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold">{money(request.amount)}</div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => updateEnrollment.mutate({ id: request.id, status: "APPROVED" })}>
                          입금 확인
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateEnrollment.mutate({ id: request.id, status: "REJECTED" })}>
                          반려
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>최근 강의 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-[14px] border">
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
                <div key={item.text} className="flex gap-3 rounded-[14px] border bg-background p-3 text-sm">
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
