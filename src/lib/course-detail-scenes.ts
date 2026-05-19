export type CourseDetailSceneImage = {
  title: string
  imageUrl: string
  alt: string
  caption: string
}

export type CourseDetailScene = {
  title: string
  imageUrl?: string
  alt?: string
  caption?: string
  images?: CourseDetailSceneImage[]
}

const courseDetailScenes: Record<number, CourseDetailScene> = {
  101: {
    title: "Next.js 강의 거래소 구현 화면",
    imageUrl: "/course-detail-scenes/course-101-workshop.png",
    alt: "Next.js course marketplace build screen with code editor, database schema, and course preview panels",
    caption: "Next.js, Drizzle, 강의 카드, 수강 신청 상태를 한 화면에서 연결하며 실제 강의 거래소의 핵심 흐름을 구현합니다.",
  },
  102: {
    title: "HLS 인코딩과 재생 검수 화면",
    imageUrl: "/course-detail-scenes/course-102-workshop.png",
    alt: "HLS video operations screen with media player, encoding terminal, bitrate ladder, and caption panels",
    caption: "원본 영상을 HLS ladder, 자막 트랙, 플레이어 검수 화면으로 나눠 강의 서비스에 맞는 영상 운영 흐름을 익힙니다.",
  },
  103: {
    title: "AI 기반 강의 기획 워크숍 화면",
    imageUrl: "/course-detail-scenes/course-103-workshop.png",
    alt: "AI course planning screen with curriculum cards, search intent map, and landing copy outline",
    caption: "AI 초안, 검색 의도, 커리큘럼 카드, 판매 페이지 카피를 함께 비교하며 팔리는 강의 구조를 설계합니다.",
  },
  104: {
    title: "완주율을 높이는 강의 편집 화면",
    imageUrl: "/course-detail-scenes/course-104-workshop.png",
    alt: "Course editing screen with timeline, audio waveform, thumbnail selector, and chapter markers",
    caption: "편집 타임라인, 오디오 보정, 챕터 마커, 썸네일 후보를 보며 수강생이 끝까지 보는 리듬을 만듭니다.",
  },
  105: {
    title: "강의 상세 SEO 최적화 화면",
    images: [
      {
        title: "Google Search Console 성과 확인",
        imageUrl: "/course-detail-scenes/course-105-search-console.png",
        alt: "Google Search Console screenshot for a Lingoost course detail page showing search performance, impressions, clicks, sitemap status, and indexed pages",
        caption: "Search Console에서 강의 상세 페이지의 검색 노출, 클릭, CTR, 평균 순위, 사이트맵 제출과 색인 상태를 확인합니다.",
      },
      {
        title: "Google Tag Manager 이벤트 태그 점검",
        imageUrl: "/course-detail-scenes/course-105-tag-manager.png",
        alt: "Google Tag Manager screenshot showing GA4 config and course detail tracking tags for course view, preview image view, and enrollment click",
        caption: "Tag Manager에서 강의 상세 조회, 프리뷰 이미지 확인, 수강 신청 클릭 같은 이벤트 태그가 올바른 트리거에 연결됐는지 점검합니다.",
      },
      {
        title: "Google Analytics 유입과 전환 분석",
        imageUrl: "/course-detail-scenes/course-105-analytics.png",
        alt: "Google Analytics 4 screenshot showing course detail acquisition, organic search traffic, enrollment clicks, and key events",
        caption: "GA4에서 자연 검색 유입, 강의 상세 조회, 수강 신청 클릭, 스크롤 깊이 같은 핵심 이벤트를 비교해 SEO 성과를 판단합니다.",
      },
    ],
  },
  106: {
    title: "AI 더빙과 다국어 QA 화면",
    imageUrl: "/course-detail-scenes/course-106-workshop.png",
    alt: "AI dubbing operations screen with audio tracks, caption timing, video preview, and language QA panels",
    caption: "언어별 음성 트랙, 자막 싱크, 영상 미리보기, QA 상태를 확인하며 자동 더빙 결과물을 승인 가능한 품질로 다듬습니다.",
  },
  107: {
    title: "입금 확인과 정산 장부 운영 화면",
    imageUrl: "/course-detail-scenes/course-107-workshop.png",
    alt: "Instructor ledger operations screen with bank transfer approval queue, payout ledger, and confirmation modal",
    caption: "수강 신청, 계좌입금 확인, 판매자 정산 예정액을 한 곳에서 대조하며 초기 수동 운영 장부를 완성합니다.",
  },
  108: {
    title: "첫 강의 출시 준비 화면",
    imageUrl: "/course-detail-scenes/course-108-workshop.png",
    alt: "First course launch screen with course registration form, preview lesson upload, and cohort calendar",
    caption: "강의 등록 폼, 공개 수업 준비, 모집 일정, 출시 체크리스트를 채우며 첫 유료 강의의 공개 흐름을 연습합니다.",
  },
  201: {
    title: "액션 RPG 프로토타입 제작 화면",
    imageUrl: "/course-detail-scenes/course-201-workshop.png",
    alt: "Unreal Engine style action RPG prototype editor with gameplay code, blueprint panels, and combat arena viewport",
    caption: "캐릭터 입력, 블루프린트 이벤트, C++ Gameplay 클래스를 연결해 액션 RPG 전투 프로토타입을 만듭니다.",
  },
  202: {
    title: "Unity 모바일 액션 게임 제작 화면",
    imageUrl: "/course-detail-scenes/course-202-workshop.png",
    alt: "Unity style mobile action game editor with arena viewport, C sharp script panel, inspector, and phone preview",
    caption: "모바일 터치 조작, C# 전투 스크립트, 기기 미리보기, 빌드 설정을 함께 다루며 액션 게임을 완성합니다.",
  },
  203: {
    title: "Godot 픽셀 RPG 제작 화면",
    imageUrl: "/course-detail-scenes/course-203-workshop.png",
    alt: "Godot style pixel RPG editor with tilemap, GDScript panel, dialogue preview, and turn based battle scene",
    caption: "타일맵, GDScript, NPC 대화, 턴제 전투 씬을 조합해 작은 픽셀 RPG 프로젝트를 완성합니다.",
  },
  204: {
    title: "Blender에서 Unreal로 환경 아트 가져오기",
    imageUrl: "/course-detail-scenes/course-204-workshop.png",
    alt: "Blender to Unreal environment art workflow with modular ruins modeling and imported lit game engine scene",
    caption: "Blender에서 모듈러 에셋을 편집하고 Unreal Engine에서 머티리얼, 라이팅, 레벨 배치를 이어 완성합니다.",
  },
  205: {
    title: "Niagara VFX 쇼케이스 제작 화면",
    imageUrl: "/course-detail-scenes/course-205-workshop.png",
    alt: "Niagara style game VFX editor with portal particles, parameter curves, graph modules, and effect preview",
    caption: "포털, 타격 스파크, 파티클 파라미터를 조합해 게임 스킬 이펙트와 쇼릴용 VFX 장면을 만듭니다.",
  },
}

export function getCourseDetailScene(id?: number | null) {
  if (!id) return null
  return courseDetailScenes[id] ?? null
}
