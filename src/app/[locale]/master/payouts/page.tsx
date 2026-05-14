"use client"

import axios from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Banknote, CheckCircle2, PauseCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Payout = {
  id: string
  status: "PENDING" | "APPROVED" | "PAID" | "HOLD" | "CANCELED"
  grossAmount: number
  platformFee: number
  payoutAmount: number
  memo?: string | null
  createdAt: string
  paidAt?: string | null
  seller: { id: number; email: string; nickname?: string | null }
}

type SellerSettlement = {
  sellerId: number
  approvedCount: number
  awaitingCount: number
  grossApprovedAmount: number
  platformFeeAmount: number
  sellerReceivableAmount: number
  pendingGrossAmount: number
  seller: { id: number; email: string; nickname?: string | null }
}

function money(value: number) {
  return `₩${value.toLocaleString()}`
}

export default function MasterPayoutsPage() {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ["master-payouts"],
    queryFn: async () => {
      const { data } = await axios.get("/api/master/payouts")
      return data as { payouts: Payout[]; sellerSummaries: SellerSettlement[] }
    },
  })

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Payout["status"] }) => {
      await axios.patch("/api/master/payouts", { id, status })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["master-payouts"] }),
  })

  const payouts = data?.payouts ?? []
  const sellerSummaries = data?.sellerSummaries ?? []

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-3">Manual payout</Badge>
        <h1 className="text-[28px] font-bold leading-[1.43]">판매자 수동 정산</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          자동 송금 전까지 최고 관리자가 검토하고 지급 상태를 수동으로 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>판매자별 정산 현황</CardTitle>
        </CardHeader>
        <CardContent>
          {sellerSummaries.length === 0 ? (
            <div className="rounded-[14px] border bg-background p-8 text-center text-sm text-muted-foreground">
              승인된 수강신청 정산 데이터가 없습니다.
            </div>
          ) : (
            <div className="divide-y rounded-[14px] border">
              {sellerSummaries.map((summary) => (
                <div key={summary.sellerId} className="grid gap-4 p-4 xl:grid-cols-[1fr_150px_150px_150px_130px] xl:items-center">
                  <div className="min-w-0">
                    <div className="font-bold">{summary.seller.nickname || summary.seller.email}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      승인 {summary.approvedCount.toLocaleString()}건 · 입금 확인 대기 {summary.awaitingCount.toLocaleString()}건
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">승인 매출</div>
                    <div className="font-semibold">{money(Number(summary.grossApprovedAmount))}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">판매자 귀속</div>
                    <div className="font-semibold">{money(Number(summary.sellerReceivableAmount))}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">플랫폼 수수료</div>
                    <div className="font-semibold">{money(Number(summary.platformFeeAmount))}</div>
                  </div>
                  <Badge variant={summary.awaitingCount > 0 ? "outline" : "secondary"}>
                    대기 {money(Number(summary.pendingGrossAmount))}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>수동 지급 기록</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="rounded-[14px] border bg-background p-8 text-center text-sm text-muted-foreground">
              아직 별도로 생성된 지급 기록이 없습니다. 위 정산 현황을 기준으로 수동 지급 후 기록을 추가하면 됩니다.
            </div>
          ) : (
            <div className="divide-y rounded-[14px] border">
              {payouts.map((payout) => (
                <div key={payout.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_150px_140px_220px] lg:items-center">
                  <div className="min-w-0">
                    <div className="font-bold">{payout.seller.nickname || payout.seller.email}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      총매출 {money(payout.grossAmount)} · 수수료 {money(payout.platformFee)}
                    </div>
                    {payout.memo ? <div className="mt-1 text-xs text-muted-foreground">{payout.memo}</div> : null}
                  </div>
                  <div className="text-lg font-semibold">{money(payout.payoutAmount)}</div>
                  <Badge variant={payout.status === "PAID" ? "secondary" : "outline"}>{payout.status}</Badge>
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ id: payout.id, status: "APPROVED" })}>
                      <CheckCircle2 className="size-4" />
                      승인
                    </Button>
                    <Button size="sm" onClick={() => update.mutate({ id: payout.id, status: "PAID" })}>
                      <Banknote className="size-4" />
                      지급완료
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => update.mutate({ id: payout.id, status: "HOLD" })}>
                      <PauseCircle className="size-4" />
                      보류
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
