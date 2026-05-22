"use client"

import axios from "axios"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Banknote, BookOpen, CircleDollarSign, RadioTower, ReceiptText, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

type EnrollmentStatus = EnrollmentRequest["status"]
type EnrollmentAction = Extract<EnrollmentStatus, "AWAITING_PLATFORM_FEE" | "APPROVED" | "CANCELED">

function money(value: number) {
  return `₩${value.toLocaleString()}`
}

function requestStatusMeta(status: EnrollmentStatus) {
  if (status === "APPROVED") return { label: "입금 확인 완료", variant: "secondary" as const }
  if (status === "REJECTED") return { label: "반려", variant: "destructive" as const }
  if (status === "CANCELED") return { label: "취소", variant: "outline" as const }
  return { label: "입금 확인 대기", variant: "outline" as const }
}

export default function MasterDashboardPage() {
  const qc = useQueryClient()
  const pathname = usePathname()
  const localeBase = `/${pathname.split("/").filter(Boolean)[0] || "ko"}`
  const [confirmAction, setConfirmAction] = useState<{
    request: EnrollmentRequest
    status: EnrollmentAction
    title: string
    description: string
    confirmLabel: string
  } | null>(null)
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
      const { data } = await axios.get("/api/master/enrollment-requests?limit=200")
      return data as { requests: EnrollmentRequest[] }
    },
  })
  const updateEnrollment = useMutation({
    mutationFn: async (payload: { id: string; status: EnrollmentAction }) => {
      await axios.patch("/api/master/enrollment-requests", payload)
    },
    onSuccess: () => {
      setConfirmAction(null)
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
  const enrollmentRequests = enrollmentData?.requests ?? []

  const openConfirmDialog = (request: EnrollmentRequest, status: EnrollmentAction) => {
    const student = request.user.nickname || request.user.email
    if (status === "APPROVED") {
      setConfirmAction({
        request,
        status,
        title: "입금을 확인할까요?",
        description: `${student}님의 "${request.lecture.title}" 신청을 입금 확인 처리하고 즉시 수강권한을 부여합니다.`,
        confirmLabel: "입금 확인",
      })
      return
    }
    if (status === "AWAITING_PLATFORM_FEE") {
      setConfirmAction({
        request,
        status,
        title: "입금확인을 취소할까요?",
        description: `${student}님의 수강권한을 회수하고 신청 상태를 다시 입금 확인 대기로 돌립니다.`,
        confirmLabel: "입금확인 취소",
      })
      return
    }
    setConfirmAction({
      request,
      status,
      title: "수강 신청을 취소할까요?",
      description: `${student}님의 신청을 취소 처리하고 이미 열린 수강권한이 있다면 회수합니다.`,
      confirmLabel: "신청 취소",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">최고 관리자</Badge>
        <h1 className="text-[28px] font-bold leading-[1.43]">링구스트 컨트롤 타워</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          시딩/목업 계정을 제외한 실제 운영 유저, 입금 승인, 정산, HLS 처리 상태를 통제합니다.
        </p>
        {isError ? <p className="mt-2 text-sm text-destructive">관리자 권한 또는 DB 마이그레이션을 확인하세요.</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "실제 유저", value: `${overview.users.toLocaleString()}명`, icon: Users },
          { title: "전체 강의", value: `${overview.lectures.toLocaleString()}개`, icon: BookOpen },
          { title: "승인 입금", value: money(overview.grossRevenue), icon: CircleDollarSign },
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
            <CardTitle>수강 신청 관리</CardTitle>
            <p className="text-sm text-muted-foreground">
              최근 신청 200건을 기준으로 입금확인, 입금확인 취소, 신청 취소를 언제든 처리합니다.
            </p>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-[14px] border">
              {enrollmentRequests.length === 0 ? (
                <div className="p-5 text-sm text-muted-foreground">확인할 수강 신청이 없습니다.</div>
              ) : (
                enrollmentRequests.map((request) => {
                  const status = requestStatusMeta(request.status)
                  return (
                    <div key={request.id} className="grid gap-3 p-4 md:grid-cols-[1fr_130px_220px] md:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate font-bold">{request.lecture.title}</div>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          신청자 {request.user.nickname || request.user.email} · 판매자 {request.seller?.nickname || request.seller?.email || "미지정"}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">신청금액 {money(request.amount)} · 강의 ID {request.lecture.id}</div>
                      </div>
                      <div className="font-semibold">{money(request.amount)}</div>
                      <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                        {request.status === "APPROVED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateEnrollment.isPending}
                            onClick={() => openConfirmDialog(request, "AWAITING_PLATFORM_FEE")}
                          >
                            입금확인 취소
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={updateEnrollment.isPending}
                            onClick={() => openConfirmDialog(request, "APPROVED")}
                          >
                            입금 확인
                          </Button>
                        )}
                        {request.status !== "CANCELED" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateEnrollment.isPending}
                            onClick={() => openConfirmDialog(request, "CANCELED")}
                          >
                            신청 취소
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={confirmAction !== null} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmAction?.title}</DialogTitle>
              <DialogDescription>{confirmAction?.description}</DialogDescription>
            </DialogHeader>
            {confirmAction ? (
              <div className="rounded-[14px] border bg-muted/30 p-4 text-sm">
                <div className="font-semibold">{confirmAction.request.lecture.title}</div>
                <div className="mt-1 text-muted-foreground">
                  {confirmAction.request.user.nickname || confirmAction.request.user.email} · {money(confirmAction.request.amount)}
                </div>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={updateEnrollment.isPending}>
                취소
              </Button>
              <Button
                onClick={() => {
                  if (!confirmAction) return
                  updateEnrollment.mutate({ id: confirmAction.request.id, status: confirmAction.status })
                }}
                disabled={updateEnrollment.isPending}
              >
                {confirmAction?.confirmLabel ?? "확인"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                <div className="text-xs text-muted-foreground">승인된 수강신청 기준 판매자별 정산 현황을 확인하세요.</div>
              </div>
            </div>
            <div className="flex gap-3 rounded-[14px] border bg-background p-3">
              <Banknote className="mt-0.5 size-4 text-primary" />
              <div>
                <div className="text-sm font-bold">수강 승인 대기 {overview.pendingEnrollmentCount}건</div>
                <div className="text-xs text-muted-foreground">판매자 또는 운영자가 입금 확인 후 수강권한을 열어주세요.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>강의 관리</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            시드 강의와 실제 입점 강의를 분리해서 확인합니다. 시딩 데이터 표시는 최고관리자 강의 관리 화면에서만 보이고,
            공개 화면에서는 정상 강의처럼 노출됩니다.
          </p>
          <Button asChild className="shrink-0">
            <Link href={`${localeBase}/master/courses`}>강의 관리 열기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
