import { getEnrollmentAvailability, type EnrollmentAvailabilityStatus } from "@/lib/enrollment-window"

export type MockCourse = {
  id: number
  title: string
  slug: string
  shortDescription: string
  description: string
  category: string
  level: string
  languageCode: string
  tags: string[]
  seoKeywords: string[]
  targetAudience: string
  requirements: string
  learningOutcomes: string[]
  metaTitle: string
  metaDescription: string
  ogImageUrl: string
  canonicalUrl: string | null
  enrollmentOpen: boolean
  enrollmentStartAt: string | null
  enrollmentEndAt: string | null
  enrollmentCapacity: number | null
  enrollmentAppliedCount: number
  enrollmentStatus?: EnrollmentAvailabilityStatus
  enrollmentAvailable?: boolean
  remainingSeats?: number | null
  price: number
  discountPrice: number | null
  imageUrl: string
  createdAt: string
  purchaseCount: number
  reviewCount: number
  avgRating: number
  likeCount: number
  instructor: { id: number; nickname: string; email: string; profileImageUrl?: string | null }
  lastUpdatedAt: string
  includedFeatures: string[]
  relatedTopics: string[]
  sections: Array<{
    id: number
    moduleTitle: string
    title: string
    description: string
    active: boolean
    hasVideo: boolean
    hlsStatus: string | null
    durationSeconds: number
    isFreePreview: boolean
    previewVideoUrl?: string | null
    resources?: string[]
  }>
}

export const previewImages = [
  "/course-previews/course-101.png",
  "/course-previews/course-102.png",
  "/course-previews/course-103.png",
  "/course-previews/course-104.png",
  "/course-previews/course-105.png",
  "/course-previews/course-106.png",
  "/course-previews/course-107.png",
  "/course-previews/course-108.png",
]

type MockLessonInput = {
  title: string
  description: string
  minutes: number
  resources?: string[]
}

type MockModuleInput = {
  moduleTitle: string
  lessons: MockLessonInput[]
}

const lessonPlan = (title: string, description: string, minutes: number, resources?: string[]): MockLessonInput => ({
  title,
  description,
  minutes,
  resources,
})

const modulePlan = (moduleTitle: string, lessons: MockLessonInput[]): MockModuleInput => ({
  moduleTitle,
  lessons,
})

function buildMockSections(courseId: number, modules: MockModuleInput[]): MockCourse["sections"] {
  let sequence = 0
  return modules.flatMap((module) =>
    module.lessons.map((lesson) => {
      sequence += 1
      return {
        id: courseId * 100 + sequence,
        moduleTitle: module.moduleTitle,
        title: lesson.title,
        description: lesson.description,
        active: true,
        hasVideo: false,
        hlsStatus: null,
        durationSeconds: lesson.minutes * 60,
        isFreePreview: false,
        previewVideoUrl: null,
        resources: lesson.resources,
      }
    }),
  )
}

function getTotalDurationSeconds(course: Pick<MockCourse, "sections">) {
  return course.sections.reduce((sum, section) => sum + section.durationSeconds, 0)
}

function formatCourseHours(totalSeconds: number) {
  const hours = Math.round((totalSeconds / 3600) * 10) / 10
  return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)}시간 분량 커리큘럼`
}

const lingoostSeoKeywords = [
  "링구스트",
  "Lingoost",
  "럿지",
  "주식회사 럿지",
  "온라인 강의",
  "강의 플랫폼",
  "강의 판매",
  "강의 등록",
  "강의자 모집",
  "시즌제 강의",
  "수강 신청",
  "계좌입금 강의",
  "HLS 강의",
  "강의 SEO",
]

function withDerivedMockStats(course: MockCourse) {
  const totalDurationSeconds = getTotalDurationSeconds(course)
  const durableFeatures = course.includedFeatures.filter(
    (feature) => !feature.includes("주문형 영상") && !/^\d+(\.\d+)?시간/.test(feature) && !/^\d+개 수업/.test(feature),
  )
  const seoKeywords = [...new Set([...course.seoKeywords, ...course.tags, course.category, ...lingoostSeoKeywords])]

  return {
    ...course,
    canonicalUrl: course.canonicalUrl ?? `https://www.lingoost.com/ko/course/${course.id}`,
    seoKeywords,
    relatedTopics: [...new Set([...course.relatedTopics, ...seoKeywords])],
    includedFeatures: [
      formatCourseHours(totalDurationSeconds),
      `${course.sections.length}개 수업`,
      ...durableFeatures,
    ].slice(0, 6),
  }
}

