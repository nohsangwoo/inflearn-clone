'use client'

import { useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PaymentFailPage() {
  const search = useSearchParams()
  const router = useRouter()
  const code = search.get('code') || ''
  const message = search.get('message') || ''
  const orderId = search.get('orderId') || ''
  const hint = useMemo(() => (code || message) ? `${code} ${message}`.trim() : '결제가 실패했어요', [code, message])

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-xl font-semibold">결제를 실패했어요</div>
          <div className="space-y-1 text-sm">
            <div className="text-muted-foreground">사유</div>
            <div className="break-words">{hint}</div>
            {orderId && (
              <div className="text-xs text-muted-foreground">주문번호: {orderId}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => router.push('/')}>홈으로</Button>
            <Button variant="outline" className="flex-1" onClick={() => router.back()}>이전으로</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


