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
    metaTitle: "Next.js로 강의 거래소 만들기 | 박살강의",
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
    instructor: { id: 9001, nickname: "박살랩", email: "studio@baksalclass.com" },
    lastUpdatedAt: "2026-05-12T00:00:00.000Z",
    includedFeatures: ["8.5시간 주문형 영상", "실습용 Drizzle 스키마", "SEO 체크리스트", "자막과 모바일 수강"],
    relatedTopics: ["Next.js", "Marketplace", "Drizzle ORM", "SEO", "Bank transfer approval"],
    sections: [
      { id: 10101, moduleTitle: "Foundation", title: "Marketplace roles and domain model", description: "수강생, 판매자, 최고 관리자 권한과 강의 거래의 핵심 테이블을 나눕니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 720, isFreePreview: true, previewVideoUrl: "/hls-demo/baksal-sample/master.m3u8", resources: ["domain-model.pdf"] },
      { id: 10102, moduleTitle: "Foundation", title: "Course listing and enrollment windows", description: "시즌 모집, 정원, 신청 가능 상태를 목록 카드에 안정적으로 노출합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 960, isFreePreview: false, resources: ["listing-wireframe.fig"] },
      { id: 10103, moduleTitle: "SEO", title: "SEO fields that actually index", description: "meta title, description, canonical, OG 이미지, sitemap까지 검색 노출 필드를 설계합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 840, isFreePreview: false },
      { id: 10104, moduleTitle: "Enrollment Ops", title: "Bank-transfer enrollment queue", description: "수강 신청 후 판매자가 입금을 확인하고 Purchase 권한을 만드는 흐름을 구현합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 1180, isFreePreview: false, resources: ["enrollment-state-machine.md"] },
      { id: 10105, moduleTitle: "Enrollment Ops", title: "Seller studio approval UX", description: "판매자가 신청자 리스트, 계좌 정보, 입금 확인 버튼을 한 화면에서 처리하도록 구성합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 1020, isFreePreview: false },
      { id: 10106, moduleTitle: "Launch", title: "Production checklist for the first cohort", description: "운영 전 확인해야 할 SEO, 수강 권한, 샘플 영상, 정산 항목을 체크리스트화합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 780, isFreePreview: false },
    ],
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
    metaTitle: "HLS 스트리밍과 영상 운영 | 박살강의",
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
    instructor: { id: 9002, nickname: "스트림마스터", email: "stream@baksalclass.com" },
    lastUpdatedAt: "2026-05-10T00:00:00.000Z",
    includedFeatures: ["7시간 주문형 영상", "HLS 인코딩 스크립트", "자막/VTT 템플릿", "로컬 승인 운영 가이드"],
    relatedTopics: ["HLS", "FFmpeg", "VTT captions", "Dubbing", "Video QA"],
    sections: [
      { id: 10201, moduleTitle: "Streaming Basics", title: "Why HLS still wins for course video", description: "브라우저 호환성, 적응형 스트리밍, CDN 캐싱 관점에서 HLS를 선택하는 이유를 정리합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 680, isFreePreview: true, previewVideoUrl: "/hls-demo/baksal-sample/master.m3u8", resources: ["hls-decision-guide.pdf"] },
      { id: 10202, moduleTitle: "Encoding Pipeline", title: "FFmpeg ladder and segment strategy", description: "강의 영상에 맞는 해상도 ladder, segment length, audio profile을 설계합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 1120, isFreePreview: false },
      { id: 10203, moduleTitle: "Encoding Pipeline", title: "Local approval encoding workflow", description: "관리자가 승인하는 시점에 로컬 프로젝트에서 안전하게 인코딩을 실행하는 구조를 만듭니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 1040, isFreePreview: false, resources: ["local-encoding-runbook.md"] },
      { id: 10204, moduleTitle: "Captions", title: "Caption tracks without forcing subtitles", description: "영상에 자막이 박힌 경우와 별도 VTT 자막을 같이 운영하는 UX 원칙을 다룹니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 760, isFreePreview: false },
      { id: 10205, moduleTitle: "QA", title: "Playback QA across desktop and mobile", description: "HLS 오류, CORS, 오디오 트랙, 모바일 자동재생 제한을 빠르게 점검합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 900, isFreePreview: false },
    ],
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
    metaTitle: "AI 시대 판매되는 강의 기획법 | 박살강의",
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
    instructor: { id: 9003, nickname: "콘텐츠빌더", email: "creator@baksalclass.com" },
    lastUpdatedAt: "2026-05-09T00:00:00.000Z",
    includedFeatures: ["5.5시간 주문형 영상", "강의 기획 워크시트", "상세페이지 카피 예시", "커리큘럼 리뷰 체크리스트"],
    relatedTopics: ["Course planning", "Creator business", "AI workflow", "Landing copy", "Curriculum design"],
    sections: [
      { id: 10301, moduleTitle: "Market Fit", title: "Pick a topic people already search for", description: "전문성, 수요, 검색 의도를 동시에 만족하는 강의 주제를 고릅니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 620, isFreePreview: true, previewVideoUrl: "/hls-demo/baksal-sample/master.m3u8", resources: ["topic-scorecard.pdf"] },
      { id: 10302, moduleTitle: "Market Fit", title: "Define the buyer promise", description: "수강생이 돈을 내고 얻는 결과를 한 문장으로 압축합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 740, isFreePreview: false },
      { id: 10303, moduleTitle: "Curriculum", title: "Turn lessons into a product ladder", description: "개별 수업 목록을 구매 이유가 되는 순서와 난이도로 재배열합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 910, isFreePreview: false, resources: ["curriculum-ladder.xlsx"] },
      { id: 10304, moduleTitle: "Curriculum", title: "Design free previews that convert", description: "무료공개 영상에서 어디까지 보여주고 어디부터 유료로 잠글지 결정합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 690, isFreePreview: false },
      { id: 10305, moduleTitle: "Sales Page", title: "Write above-the-fold copy", description: "첫 화면에서 신뢰, 결과, 대상, 차별점을 빠르게 전달하는 카피 구조를 만듭니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 860, isFreePreview: false },
      { id: 10306, moduleTitle: "Sales Page", title: "Proof, objections and FAQ", description: "리뷰가 부족한 초기 강의도 믿을 수 있게 만드는 증거와 질문 구조를 정리합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 780, isFreePreview: false },
    ],
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
    metaTitle: "수강생이 끝까지 보는 강의 편집 | 박살강의",
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
    instructor: { id: 9004, nickname: "컷앤런", email: "edit@baksalclass.com" },
    lastUpdatedAt: "2026-05-08T00:00:00.000Z",
    includedFeatures: ["4.8시간 주문형 영상", "편집 리듬 체크리스트", "썸네일 템플릿", "챕터 구성 예시"],
    relatedTopics: ["Video editing", "Retention", "Thumbnails", "Chapter design"],
    sections: [
      { id: 10401, moduleTitle: "Retention", title: "Find the boring parts before students do", description: "시청 이탈이 생기는 지점을 편집 전 단계에서 찾아냅니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 640, isFreePreview: true, previewVideoUrl: "/hls-demo/baksal-sample/master.m3u8", resources: ["retention-audit.pdf"] },
      { id: 10402, moduleTitle: "Retention", title: "Cut rhythm for explanation videos", description: "정보 전달 강의에서 컷 전환, 침묵, 확대 화면을 언제 쓰는지 배웁니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 860, isFreePreview: false },
      { id: 10403, moduleTitle: "Structure", title: "Chapter labels students can scan", description: "긴 강의를 돌아보기 쉬운 챕터로 나누고 제목을 붙입니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 720, isFreePreview: false },
      { id: 10404, moduleTitle: "Packaging", title: "Thumbnail frames and preview stills", description: "상세 페이지에서 신뢰를 만드는 대표 이미지와 프리뷰 프레임을 고릅니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 780, isFreePreview: false },
      { id: 10405, moduleTitle: "Publishing", title: "Export settings for HLS ingestion", description: "후속 HLS 변환이 안정적으로 되도록 원본 영상 export 설정을 정리합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 620, isFreePreview: false },
    ],
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
    metaTitle: "강의 판매자를 위한 SEO 실전 | 박살강의",
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
    instructor: { id: 9005, nickname: "검색설계자", email: "seo@baksalclass.com" },
    lastUpdatedAt: "2026-05-07T00:00:00.000Z",
    includedFeatures: ["6시간 주문형 영상", "SEO 필드 템플릿", "사이트맵 점검표", "검색 의도 리서치 예시"],
    relatedTopics: ["SEO", "Metadata", "Sitemap", "Search intent", "Course landing pages"],
    sections: [
      { id: 10501, moduleTitle: "Search Intent", title: "Map search intent to course promises", description: "검색어 뒤의 목적을 읽고 강의 제목, 요약, 커리큘럼에 반영합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 760, isFreePreview: true, previewVideoUrl: "/hls-demo/baksal-sample/master.m3u8", resources: ["intent-map-template.xlsx"] },
      { id: 10502, moduleTitle: "Metadata", title: "Title, description and keyword fields", description: "강의 등록 폼에서 검색에 필요한 메타 필드를 빠짐없이 채웁니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 840, isFreePreview: false },
      { id: 10503, moduleTitle: "Metadata", title: "OG images and canonical URLs", description: "공유 이미지, canonical URL, 중복 콘텐츠 리스크를 운영 관점에서 정리합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 680, isFreePreview: false },
      { id: 10504, moduleTitle: "Indexing", title: "Sitemap and robots for course pages", description: "새 강의가 검색 엔진에 빠르게 발견되도록 sitemap과 robots 정책을 확인합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 880, isFreePreview: false, resources: ["sitemap-checklist.md"] },
      { id: 10505, moduleTitle: "Growth", title: "Measure what actually ranks", description: "검색 노출, 클릭, 수강 신청 전환까지 추적할 지표를 정합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 700, isFreePreview: false },
    ],
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
    metaTitle: "자동 더빙과 다국어 강의 운영 | 박살강의",
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
    instructor: { id: 9006, nickname: "보이스빌더", email: "voice@baksalclass.com" },
    lastUpdatedAt: "2026-05-11T00:00:00.000Z",
    includedFeatures: ["6.7시간 주문형 영상", "ElevenLabs 운영 체크리스트", "다국어 QA 시트", "자막/더빙 분리 가이드"],
    relatedTopics: ["AI dubbing", "ElevenLabs", "Captions", "Localization", "Audio QA"],
    sections: [
      { id: 10601, moduleTitle: "Localization Strategy", title: "Decide which lessons deserve dubbing", description: "모든 영상을 자동 더빙하지 않고 비용 대비 효과가 높은 수업을 고릅니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 720, isFreePreview: true, previewVideoUrl: "/hls-demo/baksal-sample/master.m3u8", resources: ["dubbing-priority-matrix.pdf"] },
      { id: 10602, moduleTitle: "Voice Pipeline", title: "Extract, normalize and prepare source audio", description: "원본 영상에서 음성을 추출하고 더빙 전처리에 맞게 정규화합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 880, isFreePreview: false },
      { id: 10603, moduleTitle: "Voice Pipeline", title: "Generate multilingual voice tracks", description: "ElevenLabs API 기반으로 언어별 음성 트랙을 생성하고 실패 케이스를 처리합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 980, isFreePreview: false },
      { id: 10604, moduleTitle: "Player UX", title: "Separate captions from burned-in subtitles", description: "영상에 박힌 자막과 선택 가능한 자막 트랙이 충돌하지 않도록 UX를 설계합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 760, isFreePreview: false },
      { id: 10605, moduleTitle: "Player UX", title: "Language switching in HLS playback", description: "오디오 트랙 전환, 기본 언어 선택, 마지막 선택 저장을 구현합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 860, isFreePreview: false },
      { id: 10606, moduleTitle: "QA", title: "Human review before publishing", description: "자동 더빙을 그대로 공개하지 않고 관리자 승인 전에 들어야 할 품질 포인트를 정리합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 700, isFreePreview: false },
    ],
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
    metaTitle: "1인 강사의 정산과 운영 장부 | 박살강의",
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
    instructor: { id: 9007, nickname: "운영노트", email: "ops@baksalclass.com" },
    lastUpdatedAt: "2026-05-06T00:00:00.000Z",
    includedFeatures: ["3.5시간 주문형 영상", "정산 장부 템플릿", "입금 확인 운영표", "초기 수수료 정책 예시"],
    relatedTopics: ["Instructor operations", "Bank transfer", "Payouts", "Ledger", "Manual approval"],
    sections: [
      { id: 10701, moduleTitle: "Ledger Basics", title: "What an early marketplace ledger needs", description: "수강 신청, 입금 확인, 승인, 정산 예정액을 한 장부에서 추적합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 580, isFreePreview: true, previewVideoUrl: "/hls-demo/baksal-sample/master.m3u8", resources: ["ledger-template.xlsx"] },
      { id: 10702, moduleTitle: "Enrollment Money Flow", title: "Bank-transfer confirmation workflow", description: "판매자가 입금을 확인하고 수강 권한을 열어주는 운영 절차를 정합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 760, isFreePreview: false },
      { id: 10703, moduleTitle: "Enrollment Money Flow", title: "Handle rejection, cancellation and duplicate requests", description: "입금 오류, 중복 신청, 반려 케이스를 데이터 상태로 정리합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 680, isFreePreview: false },
      { id: 10704, moduleTitle: "Payouts", title: "Build a payout review queue", description: "수동 정산 전 운영자가 확인해야 할 판매자별 금액과 상태를 구성합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 740, isFreePreview: false },
      { id: 10705, moduleTitle: "Payouts", title: "Scale from 0% fee to paid operations", description: "초기 무료 이벤트에서 유료 수수료 정책으로 넘어갈 때 남겨야 할 기록을 설계합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 640, isFreePreview: false },
    ],
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
    metaTitle: "초보 판매자용 첫 강의 출시 | 박살강의",
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
    instructor: { id: 9008, nickname: "첫강의클럽", email: "launch@baksalclass.com" },
    lastUpdatedAt: "2026-05-13T00:00:00.000Z",
    includedFeatures: ["4.2시간 주문형 영상", "첫 출시 체크리스트", "무료 공개 수업 스크립트", "상세 페이지 필드 예시"],
    relatedTopics: ["Course launch", "Creator onboarding", "Preview lesson", "Sales page", "Cohort launch"],
    sections: [
      { id: 10801, moduleTitle: "First Offer", title: "Package your first paid outcome", description: "처음 파는 강의가 너무 넓어지지 않도록 하나의 결과물로 좁힙니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 620, isFreePreview: true, previewVideoUrl: "/hls-demo/baksal-sample/master.m3u8", resources: ["first-offer-canvas.pdf"] },
      { id: 10802, moduleTitle: "First Offer", title: "Record one free public lesson", description: "수강생이 강사의 설명 방식과 수준을 확인할 수 있는 무료공개 수업을 만듭니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 760, isFreePreview: false },
      { id: 10803, moduleTitle: "Course Page", title: "Fill every field that builds trust", description: "제목, 요약, 추천 대상, 준비물, 학습 결과를 빈칸 없이 채웁니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 740, isFreePreview: false },
      { id: 10804, moduleTitle: "Course Page", title: "Choose a preview image that sells the promise", description: "강의 주제를 즉시 이해시키는 대표 이미지를 기획하고 업로드합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 580, isFreePreview: false },
      { id: 10805, moduleTitle: "Launch", title: "Open the cohort and watch applications", description: "모집 기간, 정원, 입금 안내, 신청자 리스트를 운영 흐름으로 연결합니다.", active: true, hasVideo: true, hlsStatus: "READY", durationSeconds: 820, isFreePreview: false },
    ],
  },
]

export function findMockCourse(id: number) {
  const course = mockCourses.find((item) => item.id === id)
  if (!course) return null
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
