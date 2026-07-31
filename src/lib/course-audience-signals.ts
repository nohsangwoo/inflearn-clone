export type CourseAudienceOrganization = {
  key: string
  name: string
  mark: string
  backgroundColor: string
  foregroundColor: string
}

export type CourseAudienceSignal = {
  id: string
  organizations: CourseAudienceOrganization[]
  lead: string
  body: string
  role: string
  learnerContext: string
}

export type CourseAudienceSignalInput = {
  id?: number | null
  title: string
  category?: string | null
  tags?: readonly string[] | null
}

type AudienceTrack = {
  key: string
  organizationGroups: readonly (readonly string[])[]
  roles: readonly string[]
  outcomes: readonly string[]
  learnerContexts: readonly string[]
}

const organizations: Record<string, CourseAudienceOrganization> = {
  naver: { key: "naver", name: "네이버", mark: "N", backgroundColor: "#16a34a", foregroundColor: "#ffffff" },
  kakao: { key: "kakao", name: "카카오", mark: "K", backgroundColor: "#facc15", foregroundColor: "#1f2937" },
  toss: { key: "toss", name: "토스", mark: "T", backgroundColor: "#2563eb", foregroundColor: "#ffffff" },
  coupang: { key: "coupang", name: "쿠팡", mark: "C", backgroundColor: "#dc2626", foregroundColor: "#ffffff" },
  line: { key: "line", name: "라인", mark: "L", backgroundColor: "#16a34a", foregroundColor: "#ffffff" },
  danggeun: { key: "danggeun", name: "당근", mark: "D", backgroundColor: "#f97316", foregroundColor: "#ffffff" },
  woowa: { key: "woowa", name: "우아한형제들", mark: "W", backgroundColor: "#0f766e", foregroundColor: "#ffffff" },
  todayhouse: { key: "todayhouse", name: "오늘의집", mark: "O", backgroundColor: "#0284c7", foregroundColor: "#ffffff" },
  musinsa: { key: "musinsa", name: "무신사", mark: "M", backgroundColor: "#171717", foregroundColor: "#ffffff" },
  google: { key: "google", name: "Google", mark: "G", backgroundColor: "#2563eb", foregroundColor: "#ffffff" },
  aws: { key: "aws", name: "AWS", mark: "AWS", backgroundColor: "#f59e0b", foregroundColor: "#111827" },
  cj: { key: "cj", name: "CJ ENM", mark: "CJ", backgroundColor: "#dc2626", foregroundColor: "#ffffff" },
  hybe: { key: "hybe", name: "하이브", mark: "HY", backgroundColor: "#171717", foregroundColor: "#ffffff" },
  watcha: { key: "watcha", name: "왓챠", mark: "W", backgroundColor: "#e11d48", foregroundColor: "#ffffff" },
  kakaoent: { key: "kakaoent", name: "카카오엔터", mark: "KE", backgroundColor: "#3f3f46", foregroundColor: "#fde047" },
  afreecatv: { key: "afreecatv", name: "SOOP", mark: "S", backgroundColor: "#2563eb", foregroundColor: "#ffffff" },
  class101: { key: "class101", name: "CLASS101", mark: "C1", backgroundColor: "#ea580c", foregroundColor: "#ffffff" },
  fastcampus: { key: "fastcampus", name: "패스트캠퍼스", mark: "FC", backgroundColor: "#b91c1c", foregroundColor: "#ffffff" },
  nexon: { key: "nexon", name: "넥슨", mark: "NX", backgroundColor: "#1d4ed8", foregroundColor: "#ffffff" },
  netmarble: { key: "netmarble", name: "넷마블", mark: "NM", backgroundColor: "#be123c", foregroundColor: "#ffffff" },
  krafton: { key: "krafton", name: "크래프톤", mark: "K", backgroundColor: "#111827", foregroundColor: "#ffffff" },
  smilegate: { key: "smilegate", name: "스마일게이트", mark: "SG", backgroundColor: "#ea580c", foregroundColor: "#ffffff" },
  ncsoft: { key: "ncsoft", name: "엔씨소프트", mark: "NC", backgroundColor: "#334155", foregroundColor: "#ffffff" },
  neowiz: { key: "neowiz", name: "네오위즈", mark: "NW", backgroundColor: "#7c3aed", foregroundColor: "#ffffff" },
  pearlabyss: { key: "pearlabyss", name: "펄어비스", mark: "PA", backgroundColor: "#171717", foregroundColor: "#ffffff" },
  devsisters: { key: "devsisters", name: "데브시스터즈", mark: "DS", backgroundColor: "#dc2626", foregroundColor: "#ffffff" },
  kakaogames: { key: "kakaogames", name: "카카오게임즈", mark: "KG", backgroundColor: "#facc15", foregroundColor: "#1f2937" },
  pubgstudios: { key: "pubgstudios", name: "PUBG STUDIOS", mark: "PS", backgroundColor: "#374151", foregroundColor: "#ffffff" },
  tossbank: { key: "tossbank", name: "토스뱅크", mark: "TB", backgroundColor: "#2563eb", foregroundColor: "#ffffff" },
  kakaobank: { key: "kakaobank", name: "카카오뱅크", mark: "KB", backgroundColor: "#facc15", foregroundColor: "#1f2937" },
  kb: { key: "kb", name: "KB금융", mark: "KB", backgroundColor: "#92400e", foregroundColor: "#ffffff" },
  shinhan: { key: "shinhan", name: "신한금융", mark: "SH", backgroundColor: "#1d4ed8", foregroundColor: "#ffffff" },
  nhinvestment: { key: "nhinvestment", name: "NH투자증권", mark: "NH", backgroundColor: "#16a34a", foregroundColor: "#ffffff" },
}

