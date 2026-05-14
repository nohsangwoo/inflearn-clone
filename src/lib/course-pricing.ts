export const MAX_COURSE_DISCOUNT_RATE = 0.3

export function isValidWonAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
}

export function getMinimumDiscountPrice(price: number) {
  if (!isValidWonAmount(price)) return 0
  return Math.ceil(price * (1 - MAX_COURSE_DISCOUNT_RATE))
}

export function formatWon(value: number) {
  return `₩${value.toLocaleString("ko-KR")}`
}

export function getDiscountPriceRangeText(price: number) {
  const min = getMinimumDiscountPrice(price)
  return `${formatWon(min)} ~ ${formatWon(price)}`
}

export function validateCoursePrice(value: unknown) {
  if (!isValidWonAmount(value)) {
    return "가격은 0원 이상의 정수로 입력해주세요."
  }
  return null
}

export function validateCourseDiscountPrice(discountPrice: unknown, price: number) {
  if (discountPrice === null || discountPrice === undefined) return null
  if (!isValidWonAmount(discountPrice)) {
    return "할인 가격은 0원 이상의 정수로 입력해주세요."
  }
  if (!isValidWonAmount(price)) {
    return "정가를 먼저 0원 이상의 정수로 입력해주세요."
  }
  const minimumDiscountPrice = getMinimumDiscountPrice(price)
  if (discountPrice > price) {
    return "할인 가격은 정가보다 높을 수 없습니다."
  }
  if (discountPrice < minimumDiscountPrice) {
    return `할인은 최대 30%까지만 적용할 수 있습니다. ${formatWon(price)} 강의는 ${getDiscountPriceRangeText(price)} 범위로 설정해주세요.`
  }
  return null
}
