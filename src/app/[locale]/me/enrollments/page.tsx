"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { Banknote, CheckCircle2, Clock3, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toCdnUrl, withLocalePath } from "@/lib/brand"

type EnrollmentStatus = "AWAITING_PLATFORM_FEE" | "APPROVED" | "REJECTED" | "CANCELED"

type EnrollmentRequest = {
  id: string
  status: EnrollmentStatus
  amount: number
  platformFeeAmount: number
  sellerReceivableAmount: number
  sellerBankName?: string | null
  sellerAccountNumber?: string | null
  sellerAccountHolder?: string | null
  createdAt: string
  approvedAt?: string | null
  lecture?: {
    id: number
    title: string
    shortDescription?: string | null
    imageUrl?: string | null
    instructor?: {
      email?: string | null
      nickname?: string | null
      settlementBankName?: string | null
      settlementAccountNumber?: string | null
      settlementAccountHolder?: string | null
    } | null
  } | null
  seller?: {
    email?: string | null
    nickname?: string | null
    settlementBankName?: string | null
    settlementAccountNumber?: string | null
    settlementAccountHolder?: string | null
  } | null
  approvedBy?: { email?: string | null; nickname?: string | null } | null
}

const statusMeta: Record<EnrollmentStatus, { label: string; tone: "secondary" | "outline" | "destructive"; icon: typeof Clock3 }> = {
  AWAITING_PLATFORM_FEE: { label: "입금 확인 대기", tone: "outline", icon: Clock3 },
  APPROVED: { label: "수강 승인 완료", tone: "secondary", icon: CheckCircle2 },
  REJECTED: { label: "반려", tone: "destructive", icon: XCircle },
  CANCELED: { label: "취소", tone: "outline", icon: XCircle },
}

function money(value: number) {
  return `₩${value.toLocaleString()}`
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

export default function MeEnrollmentRequestsPage() {
  const pathname = usePathname()
  const { data, isLoading } = useQuery({
    queryKey: ["me-enrollment-requests"],
    queryFn: async () => {
      const { data } = await axios.get("/api/me/enrollment-requests")
      return data as { requests: EnrollmentRequest[] }
    },
  })

  const requests = data?.requests ?? []

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">Bank transfer requests</Badge>
        <h1 className="text-[28px] font-bold leading-[1.43]">수강 신청 내역</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          계좌 입금으로 신청한 강의의 승인 상태와 입금 정보를 확인합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>신청 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="rounded-[14px] border bg-background p-8 text-center text-sm text-muted-foreground">
              신청 내역을 불러오는 중입니다.
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-[14px] border bg-background p-8 text-center text-sm text-muted-foreground">
              아직 수강 신청한 강의가 없습니다.
            </div>
          ) : (
            <div className="divide-y rounded-[14px] border">
              {requests.map((request) => {
                const lecture = request.lecture
                const image = toCdnUrl(lecture?.imageUrl)
                const meta = statusMeta[request.status]
                const Icon = meta.icon
                const bankName = request.sellerBankName || request.seller?.settlementBankName || lecture?.instructor?.settlementBankName
                const accountNumber = request.sellerAccountNumber || request.seller?.settlementAccountNumber || lecture?.instructor?.settlementAccountNumber
                const accountHolder = request.sellerAccountHolder || request.seller?.settlementAccountHolder || lecture?.instructor?.settlementAccountHolder

                return (
                  <div key={request.id} className="grid gap-4 p-4 lg:grid-cols-[112px_1fr_220px] lg:items-center">
                    <div className="aspect-video overflow-hidden rounded-[14px] bg-muted lg:aspect-square">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={lecture?.title ?? "수강 신청 강의"} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={meta.tone}>
                          <Icon className="size-3" />
                          {meta.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">신청일 {formatDate(request.createdAt)}</span>
                      </div>
                      <h2 className="mt-3 truncate text-base font-bold">{lecture?.title ?? "삭제된 강의"}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {lecture?.shortDescription || lecture?.instructor?.nickname || lecture?.instructor?.email || "강의 정보가 없습니다."}
                      </p>
                      <div className="mt-3 grid gap-2 rounded-[14px] bg-muted/50 p-3 text-xs text-muted-foreground md:grid-cols-2">
                        <span>신청 금액 <b className="text-foreground">{money(request.amount)}</b></span>
                        <span>승인일 <b className="text-foreground">{formatDate(request.approvedAt)}</b></span>
                        <span>입금 은행 <b className="text-foreground">{bankName || "확인 필요"}</b></span>
                        <span>예금주 <b className="text-foreground">{accountHolder || "확인 필요"}</b></span>
                        <span className="md:col-span-2">계좌번호 <b className="text-foreground">{accountNumber || "판매자 계좌 등록 대기"}</b></span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {request.status === "APPROVED" && lecture ? (
                        <Button asChild>
                          <Link href={withLocalePath(pathname, `/course/${lecture.id}`)}>
                            수강하러 가기
                          </Link>
                        </Button>
                      ) : null}
                      {request.status === "AWAITING_PLATFORM_FEE" ? (
                        <Button variant="outline" disabled>
                          <Banknote className="size-4" />
                          입금 확인 대기
                        </Button>
                      ) : null}
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
