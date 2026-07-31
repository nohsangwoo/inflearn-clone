import type { MockCourse } from "@/lib/mock-courses"

type ReviewSort = "latest" | "highest" | "lowest"

const reviewerNames = [
  "김**", "이**", "박**", "최**", "정**", "한**", "윤**", "임**",
  "오**", "강**", "송**", "문**", "배**", "백**", "신**", "권**",
]

const openings = [
  "혼자 공부할 때 막히던 지점을 작업 순서대로 짚어줘서 좋았습니다.",
  "완성본만 따라 하는 방식이 아니라 각 선택의 이유를 설명해 주는 점이 도움이 됐습니다.",
  "수업 하나의 목표가 분명해서 퇴근 후에도 계획대로 이어갈 수 있었습니다.",
  "기초와 실전 과제의 비율이 좋아 중간에 흐름을 놓치지 않았습니다.",
  "이미 안다고 생각했던 기본기를 다시 정리하면서 작업 습관이 많이 달라졌습니다.",
  "예제가 실제 프로젝트에서 마주치는 문제와 가까워 바로 적용할 수 있었습니다.",
  "제공된 체크리스트 덕분에 결과물을 스스로 점검하는 기준이 생겼습니다.",
  "비슷한 강의를 여러 번 들었지만 이번에는 실제 결과물까지 마무리했습니다.",
]

const closings = [
  "완성한 결과물과 제작 과정을 함께 설명할 수 있게 된 점이 가장 만족스럽습니다.",
  "다음 프로젝트에서도 같은 순서로 작업해 보려고 합니다.",
  "조금 어려운 구간도 있었지만 복습해야 할 지점이 명확했습니다.",
  "자료를 제 프로젝트에 맞게 바꾸는 방법까지 배울 수 있었습니다.",
  "수강 전보다 문제를 설명하고 해결 방향을 정하는 속도가 빨라졌습니다.",
  "중간 점검 기준이 분명해 혼자 다시 만들어 볼 때도 자신감이 생겼습니다.",
]

function buildDistribution(total: number, average: number) {
  let three = total >= 20 ? Math.max(1, Math.round(total * 0.025)) : 0
  const targetTotal = Math.round(total * average)
  let five = targetTotal - 4 * total + three
  while (three > 0 && five > total - three) {
    three -= 1
    five = targetTotal - 4 * total + three
  }
  five = Math.max(0, Math.min(total - three, five))
  const four = Math.max(0, total - five - three)
  return { 5: five, 4: four, 3: three, 2: 0, 1: 0 }
}

function ratingSequence(distribution: Record<number, number>) {
  const ratings = [5, 4, 3, 2, 1].flatMap((rating) =>
    Array.from({ length: distribution[rating] ?? 0 }, () => rating),
  )
  return ratings
    .map((rating, index) => ({ rating, rank: (index * 37 + 11) % Math.max(1, ratings.length) }))
    .sort((left, right) => left.rank - right.rank)
    .map(({ rating }) => rating)
}

export function getDevelopmentMockReviews({
  course,
  page,
  pageSize,
  rating,
  sort,
}: {
  course: MockCourse
  page: number
  pageSize: number
  rating: number | null
  sort: ReviewSort
}) {
  const distribution = buildDistribution(course.reviewCount, course.avgRating)
  const now = Date.now()
  const allItems = ratingSequence(distribution).map((score, index) => {
    const outcome = course.learningOutcomes[index % course.learningOutcomes.length]
    const content = `${openings[(index + course.id) % openings.length]} 특히 ‘${outcome}’ 파트에서 기준을 잡을 수 있었고, ${closings[(index * 3 + course.id) % closings.length]}`
    const createdAt = new Date(now - (index + 1) * 19 * 60 * 60 * 1000).toISOString()
    return {
      id: course.id * 10_000 + index + 1,
      content,
      rating: score,
      createdAt,
      author: {
        displayName: reviewerNames[(index + course.id) % reviewerNames.length],
        profileImageUrl: null,
      },
      verifiedPurchase: index % 11 !== 0,
      progressPercent: 48 + ((index * 13 + course.id) % 53),
      replies:
        index % 5 === 2
          ? [{
              id: course.id * 1_000_000 + index + 1,
              content: `구체적인 후기를 남겨주셔서 감사합니다. ${outcome} 결과물을 다음 프로젝트에도 같은 점검 순서로 적용해 보세요.`,
              createdAt: new Date(new Date(createdAt).getTime() + 8 * 60 * 60 * 1000).toISOString(),
              author: {
                displayName: course.instructor.nickname,
                profileImageUrl: course.instructor.profileImageUrl ?? null,
                role: "TEACHER",
              },
            }]
          : [],
    }
  })

  const filtered = rating
    ? allItems.filter((item) => item.rating === rating)
    : allItems
  filtered.sort((left, right) => {
    if (sort === "highest") {
      return right.rating - left.rating || right.createdAt.localeCompare(left.createdAt)
    }
    if (sort === "lowest") {
      return left.rating - right.rating || right.createdAt.localeCompare(left.createdAt)
    }
    return right.createdAt.localeCompare(left.createdAt)
  })

  const start = (page - 1) * pageSize
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  return {
    isSeedData: true,
    summary: {
      total: course.reviewCount,
      average: course.avgRating,
      distribution,
      verifiedCount: Math.round(course.reviewCount * 0.91),
    },
    items: filtered.slice(start, start + pageSize),
    pageInfo: {
      page,
      pageSize,
      totalItems: filtered.length,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
    viewer: {
      authenticated: false,
      canReview: false,
      hasPurchased: false,
      existingReviewId: null,
      reason: "SEED_COURSE" as const,
    },
  }
}
