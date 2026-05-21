export type HomepageSectionKey = "creators" | "build-reference" | "buyer-question"

export type HomepageSection = {
  sectionKey: HomepageSectionKey
  eyebrow: string
  title: string
  description: string
  position: number
  isEnabled: boolean
  metadata?: Record<string, unknown> | null
}

export const defaultHomepageSections: HomepageSection[] = [
  {
    sectionKey: "creators",
    eyebrow: "For course creators",
    title: "강의를 팔고 싶다면, 업로드 버튼보다 먼저 필요한 건 운영 흐름입니다.",
    description:
      "링구스트는 수강생에게는 강의 마켓처럼 보이지만, 강의 판매자와 운영자에게는 모집, 입금 확인, 수강권한, 정산, SEO 노출까지 이어지는 실제 강의 플랫폼 제작 레퍼런스입니다.",
    position: 10,
    isEnabled: true,
  },
  {
    sectionKey: "build-reference",
    eyebrow: "LMS / Website build reference",
    title: "이 사이트 자체가 강의 플랫폼 제작 문의를 받기 위한 포트폴리오입니다.",
    description:
      "주식회사 럿지는 공공기관, 교육, 병원, 브랜드 홈페이지, 업무 시스템, AI 자동화 프로젝트를 다뤄온 개발사입니다. 링구스트는 그 경험을 강의 판매형 LMS로 압축한 레퍼런스입니다.",
    position: 20,
    isEnabled: true,
  },
  {
    sectionKey: "buyer-question",
    eyebrow: "What buyers ask first",
    title: "“인프런 같은 강의 플랫폼을 우리 브랜드로 만들 수 있나요?”",
    description:
      "가능합니다. 다만 처음부터 거대한 플랫폼을 복제하기보다, 판매할 강의의 모집 방식과 결제/입금 확인, 수강권한, 영상 보안, SEO 유입, 운영자 승인 흐름을 먼저 맞추는 것이 비용과 운영 리스크를 줄입니다.",
    position: 30,
    isEnabled: true,
  },
]

export function normalizeHomepageSections(sections: HomepageSection[]) {
  const byKey = new Map(defaultHomepageSections.map((section) => [section.sectionKey, section]))
  for (const section of sections) {
    if (byKey.has(section.sectionKey)) byKey.set(section.sectionKey, section)
  }
  return [...byKey.values()]
    .filter((section) => section.isEnabled)
    .sort((a, b) => a.position - b.position)
}