const gameOrganizationGroups = [
  ["nexon", "krafton", "ncsoft"],
  ["pearlabyss", "smilegate", "netmarble"],
  ["neowiz", "devsisters", "kakaogames"],
  ["krafton", "pearlabyss", "smilegate"],
  ["nexon", "netmarble", "neowiz"],
  ["ncsoft", "krafton", "pubgstudios"],
  ["devsisters", "kakaogames", "smilegate"],
  ["pearlabyss", "nexon", "ncsoft"],
] as const

const gameCinematicOrganizationGroups = [
  ["krafton", "pearlabyss", "ncsoft"],
  ["nexon", "smilegate", "netmarble"],
  ["pearlabyss", "nexon", "ncsoft"],
  ["krafton", "pubgstudios", "smilegate"],
  ["neowiz", "devsisters", "kakaogames"],
  ["ncsoft", "pearlabyss", "krafton"],
  ["netmarble", "nexon", "smilegate"],
  ["devsisters", "neowiz", "kakaogames"],
] as const

const platformOrganizationGroups = [
  ["naver", "kakao", "toss"],
  ["coupang", "danggeun", "woowa"],
  ["line", "todayhouse", "musinsa"],
  ["naver", "line", "coupang"],
  ["kakao", "toss", "danggeun"],
  ["woowa", "todayhouse", "naver"],
  ["google", "aws", "line"],
  ["toss", "coupang", "musinsa"],
] as const

const mediaOrganizationGroups = [
  ["cj", "hybe", "kakaoent"],
  ["watcha", "naver", "afreecatv"],
  ["kakaoent", "cj", "watcha"],
  ["hybe", "naver", "kakaoent"],
  ["afreecatv", "watcha", "cj"],
  ["naver", "line", "hybe"],
  ["class101", "fastcampus", "cj"],
  ["kakaoent", "afreecatv", "naver"],
] as const

const creatorOrganizationGroups = [
  ["class101", "fastcampus", "naver"],
  ["cj", "kakaoent", "hybe"],
  ["todayhouse", "musinsa", "danggeun"],
  ["naver", "kakao", "class101"],
  ["watcha", "cj", "fastcampus"],
  ["kakaoent", "todayhouse", "naver"],
  ["coupang", "musinsa", "woowa"],
  ["hybe", "afreecatv", "class101"],
] as const

const financeOrganizationGroups = [
  ["toss", "tossbank", "kakaobank"],
  ["kb", "shinhan", "nhinvestment"],
  ["naver", "kakao", "toss"],
  ["coupang", "woowa", "danggeun"],
  ["kakaobank", "kb", "tossbank"],
  ["nhinvestment", "shinhan", "toss"],
  ["kakao", "kakaobank", "naver"],
  ["kb", "tossbank", "coupang"],
] as const

