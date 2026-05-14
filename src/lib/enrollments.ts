type PricedLecture = {
  price: number
  discountPrice?: number | null
  platformFeeRateBps?: number | null
}

export function getEffectiveLectureAmount(lecture: PricedLecture) {
  return typeof lecture.discountPrice === "number" && lecture.discountPrice < lecture.price
    ? lecture.discountPrice
    : lecture.price
}

export function getPlatformFeeRateBps(lecture: PricedLecture) {
  const envRate = Number(process.env.PLATFORM_FEE_RATE_BPS ?? "")
  const configured = Number.isFinite(envRate) ? envRate : lecture.platformFeeRateBps ?? 0

  return Math.min(10_000, Math.max(0, Math.round(configured)))
}

export function calculatePlatformFeeAmount(amount: number, platformFeeRateBps: number) {
  if (amount <= 0 || platformFeeRateBps <= 0) return 0
  return Math.floor((amount * platformFeeRateBps) / 10_000)
}

export function getPlatformDepositAccount() {
  return {
    bankName: process.env.PLATFORM_BANK_NAME ?? "",
    accountNumber: process.env.PLATFORM_BANK_ACCOUNT_NUMBER ?? "",
    accountHolder: process.env.PLATFORM_BANK_ACCOUNT_HOLDER ?? "",
  }
}