export const mockCourses: MockCourse[] = [
  {
    id: 101,
    title: "Next.js로 강의 거래소 만들기",
    slug: "nextjs-course-marketplace",
    shortDescription: "상품, 수강신청, 계좌입금 승인, SEO까지 웹 플랫폼의 뼈대를 완성합니다.",
    description: "웹 우선 강의 플랫폼을 직접 만들며 서비스 구조를 익힙니다. 판매 페이지, 모집 기간, 입금 확인 기반 수강 승인까지 실제 운영 흐름으로 배웁니다.",
    category: "웹 개발",
    level: "중급",
    languageCode: "ko",
    tags: ["Next.js", "Drizzle", "SEO"],
    seoKeywords: ["Next.js 강의", "강의 플랫폼", "Drizzle ORM", "SEO"],
    targetAudience: "직접 강의 플랫폼을 만들고 싶은 개발자와 1인 창업자",
    requirements: "React와 TypeScript 기초 지식",
    learningOutcomes: ["강의 목록과 상세 페이지 설계", "SEO 메타데이터 구성", "수강신청 흐름 이해"],
    metaTitle: "Next.js로 강의 거래소 만들기 | 링구스트",
    metaDescription: "Next.js, Drizzle, SEO 기반으로 강의 거래소의 핵심 구조를 만드는 강의입니다.",
    ogImageUrl: previewImages[0],
    canonicalUrl: null,
    enrollmentOpen: true,
    enrollmentStartAt: "2026-05-10T00:00:00.000Z",
    enrollmentEndAt: "2026-06-05T14:59:59.000Z",
    enrollmentCapacity: 40,
    enrollmentAppliedCount: 27,
    price: 99000,
    discountPrice: 69000,
    imageUrl: previewImages[0],
    createdAt: "2026-05-01T00:00:00.000Z",
    purchaseCount: 1240,
    reviewCount: 186,
    avgRating: 4.88,
    likeCount: 342,
    instructor: { id: 9001, nickname: "링구스트랩", email: "studio@seed.lingoost.local" },
    lastUpdatedAt: "2026-05-12T00:00:00.000Z",
    includedFeatures: ["실습용 Drizzle 스키마", "SEO 체크리스트", "운영 상태표 템플릿", "모바일/데스크톱 수강"],
    relatedTopics: ["Next.js", "Marketplace", "Drizzle ORM", "SEO", "Bank transfer approval"],
    sections: buildMockSections(101, [
      modulePlan("서비스 구조와 도메인 설계", [
        lessonPlan("강의 거래소의 핵심 사용자 흐름", "수강생, 판매자, 최고 관리자가 각각 어떤 화면과 상태를 가져야 하는지 정리합니다.", 16, ["domain-flow.pdf"]),
        lessonPlan("역할별 권한과 상태 전이", "수강 신청, 입금 대기, 승인, 수강 가능 상태를 상태 머신으로 나눕니다.", 18),
        lessonPlan("강의 상품이 가져야 할 필드", "가격, 할인, 모집 기간, 정원, SEO, 이미지 필드를 실제 등록 폼 기준으로 설계합니다.", 17),
        lessonPlan("웹 우선 구조와 앱 래핑 전략", "Next.js 웹을 먼저 완성하고 나중에 앱으로 감싸도 흔들리지 않는 경계를 잡습니다.", 15),
      ]),
      modulePlan("Drizzle ORM과 데이터 모델", [
        lessonPlan("Prisma에서 Drizzle로 옮길 때의 관점", "실무에서 자주 부딪히는 마이그레이션, 타입, 쿼리 문제를 비교합니다.", 18),
        lessonPlan("Lecture, Curriculum, Section 스키마", "강의, 섹션, 수업, 영상, 파일 관계를 Drizzle 테이블로 모델링합니다.", 20, ["schema-map.md"]),
        lessonPlan("수강 신청과 Purchase 권한 설계", "결제 대신 계좌입금 확인으로 권한을 여는 초기 운영 모델을 구현합니다.", 21),
        lessonPlan("판매자 계좌와 정산 데이터", "판매자가 직접 계좌를 등록하고 운영자가 나중에 정산할 수 있는 데이터를 남깁니다.", 17),
        lessonPlan("마이그레이션 운영 체크리스트", "컬럼 추가, 기본값, 배포 전후 순서를 안전하게 관리하는 기준을 세웁니다.", 16),
      ]),
      modulePlan("강의 목록과 상세 페이지", [
        lessonPlan("사진 중심 강의 카드 UI", "프리뷰 이미지, 모집 상태, 가격, 할인 배지를 소비자 마켓플레이스처럼 구성합니다.", 17),
        lessonPlan("시즌제 모집 상태 표시", "모집 전, 모집 중, 모집 완료, 신청 마감 상태를 한눈에 이해되게 만듭니다.", 18),
        lessonPlan("강의 상세 첫 화면 구성", "제목, 요약, 학습 결과, 추천 대상, 준비물을 전환 중심으로 배치합니다.", 19),
        lessonPlan("가격과 할인 정보 노출", "할인율이 주목되지만 과하게 시끄럽지 않은 가격 표시 패턴을 적용합니다.", 15),
        lessonPlan("리뷰와 좋아요의 초기 데이터 전략", "초기 서비스처럼 보이되 실제 운영과 충돌하지 않는 통계를 설계합니다.", 14),
      ]),
      modulePlan("SEO와 검색 노출", [
        lessonPlan("강의별 메타데이터 설계", "meta title, description, keywords, canonical URL을 강의 등록 데이터로 연결합니다.", 18, ["seo-fields.xlsx"]),
        lessonPlan("OG 이미지와 공유 카드", "1200px 계열 대표 이미지가 공유와 검색 결과에서 어떻게 쓰이는지 확인합니다.", 16),
        lessonPlan("sitemap.xml 자동 생성", "활성 강의가 검색엔진에 발견되도록 사이트맵 라우트를 구성합니다.", 18),
        lessonPlan("카테고리와 태그 구조", "검색 의도와 내부 탐색을 동시에 만족하는 태그 체계를 만듭니다.", 15),
      ]),
      modulePlan("계좌입금 수강 신청", [
        lessonPlan("수강 신청 API 만들기", "계좌입금 방식에서도 주문 금액, 신청자, 판매자 계좌 정보를 남깁니다.", 19),
        lessonPlan("입금 대기 화면과 안내 문구", "수강생이 어디로 입금해야 하는지, 언제 승인되는지 명확히 보여줍니다.", 16),
        lessonPlan("판매자 신청자 리스트", "판매자가 신청자와 입금 상태를 확인하고 승인할 수 있는 테이블을 만듭니다.", 18),
        lessonPlan("승인 시 Purchase 생성", "입금 확인 후 수강 권한을 부여하는 서버 액션과 예외 처리를 구현합니다.", 20),
        lessonPlan("취소와 중복 신청 처리", "같은 강의에 여러 번 신청했을 때 운영자가 헷갈리지 않도록 상태를 정리합니다.", 15),
      ]),
      modulePlan("판매자 스튜디오", [
        lessonPlan("강의 기본 정보 편집", "제목, 소개, 이미지, 가격, 모집 기간을 판매자가 관리하는 폼을 구성합니다.", 17),
        lessonPlan("커리큘럼 섹션과 수업 편집", "섹션 아래 여러 수업을 추가하고 공개 상태를 조절하는 UX를 만듭니다.", 19),
        lessonPlan("영상 업로드 전 운영 상태", "비디오가 없어도 커리큘럼과 판매 페이지는 먼저 완성될 수 있게 표시합니다.", 14),
        lessonPlan("판매자 대시보드 지표", "신청 수, 승인 수, 잔여 좌석, 예상 매출을 판매자가 빠르게 보게 합니다.", 16),
      ]),
      modulePlan("최고 관리자와 운영", [
        lessonPlan("전체 강의 승인 큐", "새 강의, 수정 요청, 인코딩 필요 여부를 운영자가 한 곳에서 봅니다.", 17),
        lessonPlan("수동 정산 준비 데이터", "강의별 신청 금액, 승인 수, 플랫폼 수수료를 정산 대기열로 모읍니다.", 18),
        lessonPlan("로컬 인코딩 작업 연결점", "배포 서버가 아니라 로컬 관리자 환경에서만 의미 있는 인코딩 실행 지점을 둡니다.", 16),
        lessonPlan("운영 로그와 문제 추적", "입금 승인, 권한 부여, 파일 처리 실패를 나중에 추적할 수 있게 기록합니다.", 15),
      ]),
      modulePlan("출시 전 검증", [
        lessonPlan("모바일/데스크톱 화면 QA", "카드, 상세, 신청, 대시보드가 화면 크기마다 깨지지 않는지 확인합니다.", 16),
        lessonPlan("SEO 결과물 점검", "메타 태그, OG 이미지, 사이트맵, canonical을 실제 HTML에서 확인합니다.", 15),
        lessonPlan("초기 운영 시나리오 리허설", "수강생 신청부터 판매자 승인, 관리자 정산 확인까지 전체 흐름을 한 번 돌립니다.", 18),
      ]),
    ]),
  },
  {
    id: 102,
    title: "HLS 스트리밍과 영상 운영",
    slug: "hls-video-operations",
    shortDescription: "ffmpeg, HLS, 자막, 더빙 트랙을 강의 서비스 흐름에 맞게 설계합니다.",
    description: "동영상 강의를 판매할 때 필요한 HLS 운영 전략을 다룹니다. 로컬 인코딩 승인 플로우를 기준으로 설명합니다.",
    category: "미디어",
    level: "고급",
    languageCode: "ko",
    tags: ["HLS", "FFmpeg", "Caption"],
    seoKeywords: ["HLS 강의", "FFmpeg", "영상 인코딩", "자막"],
    targetAudience: "영상 기반 교육 서비스를 운영하려는 개발자와 강의 판매자",
    requirements: "기본적인 파일 업로드와 웹 비디오 개념",
    learningOutcomes: ["HLS 변환 흐름 이해", "자막 트랙 운영", "로컬 인코딩 승인 방식 설계"],
    metaTitle: "HLS 스트리밍과 영상 운영 | 링구스트",
    metaDescription: "강의 플랫폼에서 HLS, 자막, 더빙 트랙을 운영하는 방법을 다루는 강의입니다.",
    ogImageUrl: previewImages[1],
    canonicalUrl: null,
    enrollmentOpen: true,
    enrollmentStartAt: "2026-05-01T00:00:00.000Z",
    enrollmentEndAt: "2026-05-28T14:59:59.000Z",
    enrollmentCapacity: 24,
    enrollmentAppliedCount: 24,
    price: 129000,
    discountPrice: null,
    imageUrl: previewImages[1],
    createdAt: "2026-05-02T00:00:00.000Z",
    purchaseCount: 520,
    reviewCount: 73,
    avgRating: 4.91,
    likeCount: 189,
    instructor: { id: 9002, nickname: "스트림마스터", email: "stream@seed.lingoost.local" },
    lastUpdatedAt: "2026-05-10T00:00:00.000Z",
    includedFeatures: ["HLS 인코딩 스크립트", "자막/VTT 템플릿", "로컬 승인 운영 가이드", "재생 QA 체크리스트"],
    relatedTopics: ["HLS", "FFmpeg", "VTT captions", "Dubbing", "Video QA"],
    sections: buildMockSections(102, [
      modulePlan("스트리밍 운영의 기본기", [
        lessonPlan("강의 서비스에서 HLS가 필요한 이유", "다운로드형 영상과 스트리밍형 영상의 운영 차이를 비용, 보안, UX 관점으로 봅니다.", 20, ["hls-decision-guide.pdf"]),
        lessonPlan("적응형 스트리밍 구조 읽기", "master playlist, variant playlist, segment 파일이 어떤 역할을 하는지 해부합니다.", 23),
        lessonPlan("브라우저별 재생 전략", "Safari 네이티브 HLS와 Chrome hls.js 적용 방식을 나눠 설계합니다.", 19),
        lessonPlan("원본 파일 보관과 공개 파일 분리", "업로드 원본, 인코딩 결과물, 썸네일, 자막 파일의 저장 위치를 구분합니다.", 18),
      ]),
      modulePlan("FFmpeg 인코딩 파이프라인", [
        lessonPlan("원본 영상 분석하기", "해상도, 프레임레이트, 오디오 채널, 비트레이트를 인코딩 전에 확인합니다.", 22),
        lessonPlan("해상도 ladder 구성", "강의 영상에 맞는 1080p, 720p, 480p ladder를 만들고 과도한 변환을 피합니다.", 27),
        lessonPlan("segment 길이와 keyframe 설정", "탐색 속도와 파일 수 사이의 균형을 잡는 segment 전략을 적용합니다.", 25),
        lessonPlan("오디오 설정과 음량 정규화", "강의에서 듣기 좋은 음량과 압축 설정을 ffmpeg 옵션으로 정리합니다.", 21),
        lessonPlan("인코딩 실패 로그 읽기", "코덱 불일치, 손상 파일, 권한 문제를 로그에서 빠르게 분류합니다.", 20),
      ]),
      modulePlan("로컬 승인형 인코딩", [
        lessonPlan("왜 인코딩 서버를 당장 두지 않는가", "초기 운영에서 서버 비용을 줄이고 관리자 승인 흐름에 인코딩을 붙이는 이유를 설명합니다.", 19),
        lessonPlan("Next.js API와 로컬 실행 경계", "배포 서버에서도 존재하지만 실제 동작은 로컬 개발 환경에서만 허용하는 구조를 만듭니다.", 24),
        lessonPlan("관리자 승인 버튼의 작업 순서", "승인, 인코딩, 업로드, 상태 업데이트가 꼬이지 않도록 순서를 설계합니다.", 22),
        lessonPlan("긴 작업 중 UI 상태 처리", "인코딩 중, 실패, 재시도, 완료 상태를 관리자 페이지에서 보여줍니다.", 20),
        lessonPlan("R2/S3 업로드 키 규칙", "강의와 수업 id를 기준으로 HLS 파일 경로를 예측 가능하게 만듭니다.", 19, ["storage-key-rules.md"]),
      ]),
      modulePlan("자막과 다국어 트랙", [
        lessonPlan("VTT 자막 파일 구조", "시간 코드, cue, 언어 라벨을 브라우저 플레이어에 맞게 구성합니다.", 20),
        lessonPlan("영상 내 자막과 별도 자막의 충돌", "이미 자막이 박힌 영상에 별도 자막을 강제로 켜지 않도록 UX를 정합니다.", 18),
        lessonPlan("다국어 자막 등록 폼", "판매자가 한국어, 영어, 일본어 자막을 직접 등록할 수 있는 필드를 설계합니다.", 21),
        lessonPlan("자막 품질 검수 체크", "싱크, 줄 길이, 특수문자, 모바일 가독성을 검수하는 기준을 만듭니다.", 19),
      ]),
      modulePlan("플레이어 UX와 접근 제어", [
        lessonPlan("무료 공개와 유료 잠금의 차이", "무료 공개가 아닌 수업은 수강 승인 전 재생 버튼이 나타나지 않도록 합니다.", 20),
        lessonPlan("수강 권한 검증 위치", "프론트 숨김만으로 끝내지 않고 API에서 구매 권한을 확인하는 흐름을 설계합니다.", 22),
        lessonPlan("이어보기와 진도 저장", "나중에 확장할 수 있도록 플레이어 이벤트와 진도 저장 지점을 잡습니다.", 19),
        lessonPlan("모바일 재생 제약", "자동재생, inline playback, 전체화면 전환 같은 모바일 제약을 정리합니다.", 18),
      ]),
      modulePlan("운영 비용과 스토리지", [
        lessonPlan("S3, R2, Cloudflare Stream 비교", "스토리지, egress, 인코딩 비용을 초기 강의 플랫폼 관점에서 비교합니다.", 25),
        lessonPlan("R2로 옮길 때 바뀌는 것", "SDK, presigned URL, public bucket, CDN 캐시 정책의 차이를 봅니다.", 22),
        lessonPlan("Cloudflare Stream을 쓰는 경우", "인코딩 서버를 없앨 수 있는 대신 발생하는 과금과 제약을 따져봅니다.", 21),
        lessonPlan("저비용 운영 의사결정표", "트래픽이 적은 초기, 강의 수가 늘어난 중기, 규모화 이후의 선택지를 나눕니다.", 20),
      ]),
      modulePlan("릴리즈 전 영상 QA", [
        lessonPlan("데스크톱 재생 테스트", "Chrome, Safari, Firefox에서 manifest 로딩과 seek 동작을 확인합니다.", 18),
        lessonPlan("모바일 재생 테스트", "iOS Safari와 Android Chrome에서 UI와 오디오 동작을 확인합니다.", 18),
        lessonPlan("CORS와 MIME type 문제", "m3u8, ts, vtt 파일의 Content-Type과 CORS 오류를 해결합니다.", 21),
        lessonPlan("출시 전 최종 체크리스트", "샘플 영상, 썸네일, 자막, 권한, 상태 값을 한 번에 점검합니다.", 17, ["video-release-checklist.pdf"]),
      ]),
      modulePlan("실전 운영 프로젝트", [
        lessonPlan("샘플 원본을 인코딩 큐에 넣기", "관리자 승인 시점에 원본 영상이 어떤 순서로 처리되는지 프로젝트처럼 따라갑니다.", 24),
        lessonPlan("HLS 결과물 검수하기", "생성된 manifest, variant, segment 파일을 열어보고 잘못된 경로를 찾습니다.", 25),
        lessonPlan("자막과 썸네일 함께 배포하기", "영상 파일만이 아니라 자막, 썸네일, 공개 상태까지 같이 점검합니다.", 23),
        lessonPlan("실패한 인코딩 재시도하기", "실패 상태를 남기고 원인을 수정한 뒤 다시 인코딩하는 운영 절차를 연습합니다.", 24),
        lessonPlan("운영 비용 보고서 만들기", "스토리지, 전송량, 인코딩 시간 기준으로 한 달 운영 비용을 추정합니다.", 23, ["video-cost-report.xlsx"]),
      ]),
    ]),
  },
  {
    id: 103,
    title: "AI 시대 판매되는 강의 기획법",
    slug: "ai-course-planning",
    shortDescription: "검색되는 커리큘럼, 전환되는 상세 페이지, 완주율 높은 수업 설계.",
    description: "강의 판매자가 콘텐츠를 시장에 맞게 설계하는 법을 배웁니다. 검색 의도와 공개 영상 구성, 판매 페이지 카피까지 한 번에 정리합니다.",
    category: "크리에이터",
    level: "입문",
    languageCode: "ko",
    tags: ["기획", "마케팅", "커리큘럼"],
    seoKeywords: ["강의 기획", "온라인 강의 판매", "커리큘럼 설계", "AI 강의"],
    targetAudience: "첫 강의를 준비하는 크리에이터와 전문가",
    requirements: "팔고 싶은 주제와 간단한 촬영 도구",
    learningOutcomes: ["판매되는 강의 주제 선정", "검색 의도 기반 목차 구성", "상세 페이지 전환 포인트 설계"],
    metaTitle: "AI 시대 판매되는 강의 기획법 | 링구스트",
    metaDescription: "검색되는 커리큘럼과 전환되는 상세 페이지를 설계하는 강의 기획 강의입니다.",
    ogImageUrl: previewImages[2],
    canonicalUrl: null,
    enrollmentOpen: true,
    enrollmentStartAt: "2026-05-08T00:00:00.000Z",
    enrollmentEndAt: "2026-06-12T14:59:59.000Z",
    enrollmentCapacity: 60,
    enrollmentAppliedCount: 41,
    price: 59000,
    discountPrice: 39000,
    imageUrl: previewImages[2],
    createdAt: "2026-05-03T00:00:00.000Z",
    purchaseCount: 870,
    reviewCount: 92,
    avgRating: 4.74,
    likeCount: 277,
    instructor: { id: 9003, nickname: "콘텐츠빌더", email: "creator@seed.lingoost.local" },
    lastUpdatedAt: "2026-05-09T00:00:00.000Z",
    includedFeatures: ["강의 기획 워크시트", "상세페이지 카피 예시", "커리큘럼 리뷰 체크리스트", "런칭 메시지 템플릿"],
    relatedTopics: ["Course planning", "Creator business", "AI workflow", "Landing copy", "Curriculum design"],
    sections: buildMockSections(103, [
      modulePlan("팔리는 주제 찾기", [
        lessonPlan("주제 후보를 시장 언어로 바꾸기", "내가 하고 싶은 말이 아니라 수강생이 검색하는 문제로 주제를 다시 표현합니다.", 15, ["topic-scorecard.pdf"]),
        lessonPlan("전문성과 수요의 교차점", "내가 잘 아는 것과 사람들이 돈을 낼 만큼 아픈 지점을 겹쳐 봅니다.", 16),
        lessonPlan("경쟁 강의 빠르게 분석하기", "비슷한 강의의 제목, 가격, 목차, 리뷰를 보고 빈틈을 찾습니다.", 14),
        lessonPlan("첫 시즌에 팔 크기 정하기", "처음부터 대형 강의가 아니라 완주 가능한 범위로 상품을 좁힙니다.", 15),
      ]),
      modulePlan("수강생 약속 설계", [
        lessonPlan("결과 중심 한 문장 만들기", "수강생이 강의 후 무엇을 할 수 있게 되는지 한 문장으로 압축합니다.", 16),
        lessonPlan("추천 대상과 비추천 대상", "누구에게 맞고 누구에게 맞지 않는지 명확히 적어 신뢰를 만듭니다.", 14),
        lessonPlan("준비물과 전제 지식 정리", "초보자가 들어도 되는지, 어떤 경험이 필요한지 오해 없이 안내합니다.", 13),
        lessonPlan("학습 결과를 체크리스트로 바꾸기", "상세 페이지의 배우게 되는 항목을 실제 커리큘럼과 연결합니다.", 16),
      ]),
      modulePlan("커리큘럼 상품화", [
        lessonPlan("섹션 단위로 여정 만들기", "수업 나열이 아니라 문제 인식, 실습, 결과물 순서로 섹션을 만듭니다.", 18, ["curriculum-ladder.xlsx"]),
        lessonPlan("수업 제목을 구매 이유로 쓰기", "기능명이나 도구명보다 수강생이 얻는 결과 중심으로 제목을 바꿉니다.", 15),
        lessonPlan("짧은 수업과 긴 수업의 배치", "몰입이 깨지지 않도록 설명, 실습, 정리 수업의 길이를 조절합니다.", 16),
        lessonPlan("자료와 과제를 어디에 붙일까", "워크시트, 예제, 체크리스트를 커리큘럼 안에 자연스럽게 배치합니다.", 14),
      ]),
      modulePlan("상세 페이지 카피", [
        lessonPlan("첫 화면에서 신뢰 만들기", "제목, 부제, 이미지, 가격, 신청 방식이 동시에 설득하도록 구성합니다.", 16),
        lessonPlan("학습 결과 문장 다듬기", "흔한 추상 문장을 실제 행동으로 바꾸어 작성합니다.", 14),
        lessonPlan("가격 방어 문구 만들기", "왜 이 가격인지, 어떤 결과물을 얻는지 상세 페이지 안에서 설명합니다.", 15),
        lessonPlan("FAQ와 반박 처리", "수강생이 결제 전에 망설이는 질문을 미리 정리합니다.", 15),
      ]),
      modulePlan("AI를 활용한 제작 흐름", [
        lessonPlan("AI로 목차 초안 만들기", "AI를 브레인스토밍 도구로 쓰되 그대로 복붙하지 않는 기준을 세웁니다.", 15),
        lessonPlan("대본과 예시 생성하기", "수업별 예시, 설명 순서, 연습 문제를 빠르게 뽑아 다듬습니다.", 16),
        lessonPlan("상세 페이지 초안 생성", "AI가 만든 초안을 브랜드 톤과 실제 운영 정보에 맞게 교정합니다.", 14),
        lessonPlan("품질 검수 루틴", "AI가 만든 내용에서 과장, 허위, 빈약한 설명을 걸러냅니다.", 13),
      ]),
      modulePlan("첫 모집 운영", [
        lessonPlan("시즌 모집 일정 짜기", "신청 시작, 마감, 입금 확인, 첫 강의 오픈 일정을 정합니다.", 15),
        lessonPlan("초기 수강생에게 보내는 안내", "계좌입금 방식에서 필요한 안내 메시지와 확인 절차를 만듭니다.", 14),
        lessonPlan("리뷰와 피드백 받는 흐름", "첫 시즌 종료 후 다음 시즌 상세 페이지를 개선할 피드백을 모읍니다.", 15),
        lessonPlan("다음 강의로 확장하기", "첫 강의의 결과를 보고 후속 강의나 심화반을 설계합니다.", 13),
      ]),
    ]),
  },
  {
    id: 104,
    title: "수강생이 끝까지 보는 강의 편집",
    slug: "course-editing-retention",
    shortDescription: "긴 영상보다 오래 남는 리듬, 챕터, 대표 이미지를 설계합니다.",
    description: "촬영 이후 실제 판매 페이지에 올라가는 결과물을 다듬습니다.",
    category: "디자인",
    level: "입문",
    languageCode: "ko",
    tags: ["편집", "썸네일", "완주율"],
    seoKeywords: ["강의 편집", "온라인 강의 썸네일", "완주율"],
    targetAudience: "강의 영상을 더 보기 좋게 만들고 싶은 판매자",
    requirements: "기본적인 영상 편집 툴",
    learningOutcomes: ["챕터 구조화", "대표 이미지 구성", "완주율을 높이는 편집 리듬"],
    metaTitle: "수강생이 끝까지 보는 강의 편집 | 링구스트",
    metaDescription: "강의 영상의 리듬, 챕터, 대표 이미지를 설계하는 강의입니다.",
    ogImageUrl: previewImages[3],
    canonicalUrl: null,
    enrollmentOpen: true,
    enrollmentStartAt: "2026-04-15T00:00:00.000Z",
    enrollmentEndAt: "2026-05-12T14:59:59.000Z",
    enrollmentCapacity: 30,
    enrollmentAppliedCount: 22,
    price: 79000,
    discountPrice: 59000,
    imageUrl: previewImages[3],
    createdAt: "2026-05-04T00:00:00.000Z",
    purchaseCount: 438,
    reviewCount: 61,
    avgRating: 4.82,
    likeCount: 164,
    instructor: { id: 9004, nickname: "컷앤런", email: "edit@seed.lingoost.local" },
    lastUpdatedAt: "2026-05-08T00:00:00.000Z",
    includedFeatures: ["편집 리듬 체크리스트", "썸네일 템플릿", "챕터 구성 예시", "업로드 전 QA 시트"],
    relatedTopics: ["Video editing", "Retention", "Thumbnails", "Chapter design"],
    sections: buildMockSections(104, [
      modulePlan("강의 편집 기준 잡기", [
        lessonPlan("완주율을 떨어뜨리는 장면 찾기", "편집 전에 지루함, 반복, 설명 누락 구간을 표시하는 기준을 만듭니다.", 17, ["retention-audit.pdf"]),
        lessonPlan("강의 영상의 호흡 설계", "말의 속도, 침묵, 화면 전환, 줌인을 어디에 넣을지 정합니다.", 18),
        lessonPlan("수업 길이와 챕터 분할", "하나의 긴 영상을 여러 수업으로 나눌 때 기준을 세웁니다.", 16),
        lessonPlan("수강생 관점으로 다시 보기", "편집자가 아니라 처음 배우는 사람의 시선으로 흐름을 점검합니다.", 15),
      ]),
      modulePlan("컷 편집과 화면 리듬", [
        lessonPlan("불필요한 앞뒤 여백 정리", "녹화 시작과 종료의 어색한 구간을 자연스럽게 제거합니다.", 14),
        lessonPlan("설명 중 멈춤과 반복 처리", "강의자의 실수, 반복 설명, 생각하는 시간을 깔끔하게 다듬습니다.", 17),
        lessonPlan("화면 확대와 강조 컷", "코드, 문서, 슬라이드에서 집중해야 할 부분을 확대하는 타이밍을 배웁니다.", 18),
        lessonPlan("B-roll과 보조 화면 사용", "실습 화면만으로 지루할 때 보조 화면을 넣는 원칙을 정합니다.", 16),
      ]),
      modulePlan("오디오와 자막 정리", [
        lessonPlan("강의 오디오 노이즈 제거", "배경 소음, 클릭음, 숨소리, 음량 차이를 기본 수준에서 정리합니다.", 18),
        lessonPlan("말소리 음량 표준화", "수업마다 음량이 달라지지 않도록 기준을 맞춥니다.", 16),
        lessonPlan("자막이 필요한 구간 고르기", "전체 자막, 부분 자막, 화면 내 텍스트의 역할을 구분합니다.", 17),
        lessonPlan("영상 내 자막과 별도 자막", "박힌 자막과 선택 자막이 충돌하지 않도록 운영 기준을 세웁니다.", 15),
      ]),
      modulePlan("썸네일과 프리뷰 이미지", [
        lessonPlan("강의 대표 이미지의 역할", "클릭을 부르는 이미지가 아니라 내용을 신뢰시키는 이미지를 만듭니다.", 17),
        lessonPlan("할인 배지와 정보 밀도", "가격 할인은 보이게, 전체 이미지는 시끄럽지 않게 구성합니다.", 16),
        lessonPlan("수업별 대표 프레임 고르기", "영상 중 수업 내용을 잘 보여주는 프레임을 추출합니다.", 15),
        lessonPlan("이미지 비율과 크롭 QA", "1200x781 비율에서 텍스트와 핵심 오브젝트가 잘리지 않는지 확인합니다.", 16, ["thumbnail-safe-area.png"]),
      ]),
      modulePlan("학습 흐름을 살리는 챕터", [
        lessonPlan("챕터명은 결과 중심으로", "도구명보다 수강생이 얻는 결과를 챕터명에 반영합니다.", 15),
        lessonPlan("복습 가능한 구조 만들기", "수강생이 나중에 필요한 수업만 다시 찾을 수 있게 목차를 정리합니다.", 16),
        lessonPlan("실습 전 설명과 실습 후 정리", "실습만 길게 이어지지 않도록 앞뒤 요약 수업을 배치합니다.", 17),
        lessonPlan("자료 다운로드 위치 잡기", "편집 파일, 체크리스트, 예제 자료가 필요한 수업에 붙도록 구성합니다.", 14),
      ]),
      modulePlan("업로드 전 품질 검수", [
        lessonPlan("화질과 글자 가독성 확인", "코드, 문서, 슬라이드 글자가 모바일에서도 읽히는지 확인합니다.", 18),
        lessonPlan("싱크와 끊김 점검", "오디오 싱크, 화면 멈춤, 잘못 잘린 컷을 찾는 루틴을 만듭니다.", 16),
        lessonPlan("HLS 변환을 위한 export 설정", "후속 인코딩이 안정적으로 되도록 원본 파일 설정을 맞춥니다.", 18),
        lessonPlan("출시 전 최종 리스트", "썸네일, 영상, 자막, 자료, 설명 문구를 한 번에 검수합니다.", 15, ["publish-qa-sheet.xlsx"]),
      ]),
      modulePlan("실전 편집 프로젝트", [
        lessonPlan("원본 강의를 편집 계획으로 바꾸기", "긴 녹화본을 보고 어느 지점을 자르고 나눌지 편집 계획표를 만듭니다.", 19),
        lessonPlan("한 수업을 완성본으로 만들기", "컷 편집, 오디오 보정, 자막, 대표 프레임 추출을 한 번에 진행합니다.", 22),
        lessonPlan("섹션 전체 톤 맞추기", "여러 수업 사이의 소리, 화면 크기, 시작/종료 리듬을 통일합니다.", 20),
        lessonPlan("판매 페이지용 이미지 뽑기", "커리큘럼과 상세 페이지에 쓸 대표 프레임을 골라 저장합니다.", 19),
      ]),
    ]),
  },
  {
    id: 105,
    title: "강의 판매자를 위한 SEO 실전",
    slug: "course-seo-practice",
    shortDescription: "태그, 메타 타이틀, 사이트맵, 검색 의도를 강의 등록 폼에 녹입니다.",
    description: "강의가 검색 결과에 남도록 구조화하는 방법을 다룹니다.",
    category: "비즈니스",
    level: "중급",
    languageCode: "ko",
    tags: ["SEO", "검색", "콘텐츠"],
    seoKeywords: ["강의 SEO", "메타 타이틀", "사이트맵", "콘텐츠 SEO"],
    targetAudience: "강의를 검색 결과에 노출시키고 싶은 판매자",
    requirements: "등록할 강의 주제와 키워드 후보",
    learningOutcomes: ["SEO 필드 작성", "검색 의도 매칭", "강의 상세 구조화"],
    metaTitle: "강의 판매자를 위한 SEO 실전 | 링구스트",
    metaDescription: "강의 등록 시 필요한 SEO 필드를 실전적으로 작성하는 강의입니다.",
    ogImageUrl: previewImages[4],
    canonicalUrl: null,
    enrollmentOpen: false,
    enrollmentStartAt: "2026-06-20T00:00:00.000Z",
    enrollmentEndAt: "2026-07-05T14:59:59.000Z",
    enrollmentCapacity: 35,
    enrollmentAppliedCount: 0,
    price: 89000,
    discountPrice: null,
    imageUrl: previewImages[4],
    createdAt: "2026-05-05T00:00:00.000Z",
    purchaseCount: 312,
    reviewCount: 44,
    avgRating: 4.79,
    likeCount: 121,
    instructor: { id: 9005, nickname: "검색설계자", email: "seo@seed.lingoost.local" },
    lastUpdatedAt: "2026-05-07T00:00:00.000Z",
    includedFeatures: ["SEO 필드 템플릿", "사이트맵 점검표", "검색 의도 리서치 예시", "검색 노출 QA 리스트"],
    relatedTopics: ["SEO", "Metadata", "Sitemap", "Search intent", "Course landing pages"],
    sections: buildMockSections(105, [
      modulePlan("검색 의도 리서치", [
        lessonPlan("강의 주제를 검색어로 번역하기", "판매자가 쓰는 말과 수강생이 검색하는 말의 차이를 찾습니다.", 18, ["intent-map-template.xlsx"]),
        lessonPlan("상업적 의도와 정보성 의도", "바로 신청할 사람과 정보를 찾는 사람을 나눠 페이지 문구를 설계합니다.", 20),
        lessonPlan("경쟁 페이지 SERP 읽기", "검색 결과 상위 페이지의 제목, 설명, 구조를 분석합니다.", 19),
        lessonPlan("키워드 우선순위 정하기", "검색량보다 전환 가능성과 강의 적합도를 기준으로 우선순위를 정합니다.", 18),
      ]),
      modulePlan("강의 등록 SEO 필드", [
        lessonPlan("meta title 작성 공식", "강의명, 결과, 대상, 브랜드를 자연스럽게 포함하는 제목을 만듭니다.", 18),
        lessonPlan("meta description 작성", "검색 결과에서 클릭 이유가 되는 요약 문구를 작성합니다.", 17),
        lessonPlan("seoKeywords와 tags의 역할", "검색엔진용 키워드와 사용자 탐색용 태그를 구분합니다.", 16),
        lessonPlan("canonical URL과 slug", "중복 페이지를 피하고 공유하기 좋은 URL 구조를 잡습니다.", 18),
      ]),
      modulePlan("상세 페이지 구조화", [
        lessonPlan("H1과 첫 문단의 책임", "검색엔진과 수강생이 동시에 이해하는 첫 화면 문장을 만듭니다.", 18),
        lessonPlan("학습 결과를 구조화 데이터로 연결", "배우게 되는 것, 준비물, 추천 대상을 상세 페이지 데이터로 관리합니다.", 19),
        lessonPlan("커리큘럼 텍스트 SEO", "각 섹션과 수업 제목이 검색 의도를 보강하도록 작성합니다.", 20),
        lessonPlan("FAQ와 리뷰 영역 설계", "질문과 후기 콘텐츠가 검색 노출에 도움 되도록 배치합니다.", 17),
      ]),
      modulePlan("이미지와 공유 최적화", [
        lessonPlan("OG 이미지 기준", "1200px 대표 이미지가 공유 카드에서 잘 보이는지 확인합니다.", 15),
        lessonPlan("이미지 alt와 파일 경로", "대표 이미지와 본문 이미지의 설명, 파일명, 경로를 정리합니다.", 17),
        lessonPlan("할인 문구와 이미지 텍스트", "이미지 안 문구가 검색 노출과 브랜드 신뢰를 해치지 않도록 구성합니다.", 16),
        lessonPlan("SNS 공유 미리보기 확인", "카카오, X, 페이스북 공유 카드에서 제목과 이미지가 맞는지 봅니다.", 15),
      ]),
      modulePlan("사이트맵과 인덱싱", [
        lessonPlan("sitemap.xml 라우트 구성", "활성 강의와 공개 페이지가 자동으로 사이트맵에 들어가도록 만듭니다.", 20, ["sitemap-checklist.md"]),
        lessonPlan("robots와 noindex 기준", "관리자, 결제, 비공개 페이지를 검색에서 제외하는 기준을 세웁니다.", 18),
        lessonPlan("검색엔진 발견 속도 높이기", "새 강의를 공개한 뒤 인덱싱 요청과 내부 링크를 점검합니다.", 17),
        lessonPlan("삭제와 비공개 페이지 처리", "마감되거나 숨긴 강의가 검색 결과에 남는 문제를 관리합니다.", 16),
      ]),
      modulePlan("성과 측정", [
        lessonPlan("검색 노출과 클릭 지표", "노출, 클릭, CTR, 평균 순위를 보고 어떤 문구를 바꿀지 판단합니다.", 18),
        lessonPlan("상세 페이지 전환 추적", "검색 유입이 실제 수강 신청으로 이어지는지 이벤트를 설계합니다.", 18),
        lessonPlan("태그별 성과 보기", "어떤 카테고리와 태그가 신청으로 이어지는지 운영자 화면에 반영합니다.", 16),
        lessonPlan("다음 시즌 SEO 개선", "모집이 끝난 뒤 제목, 커리큘럼, FAQ를 다음 시즌에 맞게 갱신합니다.", 17),
      ]),
      modulePlan("실전 등록 리허설", [
        lessonPlan("샘플 강의 SEO 작성", "하나의 강의를 골라 실제 등록 폼을 처음부터 끝까지 채웁니다.", 20),
        lessonPlan("검색 결과 스니펫 검수", "메타 정보와 OG 카드가 실제 HTML에 반영됐는지 확인합니다.", 16),
        lessonPlan("출시 전 SEO QA", "사이트맵, canonical, 이미지, 제목, 설명을 체크리스트로 검수합니다.", 17, ["seo-release-qa.pdf"]),
      ]),
      modulePlan("콘텐츠 개선 운영", [
        lessonPlan("검색 유입 없는 강의 진단", "노출이 없을 때 제목, 태그, 상세 설명, 내부 링크 중 어디부터 볼지 정합니다.", 20),
        lessonPlan("클릭은 있는데 신청이 없는 페이지", "검색 의도는 맞지만 상세 페이지 설득이 약한 경우를 개선합니다.", 21),
        lessonPlan("모집 종료 후 SEO 유지", "모집이 끝난 강의를 삭제하지 않고 다음 시즌 신청으로 연결하는 방법을 봅니다.", 19),
        lessonPlan("분기별 키워드 리프레시", "트렌드와 경쟁 강의가 바뀌었을 때 메타데이터를 갱신하는 루틴을 만듭니다.", 20),
      ]),
    ]),
  },
  {
    id: 106,
    title: "자동 더빙과 다국어 강의 운영",
    slug: "ai-dubbing-course-operations",
    shortDescription: "ElevenLabs 기반 더빙을 수업 단위로 승인하고 운영하는 실전 플로우.",
    description: "다국어 오디오 트랙을 운영하고 관리하는 방식을 배웁니다.",
    category: "AI",
    level: "고급",
    languageCode: "ko",
    tags: ["AI", "더빙", "글로벌"],
    seoKeywords: ["AI 더빙", "ElevenLabs", "다국어 강의"],
    targetAudience: "국내 강의를 해외로 확장하고 싶은 판매자",
    requirements: "원본 강의 영상과 대본",
    learningOutcomes: ["더빙 승인 흐름", "언어 트랙 관리", "자막과 음성의 역할 분리"],
    metaTitle: "자동 더빙과 다국어 강의 운영 | 링구스트",
    metaDescription: "ElevenLabs 기반 자동 더빙과 다국어 강의 운영 흐름을 보는 강의입니다.",
    ogImageUrl: previewImages[5],
    canonicalUrl: null,
    enrollmentOpen: true,
    enrollmentStartAt: "2026-05-18T00:00:00.000Z",
    enrollmentEndAt: "2026-06-30T14:59:59.000Z",
    enrollmentCapacity: 18,
    enrollmentAppliedCount: 6,
    price: 119000,
    discountPrice: 99000,
    imageUrl: previewImages[5],
    createdAt: "2026-05-06T00:00:00.000Z",
    purchaseCount: 284,
    reviewCount: 39,
    avgRating: 4.86,
    likeCount: 118,
    instructor: { id: 9006, nickname: "보이스빌더", email: "voice@seed.lingoost.local" },
    lastUpdatedAt: "2026-05-11T00:00:00.000Z",
    includedFeatures: ["ElevenLabs 운영 체크리스트", "다국어 QA 시트", "자막/더빙 분리 가이드", "오디오 트랙 운영표"],
    relatedTopics: ["AI dubbing", "ElevenLabs", "Captions", "Localization", "Audio QA"],
    sections: buildMockSections(106, [
      modulePlan("다국어 운영 전략", [
        lessonPlan("모든 수업을 더빙하지 않는 기준", "비용 대비 효과가 높은 수업과 원어 그대로 둘 수업을 구분합니다.", 22, ["dubbing-priority-matrix.pdf"]),
        lessonPlan("언어별 출시 우선순위", "영어, 일본어, 중국어 등 목표 시장에 따라 어떤 언어부터 열지 정합니다.", 20),
        lessonPlan("자막, 더빙, 원본 음성의 역할", "자막만 필요한 경우와 더빙까지 필요한 경우를 운영 기준으로 나눕니다.", 21),
        lessonPlan("승인형 자동화 흐름", "AI 결과물을 바로 공개하지 않고 관리자 검수 후 반영하는 구조를 잡습니다.", 20),
      ]),
      modulePlan("원본 오디오 준비", [
        lessonPlan("영상에서 음성 추출하기", "원본 mp4에서 오디오를 분리하고 후처리 가능한 포맷으로 만듭니다.", 22),
        lessonPlan("음량 정규화와 노이즈 정리", "더빙 품질을 높이기 위해 원본 음성의 노이즈와 음량을 정리합니다.", 24),
        lessonPlan("문장 단위로 스크립트 나누기", "번역과 더빙이 자연스럽게 되도록 긴 문장을 쪼갭니다.", 21),
        lessonPlan("발음이 어려운 고유명사 처리", "서비스명, 사람 이름, 기술 용어의 발음 힌트를 준비합니다.", 19),
      ]),
      modulePlan("ElevenLabs API 연결", [
        lessonPlan("API 키와 프로젝트 설정", "환경변수, 사용량 제한, 실패 시 재시도 기준을 정합니다.", 20),
        lessonPlan("음성 모델과 보이스 선택", "강의 톤에 맞는 보이스를 선택하고 언어별 차이를 확인합니다.", 23),
        lessonPlan("긴 수업을 안전하게 나누기", "API 제한과 비용을 고려해 수업 오디오를 적절히 분할합니다.", 23),
        lessonPlan("결과 파일 저장 규칙", "언어, 수업, 버전을 포함한 오디오 파일 경로를 표준화합니다.", 20),
      ]),
      modulePlan("번역과 자막", [
        lessonPlan("직역이 망치는 강의 문장", "기술 강의에서 어색한 직역을 줄이고 의미 중심으로 다듬습니다.", 20),
        lessonPlan("VTT 자막 자동 생성", "번역된 스크립트를 시간 코드가 있는 자막 파일로 변환합니다.", 22),
        lessonPlan("자막과 음성 싱크 맞추기", "더빙된 음성과 자막이 크게 어긋나지 않도록 검수합니다.", 21),
        lessonPlan("언어별 기본 자막 정책", "사용자 언어와 영상 언어에 따라 기본 표시 여부를 결정합니다.", 18),
      ]),
      modulePlan("HLS 오디오 트랙 설계", [
        lessonPlan("대체 오디오 트랙 구조", "HLS에서 언어별 오디오 트랙을 어떻게 참조하는지 살펴봅니다.", 24),
        lessonPlan("플레이어 언어 선택 UI", "수강생이 음성과 자막을 따로 선택하는 UI를 설계합니다.", 20),
        lessonPlan("마지막 선택 언어 저장", "사용자가 선택한 언어를 다음 수업에서도 유지하도록 설계합니다.", 18),
        lessonPlan("트랙 누락과 fallback 처리", "특정 언어 파일이 없을 때 원본 음성으로 안전하게 돌아가게 합니다.", 21),
      ]),
      modulePlan("품질 검수와 승인", [
        lessonPlan("AI 더빙 품질 체크리스트", "발음, 억양, 누락 문장, 어색한 감정을 검수합니다.", 20, ["voice-qa-sheet.xlsx"]),
        lessonPlan("강의자가 직접 들어야 하는 구간", "AI가 자주 틀리는 핵심 개념과 브랜드명을 우선 검수합니다.", 19),
        lessonPlan("승인, 반려, 재생성 상태", "더빙 트랙별 상태를 관리자 화면에서 관리합니다.", 21),
        lessonPlan("공개 전 최종 재생 테스트", "언어 전환, 자막 싱크, 모바일 재생을 한 번에 확인합니다.", 20),
      ]),
      modulePlan("비용과 운영 정책", [
        lessonPlan("분당 비용 계산하기", "강의 길이, 언어 수, 재생성 횟수에 따른 비용을 추정합니다.", 21),
        lessonPlan("무료 강의와 유료 강의의 더빙 기준", "모든 콘텐츠를 더빙하지 않고 매출 가능성이 있는 강의부터 처리합니다.", 18),
        lessonPlan("강의 판매자에게 보여줄 상태", "더빙 요청, 처리 중, 검수 필요, 공개 완료를 판매자에게 설명합니다.", 18),
        lessonPlan("글로벌 출시 순서 짜기", "한 번에 전 세계 공개가 아니라 시장별로 작은 출시를 계획합니다.", 19),
      ]),
      modulePlan("운영 자동화 확장", [
        lessonPlan("배치 작업으로 묶기", "여러 수업의 더빙과 자막 생성을 한 번에 예약하는 구조를 생각합니다.", 22),
        lessonPlan("실패한 작업 재시도", "API 오류, 네트워크 실패, 저장 실패를 안전하게 재시도합니다.", 20),
        lessonPlan("로그와 비용 추적", "어떤 수업에 얼마의 비용이 들었는지 운영자가 볼 수 있게 합니다.", 19),
        lessonPlan("정식 인코딩 서버로 옮기는 시점", "로컬 운영에서 서버/큐 기반 운영으로 넘어갈 기준을 세웁니다.", 20),
      ]),
    ]),
  },
  {
    id: 107,
    title: "1인 강사의 정산과 운영 장부",
    slug: "solo-instructor-ledger",
    shortDescription: "수강신청, 입금 확인, 정산 기준, 수동 승인까지 설계합니다.",
    description: "초기 마켓플레이스 운영에 필요한 장부 흐름을 만듭니다.",
    category: "비즈니스",
    level: "입문",
    languageCode: "ko",
    tags: ["정산", "입금확인", "운영"],
    seoKeywords: ["강의 정산", "수동 입금 확인", "마켓플레이스 운영"],
    targetAudience: "초기 수동 정산으로 강의 플랫폼을 운영하려는 창업자",
    requirements: "기본적인 매출/정산 개념",
    learningOutcomes: ["정산 기준 기록", "수동 입금 승인", "정산 큐 설계"],
    metaTitle: "1인 강사의 정산과 운영 장부 | 링구스트",
    metaDescription: "초기 강의 플랫폼의 입금 확인, 운영 정산, 수동 승인 흐름을 다루는 강의입니다.",
    ogImageUrl: previewImages[6],
    canonicalUrl: null,
    enrollmentOpen: true,
    enrollmentStartAt: "2026-05-01T00:00:00.000Z",
    enrollmentEndAt: "2026-05-30T14:59:59.000Z",
    enrollmentCapacity: 50,
    enrollmentAppliedCount: 11,
    price: 49000,
    discountPrice: 0,
    imageUrl: previewImages[6],
    createdAt: "2026-05-07T00:00:00.000Z",
    purchaseCount: 156,
    reviewCount: 21,
    avgRating: 4.67,
    likeCount: 77,
    instructor: { id: 9007, nickname: "운영노트", email: "ops@seed.lingoost.local" },
    lastUpdatedAt: "2026-05-06T00:00:00.000Z",
    includedFeatures: ["정산 장부 템플릿", "입금 확인 운영표", "초기 수수료 정책 예시", "운영자 체크리스트"],
    relatedTopics: ["Instructor operations", "Bank transfer", "Payouts", "Ledger", "Manual approval"],
    sections: buildMockSections(107, [
      modulePlan("초기 장부 구조", [
        lessonPlan("마켓플레이스 장부가 필요한 이유", "수강 신청, 입금 확인, 승인, 정산을 같은 흐름에서 봐야 하는 이유를 정리합니다.", 14, ["ledger-template.xlsx"]),
        lessonPlan("강의별 매출 항목", "정가, 할인 금액, 실제 입금액, 수수료율, 정산 예정액을 나눕니다.", 16),
        lessonPlan("판매자별 정산 그룹", "여러 강의 판매자의 매출을 판매자 단위로 묶어 봅니다.", 15),
        lessonPlan("초기에는 엑셀로도 버티는 기준", "자동화보다 중요한 기록 항목과 수동 확인 절차를 정합니다.", 14),
      ]),
      modulePlan("계좌입금 확인 흐름", [
        lessonPlan("수강 신청 상태 설계", "신청, 입금 대기, 확인 완료, 반려, 승인 상태를 나눕니다.", 15),
        lessonPlan("입금자명과 신청자 매칭", "입금자명이 다를 때 운영자가 확인해야 할 정보를 정리합니다.", 16),
        lessonPlan("판매자 확인과 최고관리자 확인", "수수료가 0%일 때와 1% 이상일 때 승인 주체가 달라지는 흐름을 설계합니다.", 18),
        lessonPlan("중복 신청과 부분 입금", "운영자가 실제로 자주 만나는 예외 케이스를 처리합니다.", 14),
      ]),
      modulePlan("수수료 정책", [
        lessonPlan("0% 이벤트 정책 설계", "초기에는 무료로 보이되 나중에 수수료를 켤 수 있게 데이터를 남깁니다.", 15),
        lessonPlan("1% 이상 수수료가 켜지는 순간", "판매자가 플랫폼에 입금한 뒤 최종 수강 승인되는 흐름을 정리합니다.", 17),
        lessonPlan("수수료 계산과 반올림", "원 단위 정산에서 생기는 반올림과 할인 적용 순서를 정합니다.", 14),
        lessonPlan("판매자에게 안내할 문구", "수수료, 입금 방식, 승인 지연 가능성을 명확하게 안내합니다.", 13),
      ]),
      modulePlan("정산 대기열 만들기", [
        lessonPlan("정산 대상 필터링", "승인된 수강권만 정산 대상에 들어가도록 조건을 정합니다.", 15),
        lessonPlan("판매자별 정산 카드", "판매자, 강의, 신청 수, 정산 예정액을 한눈에 보이게 만듭니다.", 16),
        lessonPlan("수동 지급 완료 처리", "운영자가 실제 송금한 뒤 지급 완료 상태를 남깁니다.", 14),
        lessonPlan("정산 보류와 메모", "분쟁, 환불, 오입금이 있을 때 정산을 잠시 멈추는 방법을 둡니다.", 15),
      ]),
      modulePlan("운영 리스크와 확장", [
        lessonPlan("환불과 취소 기록", "수동 입금 운영에서 가장 위험한 환불/취소 기록을 어떻게 남길지 정합니다.", 16),
        lessonPlan("월말 정산 리허설", "한 달 운영 후 판매자별 정산표를 만드는 순서를 연습합니다.", 15),
        lessonPlan("결제 시스템 도입 전환", "나중에 토스페이먼츠를 붙여도 기존 신청/정산 데이터가 이어지게 합니다.", 17),
        lessonPlan("운영자가 봐야 할 지표", "미입금, 승인 대기, 정산 대기, 지급 완료 지표를 대시보드로 묶습니다.", 15),
      ]),
    ]),
  },
  {
    id: 108,
    title: "초보 판매자용 첫 강의 출시",
    slug: "first-course-launch",
    shortDescription: "한 편의 공개 영상에서 첫 유료 커리큘럼까지 필요한 최소 단계를 정리합니다.",
    description: "강의를 처음 파는 사람에게 필요한 등록과 출시 체크리스트입니다.",
    category: "크리에이터",
    level: "입문",
    languageCode: "ko",
    tags: ["출시", "공개영상", "판매"],
    seoKeywords: ["첫 강의 출시", "강의 판매", "공개 강의"],
    targetAudience: "첫 유료 강의를 출시하려는 초보 판매자",
    requirements: "판매할 주제와 1개 이상의 공개 영상",
    learningOutcomes: ["출시 체크리스트", "공개 영상 구성", "판매 페이지 기본 필드"],
    metaTitle: "초보 판매자용 첫 강의 출시 | 링구스트",
    metaDescription: "첫 강의 출시를 위한 등록, 공개 영상, 판매 페이지 체크리스트 강의입니다.",
    ogImageUrl: previewImages[7],
    canonicalUrl: null,
    enrollmentOpen: true,
    enrollmentStartAt: "2026-06-01T00:00:00.000Z",
    enrollmentEndAt: "2026-06-21T14:59:59.000Z",
    enrollmentCapacity: 45,
    enrollmentAppliedCount: 0,
    price: 69000,
    discountPrice: 49000,
    imageUrl: previewImages[7],
    createdAt: "2026-05-08T00:00:00.000Z",
    purchaseCount: 221,
    reviewCount: 28,
    avgRating: 4.7,
    likeCount: 93,
    instructor: { id: 9008, nickname: "첫강의클럽", email: "launch@seed.lingoost.local" },
    lastUpdatedAt: "2026-05-13T00:00:00.000Z",
    includedFeatures: ["첫 출시 체크리스트", "소개 수업 스크립트", "상세 페이지 필드 예시", "모집 안내 메시지"],
    relatedTopics: ["Course launch", "Creator onboarding", "Preview lesson", "Sales page", "Cohort launch"],
    sections: buildMockSections(108, [
      modulePlan("첫 강의 상품 정의", [
        lessonPlan("처음 팔 결과물 하나 정하기", "처음부터 모든 지식을 담지 않고 수강생이 얻을 결과 하나로 좁힙니다.", 17, ["first-offer-canvas.pdf"]),
        lessonPlan("대상 수강생을 좁히는 법", "초보자, 실무자, 창업자 중 누구에게 맞는 강의인지 명확히 정합니다.", 16),
        lessonPlan("가격대와 분량 감각 잡기", "정가와 할인 가격을 정할 때 커리큘럼 분량과 결과물을 함께 계산합니다.", 18),
        lessonPlan("무료 콘텐츠와 유료 강의의 경계", "홍보용 공개 콘텐츠와 유료 수업에서 제공할 깊이를 구분합니다.", 17),
      ]),
      modulePlan("등록 전 준비물", [
        lessonPlan("강의 개요 문서 만들기", "제목, 한 줄 소개, 상세 설명, 추천 대상, 준비물을 하나의 문서로 정리합니다.", 16),
        lessonPlan("섹션과 수업 초안 작성", "섹션 아래 수업이 자연스럽게 묶이도록 첫 커리큘럼을 만듭니다.", 18),
        lessonPlan("촬영 전 체크리스트", "마이크, 화면, 예제 파일, 대본, 조명 등 최소 준비 항목을 점검합니다.", 16),
        lessonPlan("자료 파일 정리", "수강생이 받을 워크시트, 템플릿, 예제 파일을 수업별로 묶습니다.", 15),
      ]),
      modulePlan("판매 페이지 만들기", [
        lessonPlan("첫 화면 카피 작성", "수강생이 5초 안에 강의의 결과와 대상을 이해하도록 구성합니다.", 17),
        lessonPlan("배우게 되는 것 작성", "추상적인 장점이 아니라 수강 후 할 수 있는 행동으로 씁니다.", 16),
        lessonPlan("프리뷰 이미지 선정", "강의 주제와 가격대가 느껴지는 대표 이미지를 선택합니다.", 15),
        lessonPlan("FAQ와 환불 안내", "구매 전에 자주 묻는 질문과 운영 정책을 미리 작성합니다.", 15),
      ]),
      modulePlan("시즌 모집 설정", [
        lessonPlan("모집 기간과 정원 정하기", "처음 시즌의 신청 기간, 마감일, 정원을 무리 없는 수준으로 정합니다.", 17),
        lessonPlan("계좌입금 안내 작성", "수강생에게 보일 입금 계좌, 입금자명, 확인 시간을 명확히 안내합니다.", 16),
        lessonPlan("모집 완료 상태 만들기", "정원이 찼거나 기간이 끝났을 때 다음 시즌 안내를 보여줍니다.", 16),
        lessonPlan("신청자 리스트 확인", "판매자가 신청자와 입금 상태를 관리하는 화면을 이해합니다.", 17),
      ]),
      modulePlan("첫 수업 촬영과 편집", [
        lessonPlan("소개 수업의 역할", "강사의 스타일과 강의 난이도를 보여주는 첫 수업을 설계합니다.", 17),
        lessonPlan("실습 수업 녹화 기준", "실습 화면에서 글자 크기, 속도, 설명 순서를 맞춥니다.", 18),
        lessonPlan("수업별 길이 조절", "너무 긴 수업을 나누고 짧은 수업은 묶는 기준을 잡습니다.", 16),
        lessonPlan("업로드 전 파일 정리", "원본 영상, 썸네일, 자료 파일을 나중에 찾기 쉽게 정리합니다.", 15),
      ]),
      modulePlan("출시 후 운영", [
        lessonPlan("신청자에게 보내는 첫 메시지", "입금 안내, 승인 예상 시간, 수강 시작 방법을 담은 메시지를 만듭니다.", 16),
        lessonPlan("초기 피드백 받기", "첫 수강생에게 어떤 질문을 던져 다음 시즌을 개선할지 정합니다.", 15),
        lessonPlan("리뷰 요청 타이밍", "완강 직후 자연스럽게 리뷰를 요청하는 흐름을 만듭니다.", 14),
        lessonPlan("다음 시즌 개선 계획", "가격, 커리큘럼, 상세 페이지, 모집 문구를 어디부터 바꿀지 정합니다.", 16),
      ]),
    ]),
  },
]

export function findMockCourse(id: number) {
  const source = mockCourses.find((item) => item.id === id)
  if (!source) return null
  const course = withDerivedMockStats(source)
  const availability = getEnrollmentAvailability(course)
  return {
    ...course,
    enrollmentStatus: availability.status,
    enrollmentAvailable: availability.isAvailable,
    remainingSeats: availability.remainingSeats,
  }
}

export function getMockCoursesWithEnrollmentStatus() {
  return mockCourses.map((course) => findMockCourse(course.id)!)
}