const tracks: Record<string, AudienceTrack> = {
  gameCinematic: {
    key: "game-cinematic",
    organizationGroups: gameCinematicOrganizationGroups,
    roles: ["게임 시네마틱 아티스트", "트레일러 영상 제작자", "Sequencer 아티스트", "실시간 렌더링 아티스트"],
    outcomes: ["게임 트레일러 쇼릴", "카메라 컷 중심의 시네마틱", "Unreal Sequencer 컷신", "조명과 VFX를 적용한 실시간 영상"],
    learnerContexts: ["게임 그래픽 취업준비생", "영상 제작 경력 전환자", "환경 아트 포트폴리오 준비생", "출시 영상을 직접 만들려는 인디 개발자"],
  },
  gameArt: {
    key: "game-art",
    organizationGroups: gameOrganizationGroups,
    roles: ["게임 환경 아티스트", "게임 VFX 아티스트", "테크니컬 아티스트", "실시간 3D 아티스트"],
    outcomes: ["엔진 기반 아트 포트폴리오", "제작 과정을 보여주는 breakdown", "최적화를 포함한 실시간 장면", "채용용 쇼릴 프로젝트"],
    learnerContexts: ["게임 그래픽 취업준비생", "3D 아티스트 경력 전환자", "엔진 작업을 익히는 모델러", "쇼릴을 보강하려는 주니어 아티스트"],
  },
  gameAudio: {
    key: "game-audio",
    organizationGroups: gameOrganizationGroups,
    roles: ["게임 사운드 디자이너", "테크니컬 사운드 디자이너", "게임 오디오 프로그래머", "인터랙티브 오디오 제작자"],
    outcomes: ["게임 이벤트 기반 사운드 시스템", "상황에 반응하는 믹싱 장면", "발소리와 전투 피드백 데모", "인터랙티브 오디오 포트폴리오"],
    learnerContexts: ["게임 오디오 취업준비생", "사운드 디자인 전공생", "오디오 구현을 익히는 개발자", "게임 분야로 전환하려는 음향 제작자"],
  },
  gameUi: {
    key: "game-ui",
    organizationGroups: gameOrganizationGroups,
    roles: ["게임 UI 프로그래머", "게임 UX 디자이너", "UI 테크니컬 아티스트", "클라이언트 프로그래머"],
    outcomes: ["전투 HUD와 인벤토리 프로토타입", "패드 내비게이션이 포함된 UI", "접근성을 고려한 게임 인터페이스", "상태 기반 UI 아키텍처"],
    learnerContexts: ["게임 UI 취업준비생", "UI 협업을 준비하는 클라이언트 개발자", "게임 분야로 전환하려는 UX 디자이너", "포트폴리오를 만드는 전공생"],
  },
  gameAi: {
    key: "game-ai",
    organizationGroups: gameOrganizationGroups,
    roles: ["게임 AI 프로그래머", "게임플레이 프로그래머", "전투 콘텐츠 프로그래머", "AI 툴 프로그래머"],
    outcomes: ["Behavior Tree 전투 AI", "판단 근거를 설명할 수 있는 Utility AI", "보스 패턴 디버깅 데모", "AI 의사결정 포트폴리오"],
    learnerContexts: ["게임 프로그래머 취업준비생", "AI 포트폴리오를 보강하는 개발자", "전투 콘텐츠를 만드는 인디 개발자", "게임 AI를 처음 다루는 전공생"],
  },
  gameProduction: {
    key: "game-production",
    organizationGroups: gameOrganizationGroups,
    roles: ["게임 QA 엔지니어", "빌드·릴리즈 엔지니어", "테크니컬 프로듀서", "게임 서비스 운영자"],
    outcomes: ["출시 가능한 빌드 파이프라인", "재현 가능한 QA 체크리스트", "스토어 출시 패키지", "버그 triage와 핫픽스 운영안"],
    learnerContexts: ["게임 출시를 준비하는 인디 개발자", "QA 직무 취업준비생", "팀 프로젝트를 공개하려는 전공생", "운영 역량을 넓히려는 개발자"],
  },
  gameUgc: {
    key: "game-ugc",
    organizationGroups: gameOrganizationGroups,
    roles: ["UGC 게임 크리에이터", "Lua 게임 스크립터", "주니어 게임 디자이너", "라이브 콘텐츠 제작자"],
    outcomes: ["공개 가능한 UGC 미니게임", "라운드와 보상 시스템", "상점 UI가 포함된 플레이 데모", "플레이테스트와 업데이트 계획"],
    learnerContexts: ["첫 게임을 만드는 입문자", "UGC 포트폴리오를 준비하는 학생", "Lua를 게임으로 배우는 크리에이터", "작은 게임을 출시하려는 1인 개발자"],
  },
  gameEngineering: {
    key: "game-engineering",
    organizationGroups: gameOrganizationGroups,
    roles: ["게임플레이 프로그래머", "게임 클라이언트 프로그래머", "게임 시스템 프로그래머", "게임 툴 프로그래머"],
    outcomes: ["플레이 가능한 게임 프로토타입", "설계 의도를 설명할 수 있는 시스템", "디버깅 과정을 담은 포트폴리오", "패키징된 실행 빌드"],
    learnerContexts: ["게임 프로그래머 취업준비생", "엔진을 바꾸려는 개발자", "포트폴리오를 만드는 전공생", "작은 게임을 완성하려는 인디 개발자"],
  },
  media: {
    key: "media",
    organizationGroups: mediaOrganizationGroups,
    roles: ["미디어 플랫폼 엔지니어", "콘텐츠 운영 매니저", "영상 파이프라인 개발자", "로컬라이제이션 제작자"],
    outcomes: ["검수 가능한 영상 운영 파이프라인", "자막·더빙 QA 워크플로", "재생 품질 점검 리포트", "배포 가능한 미디어 패키지"],
    learnerContexts: ["미디어 직무 취업준비생", "콘텐츠 운영으로 전환하려는 제작자", "영상 서비스를 만드는 개발자", "글로벌 콘텐츠를 준비하는 크리에이터"],
  },
  growth: {
    key: "growth",
    organizationGroups: platformOrganizationGroups,
    roles: ["SEO·콘텐츠 마케터", "그로스 매니저", "검색 서비스 기획자", "콘텐츠 전략가"],
    outcomes: ["검색 의도 기반 상세 페이지", "측정 가능한 SEO 실험안", "검색 유입과 전환 분석 리포트", "메타데이터·사이트맵 운영안"],
    learnerContexts: ["그로스 직무 취업준비생", "인하우스 마케터로 전환하려는 제작자", "검색 유입을 키우려는 운영자", "콘텐츠 성과를 설명하려는 기획자"],
  },
  financeOperations: {
    key: "finance-operations",
    organizationGroups: financeOrganizationGroups,
    roles: ["핀테크 서비스 운영자", "정산 운영 매니저", "디지털 금융 프로덕트 매니저", "플랫폼 백오피스 기획자"],
    outcomes: ["승인 상태가 명확한 운영 장부", "정산 검수 체크리스트", "입금 확인과 권한 부여 흐름", "감사 가능한 운영 기록"],
    learnerContexts: ["핀테크 직무 취업준비생", "운영 시스템을 만드는 기획자", "정산 업무를 체계화하려는 창업자", "백오피스 설계를 배우는 개발자"],
  },
  creator: {
    key: "creator",
    organizationGroups: creatorOrganizationGroups,
    roles: ["교육 콘텐츠 기획자", "온라인 강의 프로듀서", "크리에이터 비즈니스 운영자", "콘텐츠 마케팅 매니저"],
    outcomes: ["판매 가능한 강의 기획안", "완주율을 고려한 커리큘럼", "모집부터 운영까지의 출시 패키지", "검수 가능한 콘텐츠 제작 워크플로"],
    learnerContexts: ["첫 강의를 준비하는 전문가", "교육 콘텐츠 직무 취업준비생", "지식을 상품화하려는 크리에이터", "작은 교육 브랜드를 운영하는 창업자"],
  },
  platform: {
    key: "platform",
    organizationGroups: platformOrganizationGroups,
    roles: ["플랫폼 프론트엔드 개발자", "백엔드·플랫폼 개발자", "프로덕트 엔지니어", "서비스 기획자"],
    outcomes: ["사용자 흐름이 연결된 웹 서비스", "권한과 상태가 명확한 운영 기능", "배포 가능한 풀스택 프로젝트", "데이터 모델과 UI가 연결된 포트폴리오"],
    learnerContexts: ["플랫폼 개발 취업준비생", "풀스택으로 확장하려는 프론트엔드 개발자", "서비스를 직접 만드는 1인 창업자", "개발 협업을 준비하는 기획자"],
  },
}

