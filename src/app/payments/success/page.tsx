'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ConfirmResult = { ok?: boolean; orderId?: string; message?: string; code?: string | number }

export default function PaymentSuccessPage() {
  const search = useSearchParams()
  const router = useRouter()
  const paymentKey = search.get('paymentKey') || ''
  const orderId = search.get('orderId') || ''
  const amountStr = search.get('amount') || ''
  const amount = useMemo(() => Number(amountStr), [amountStr])

  const [state, setState] = useState<'loading' | 'success' | 'error'>(
    !paymentKey || !orderId || !Number.isFinite(amount) ? 'error' : 'loading',
  )
  const [result, setResult] = useState<ConfirmResult>({})

  useEffect(() => {
    const run = async () => {
      if (!paymentKey || !orderId || !Number.isFinite(amount)) {
        setResult({ message: 'invalid query' })
        setState('error')
        return
      }
      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        })
        const json = (await res.json()) as ConfirmResult
        if (res.ok) {
          setResult(json)
          setState('success')
          // 구매 여부 캐시 무효화 유도: 성공 후 상세 페이지 재진입 시 버튼 상태 반영
          try { await fetch('/api/revalidate?tag=course-purchased', { method: 'POST' }) } catch {}
        } else {
          setResult(json)
          setState('error')
        }
      } catch (e) {
        setResult({ message: (e as Error)?.message || 'confirm failed' })
        setState('error')
      }
    }
    void run()
  }, [paymentKey, orderId, amount])

  const currency = (v: number) => `₩${v.toLocaleString()}`

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          {state === 'loading' && (
            <div className="space-y-2">
              <div className="text-lg font-medium">결제 승인 중…</div>
              <div className="text-sm text-muted-foreground">
                잠시만 기다려 주세요. 결제 정보를 확인하고 있어요.
              </div>
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-4">
              <div className="text-xl font-semibold">결제를 완료했어요</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">결제 금액</span><span>{currency(amount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">주문번호</span><span>{orderId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">paymentKey</span><span className="truncate max-w-[260px]" title={paymentKey}>{paymentKey}</span></div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => router.push('/')}>홈으로</Button>
                <Button variant="outline" className="flex-1" onClick={() => router.back()}>이전으로</Button>
              </div>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-3">
              <div className="text-xl font-semibold">결제를 확인하지 못했어요</div>
              <div className="text-sm text-muted-foreground">
                {result?.message || '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => router.push('/')}>홈으로</Button>
                <Button variant="outline" className="flex-1" onClick={() => router.back()}>이전으로</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


