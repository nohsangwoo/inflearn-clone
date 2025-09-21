'use client'

// Purchase mutation with improved error handling
import axios from 'axios'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
type LectureDetailMinimal = { id: number } | null | undefined
// v2에서는 payment().requestPayment(structured) 사용

export const createPurchaseMutation = (detail: LectureDetailMinimal) => ({
  mutationFn: async () => {
    try {
      if (!detail) return

      console.log('[Purchase] Creating order for lecture', detail.id)

      // 1) 서버에서 주문 생성
      const { data: order } = await axios.post('/api/payments/orders', {
        lectureId: detail.id,
      })
      console.log('[Purchase] Order created:', order)

      // 2) 결제 위젯 호출
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      if (!clientKey) {
        throw new Error('결제 설정이 올바르지 않습니다. (clientKey)')
      }

      const toss = await loadTossPayments(clientKey)
      const payment = toss.payment({ customerKey: ANONYMOUS })

      const successUrl = `${window.location.origin}/api/payments/success`
      const failUrl = `${window.location.origin}/api/payments/fail`

      console.log('[Purchase] Opening payment widget', {
        orderId: order.orderId,
        amount: order.amount,
        orderName: order.orderName,
      })

      // 결제 요청
      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: Number(order.amount) },
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl,
        failUrl,
        card: { flowMode: 'DEFAULT', useCardPoint: false, useAppCardOnly: false },
      })
    } catch (err: unknown) {
      console.error('[Purchase] Full error:', err)

      let errorMessage = '결제 요청 중 오류가 발생했습니다.'

      if (err && typeof err === 'object') {
        const anyErr = err as { code?: string; error?: string; message?: string; response?: { status?: number; data?: { message?: string } } }

        // Toss Payments SDK 에러
        if ('code' in anyErr || 'error' in anyErr) {
          errorMessage = anyErr.error || anyErr.message || errorMessage
          console.error('[Purchase] Toss error details:', {
            code: anyErr.code,
            error: anyErr.error,
            message: anyErr.message,
            fullObject: JSON.stringify(anyErr),
          })
        }
        // Axios 에러
        else if (anyErr.response) {
          errorMessage = anyErr.response?.data?.message || anyErr.message || errorMessage
          console.error('[Purchase] API error:', { status: anyErr.response?.status, data: anyErr.response?.data })
        }
        // 일반 Error 객체
        else if (typeof anyErr.message === 'string') {
          errorMessage = anyErr.message as string
        }
      }

      alert(`결제 요청에 실패했습니다.\n${errorMessage}`)
      throw err // Re-throw for mutation error handling
    }
  },
})