const signalBodyTemplates = [
  (role: string, outcome: string) => `관련 ${role} 직무를 목표로 ${outcome} 결과물을 준비하는 분에게 추천해요.`,
  (role: string, _outcome: string, learner: string) => `관심 조직을 구체화하면서 ${role} 커리어를 준비하는 과정으로 ${learner}에게 잘 맞아요.`,
  (role: string, outcome: string) => `분야의 ${role} 포트폴리오에 담을 ${outcome} 프로젝트를 완성하고 싶은 분에게 적합해요.`,
  (role: string, _outcome: string, learner: string) => `분야에서 다루는 ${role} 업무 흐름을 미리 연습하는 과정으로 ${learner}에게 추천해요.`,
  (_role: string, outcome: string) => `채용 준비 과정에서 ${outcome} 작업을 직접 설명할 수 있게 만들고 싶은 분에게 잘 맞아요.`,
  (role: string, _outcome: string, learner: string) => `조직의 ${role} 역할을 진로로 탐색하는 과정으로 ${learner}에게 적합해요.`,
  (_role: string, outcome: string) => `관련 팀과 협업할 때 필요한 ${outcome} 제작 과정을 익히고 싶은 분에게 추천해요.`,
  (role: string, outcome: string) => `분야 진로를 구체화하며 ${role} 역량과 ${outcome} 결과물을 함께 준비하고 싶은 분에게 잘 맞아요.`,
] as const

function stableHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

function getTrack(topic: string): AudienceTrack {
  if (/시네마틱|cinematic|sequencer|트레일러|trailer/.test(topic)) return tracks.gameCinematic
  if (/niagara|vfx|이펙트|환경\s?아트|environment\s?art|blender|3d\s?아트/.test(topic)) return tracks.gameArt
  if (/게임\s?오디오|game\s?audio|사운드|sound/.test(topic)) return tracks.gameAudio
  if (/게임\s?ui|game\s?ui|hud|인벤토리|게임\s?ux/.test(topic)) return tracks.gameUi
  if (/behavior\s?tree|utility\s?ai|게임\s?ai|game\s?ai/.test(topic)) return tracks.gameAi
  if (/steam|게임\s?출시|game\s?release|qa|빌드\s?파이프라인|핫픽스/.test(topic)) return tracks.gameProduction
  if (/roblox|ugc|lua\s?게임/.test(topic)) return tracks.gameUgc
  if (/게임|unreal|unity|godot|gameplay|multiplayer|replication|netcode|ability\s?system|procedural\s?dungeon/.test(topic)) {
    return tracks.gameEngineering
  }
  if (/seo|검색\s?의도|search\s?console|analytics|growth|그로스/.test(topic)) return tracks.growth
  if (/정산|운영\s?장부|핀테크|finance|bank|입금\s?확인/.test(topic)) return tracks.financeOperations
  if (/hls|ffmpeg|더빙|dubbing|자막|caption|영상\s?운영|video\s?operations|강의\s?편집/.test(topic)) {
    return tracks.media
  }
  if (/next\.?js|react|typescript|drizzle|웹\s?개발|플랫폼|marketplace/.test(topic)) return tracks.platform
  if (/강의\s?기획|강의\s?출시|course\s?creator|크리에이터|교육\s?콘텐츠|강의\s?판매/.test(topic)) {
    return tracks.creator
  }
  return tracks.platform
}

export function getCourseAudienceSignals(input: CourseAudienceSignalInput): CourseAudienceSignal[] {
  const topic = [input.title, input.category ?? "", ...(input.tags ?? [])].join(" ").toLowerCase()
  const track = getTrack(topic)
  const seed = typeof input.id === "number" && Number.isFinite(input.id)
    ? Math.abs(input.id)
    : stableHash(topic)

  return signalBodyTemplates.map((buildBody, index) => {
    const group = track.organizationGroups[index % track.organizationGroups.length]
    const role = track.roles[(index + seed) % track.roles.length]
    const outcome = track.outcomes[(index * 3 + seed) % track.outcomes.length]
    const learnerContext = track.learnerContexts[(index * 5 + seed) % track.learnerContexts.length]
    const signalOrganizations = group
      .map((key) => organizations[key])
      .filter((organization): organization is CourseAudienceOrganization => Boolean(organization))

    return {
      id: `${track.key}-${seed}-${index + 1}`,
      organizations: signalOrganizations,
      lead: signalOrganizations.map((organization) => organization.name).join("·"),
      body: buildBody(role, outcome, learnerContext),
      role,
      learnerContext,
    }
  })
}
