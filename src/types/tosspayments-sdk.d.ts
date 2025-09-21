declare module '@tosspayments/tosspayments-sdk' {
  export function loadTossPayments(clientKey: string): Promise<{
    payment(input: { customerKey: string }): { requestPayment(input: any): Promise<void> }
    widgets(input: { customerKey: string }): {
      setAmount(input: { currency: string; value: number }): Promise<void>
      renderPaymentMethods(input: { selector: string; variantKey?: string }): Promise<void>
      renderAgreement(input: { selector: string; variantKey?: string }): Promise<void>
      requestPayment(input: { orderId: string; orderName: string; successUrl: string; failUrl: string }): Promise<void>
    }
  }>
  export const ANONYMOUS: string
}


