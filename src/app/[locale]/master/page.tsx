"use client"

import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Banknote, BookOpen, CircleDollarSign, RadioTower, ReceiptText, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Overview = {
  users: number
  lectures: number
  successfulOrderCount: number
  grossRevenue: number
  pendingPayoutCount: number
  pendingPayoutAmount: number
  hlsPending: number
  pendingEnrollmentCount: number
  pendingEnrollmentPlatformFeeAmount: number
  recentOrders: Array<{
    orderId: string
    orderName: string
    amount: number
    status: string
    createdAt: string
    user: { email: string; nickname?: string | null }
    lecture: { title: string; instructor?: { email: string; nickname?: string | null } | null }
  }>
}

type EnrollmentRequest = {
  id: string
  status: "AWAITING_PLATFORM_FEE" | "APPROVED" | "REJECTED" | "CANCELED"
  amount: number
  platformFeeRateBps: number
  platformFeeAmount: number
  createdAt: string
  user: { email: string; nickname?: string | null }
  seller?: { email: string; nickname?: string | null } | null
  lecture: { id: number; title: string }
}

function money(value: number) {
  return `₩${value.toLocaleString()}`
}

export default function MasterDashboardPage() {
  const qc = useQueryClient()
  const { data, isError } = useQuery({
    queryKey: ["master-overview"],
    queryFn: async () => {
      const { data } = await axios.get("/api/master/overview")
      return data as Overview
    },
  })
  const { data: enrollmentData } = useQuery({
    queryKey: ["master-enrollment-requests"],
    queryFn: async () => {
      const { data } = await axios.get("/api/master/enrollment-requests")
      return data as { requests: EnrollmentRequest[] }
    },
  })
  const updateEnrollment = useMutation({
    mutationFn: async (payload: { id: string; status: "APPROVED" | "REJECTED" }) => {
      await axios.patch("/api/master/enrollment-requests", payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master-enrollment-requests"] })
      qc.invalidateQueries({ queryKey: ["master-overview"] })
    },
  })

  const overview = data ?? {
    users: 0,
    lectures: 0,
    successfulOrderCount: 0,
    grossRevenue: 0,
    pendingPayoutCount: 0,
    pendingPayoutAmount: 0,
    hlsPending: 0,
    pendingEnrollmentCount: 0,
    pendingEnrollmentPlatformFeeAmount: 0,
    recentOrders: [],
  }
  const pendingEnrollmentRequests = (enrollmentData?.requests ?? []).filter((request) => request.status === "AWAITING_PLATFORM_FEE")

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">최고 관리자</Badge>
        <h1 className="text-[28px] font-bold leading-[1.43]">박살강의 컨트롤 타워</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          전체 유저, 강의, 결제, 정산, HLS 처리 상태를 운영자 관점에서 통제합니다.
        </p>
        {isError ? <p className="mt-2 text-sm text-destructive">관리자 권한 또는 DB 마이그레이션을 확인하세요.</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "전체 유저", value: `${overview.users.toLocaleString()}명`, icon: Users },
          { title: "전체 강의", value: `${overview.lectures.toLocaleString()}개`, icon: BookOpen },
          { title: "승인 결제", value: money(overview.grossRevenue), icon: CircleDollarSign },
          { title: "입금 확인 대기", value: money(overview.pendingEnrollmentPlatformFeeAmount), icon: Banknote },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
                <Icon className="size-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-[22px] font-semibold leading-[1.18]">{item.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>수강 승인 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-[14px] border">
              {pendingEnrollmentRequests.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">확인할 수강 신청이 없습니다.</div>
              ) : (
                pendingEnrollmentRequests.map((request) => (
                  <div key={request.id} className="grid gap-3 p-4 md:grid-cols-[1fr_130px_180px] md:items-center">
                    <div className="min-w-0">
                      <div className="truncate font-bold">{request.lecture.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        신청자 {request.user.nickname || request.user.email} · 판매자 {request.seller?.nickname || request.seller?.email || "미지정"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        강의금액 {money(request.amount)} · 수수료율 {(request.platformFeeRateBps / 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="font-semibold">{money(request.platformFeeAmount)}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => updateEnrollment.mutate({ id: request.id, status: "APPROVED" })}>
                        입금 확인
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateEnrollment.mutate({ id: request.id, status: "REJECTED" })}>
                        반려
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>운영 알림</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 rounded-[14px] border bg-background p-3">
              <RadioTower className="mt-0.5 size-4 text-primary" />
              <div>
                <div className="text-sm font-bold">HLS 처리 대기 {overview.hlsPending}건</div>
                <div className="text-xs text-muted-foreground">실패/대기 영상은 판매자 스튜디오에서 확인합니다.</div>
              </div>
            </div>
            <div className="flex gap-3 rounded-[14px] border bg-background p-3">
              <ReceiptText className="mt-0.5 size-4 text-primary" />
              <div>
                <div className="text-sm font-bold">정산 대기 {overview.pendingPayoutCount}건</div>
                <div className="text-xs text-muted-foreground">수동 지급 후 PAID 상태로 변경하세요.</div>
              </div>
            </div>
            <div className="flex gap-3 rounded-[14px] border bg-background p-3">
              <Banknote className="mt-0.5 size-4 text-primary" />
              <div>
                <div className="text-sm font-bold">수강 승인 대기 {overview.pendingEnrollmentCount}건</div>
                <div className="text-xs text-muted-foreground">판매자의 플랫폼 수수료 입금 확인 후 수강권한을 열어주세요.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
