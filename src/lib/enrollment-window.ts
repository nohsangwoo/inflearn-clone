export type EnrollmentAvailabilityStatus = "OPEN" | "NOT_STARTED" | "CLOSED" | "FULL" | "PAUSED"

export type EnrollmentWindowInput = {
  enrollmentOpen?: boolean | null
  enrollmentStartAt?: Date | string | null
  enrollmentEndAt?: Date | string | null
  enrollmentCapacity?: number | null
  enrollmentAppliedCount?: number | null
}

function toDate(value?: Date | string | null) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function getEnrollmentAvailability(input: EnrollmentWindowInput, now = new Date()) {
  const startsAt = toDate(input.enrollmentStartAt)
  const endsAt = toDate(input.enrollmentEndAt)
  const capacity = typeof input.enrollmentCapacity === "number" && input.enrollmentCapacity > 0
    ? input.enrollmentCapacity
    : null
  const appliedCount = Math.max(0, Number(input.enrollmentAppliedCount ?? 0))
  const remainingSeats = capacity === null ? null : Math.max(0, capacity - appliedCount)

  let status: EnrollmentAvailabilityStatus = "OPEN"
  if (input.enrollmentOpen === false) status = "PAUSED"
  else if (startsAt && startsAt > now) status = "NOT_STARTED"
  else if (endsAt && endsAt < now) status = "CLOSED"
  else if (capacity !== null && appliedCount >= capacity) status = "FULL"

  return {
    status,
    isAvailable: status === "OPEN",
    startsAt: startsAt?.toISOString() ?? null,
    endsAt: endsAt?.toISOString() ?? null,
    capacity,
    appliedCount,
    remainingSeats,
  }
}

export function getEnrollmentStatusLabel(status: EnrollmentAvailabilityStatus) {
  if (status === "OPEN") return "모집 중"
  if (status === "NOT_STARTED") return "신청 예정"
  if (status === "CLOSED") return "신청 마감"
  if (status === "FULL") return "모집 완료"
  return "모집 준비 중"
}
