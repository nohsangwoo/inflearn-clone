# 박살강의 웹 리빌드 플랜

## 1. 제품 정의

박살강의는 강의 판매자와 수강생을 직접 연결하는 강의 교환 플랫폼이다. 첫 버전부터 단순 MVP가 아니라, 유료 콘텐츠 판매, HLS 기반 영상 수강, 검색 노출, 판매자 운영, 수동 정산, 최고 관리자 통제를 모두 전제로 둔다.

### 핵심 사용자

- 수강생: 검증된 강의를 찾고 결제한 뒤, 웹과 앱에서 끊김 없이 학습한다.
- 강의 판매자: 강의를 등록하고, 커리큘럼과 영상, 썸네일, 태그, SEO 정보를 직접 관리한다.
- 최고 관리자: 모든 강의, 유저, 결제, 정산, 푸시, 콘텐츠 상태를 통제한다.

### 브랜드 방향

- 네이밍: 박살강의
- 톤: 코세라처럼 정돈되어 있지만 더 공격적으로 명확한 학습 결과를 보여주는 전문 교육 플랫폼
- UI 성격: 트렌디한 학습 마켓, 고밀도 운영 대시보드, 영상 중심의 몰입형 수강 화면
- 금지: 랜딩 페이지만 화려한 구조, 카드 과잉, 앱 중심 WebView 흔적이 첫 인상에 드러나는 구조

## 2. 정보 구조

### 공개 웹

- `/[locale]`: 강의 탐색, 추천, 검색, 카테고리, 판매자 진입
- `/[locale]/course/[id]`: 강의 상세, SEO 메타, 커리큘럼, 리뷰, 결제 CTA
- `/[locale]/course/lecture`: 결제 후 수강 플레이어
- `/[locale]/login`: Supabase 기반 로그인
- `/sitemap.xml`, `/robots.txt`: 공개 강의 중심 SEO

### 수강생 대시보드

- `/[locale]/me`: 학습 현황, 이어보기, 최근 수강
- `/[locale]/me/courses`: 구매한 강의와 진도
- `/[locale]/me/likes`: 관심 강의
- `/[locale]/me/profile`: 계정 정보

### 판매자 대시보드

- `/[locale]/admin`: 매출, 수강생, 강의 품질, 더빙/HLS 처리 상태
- `/[locale]/admin/courses`: 판매자 강의 목록
- `/[locale]/admin/courses/[lectureId]`: 강의 기본 정보, 가격, SEO, 태그, 커리큘럼, 영상, 자막, 더빙 언어
- `/[locale]/admin/earnings`: 수동 정산 예정 금액과 지급 이력
- `/[locale]/admin/reviews`, `/[locale]/admin/questions`: 수강생 피드백 관리

### 최고 관리자

- `/[locale]/master`: 전체 플랫폼 지표
- `/[locale]/master/payouts`: 판매자 수동 정산 큐
- `/[locale]/master/fcm`: 푸시 발송
- 추후 확장: 유저 제재, 콘텐츠 심사, 결제 취소/환불, SEO 인덱싱 모니터

## 3. 데이터 모델 확장

### ORM / 마이그레이션 원칙

- Prisma는 제거하고 Drizzle ORM + `drizzle-kit`으로 스키마와 마이그레이션을 관리한다.
- 서비스 개시 전 단계이므로 기존 Prisma migration history는 유지하지 않고 Drizzle baseline을 기준으로 새 DB를 구성한다.
- 웹은 Next.js 빌드 안정성을 위해 Drizzle/Postgres 클라이언트를 lazy singleton으로 초기화한다.
- 배포 DB는 Vercel + Neon 또는 기존 Supabase Postgres 중 실제 운영 연결성이 좋은 쪽을 쓰되, 앱 코드는 표준 Postgres 연결 문자열(`DATABASE_URL`, 필요 시 `DIRECT_URL`)만 요구하도록 둔다.

### Lecture

- slug: 사람이 읽는 URL과 검색 노출에 활용
- category, level, language: 검색/필터 기본 축
- tags, seoKeywords: 강의 등록 시 입력하는 탐색/SEO 키워드
- shortDescription, targetAudience, learningOutcomes, requirements: 상세 페이지 구조화 정보
- metaTitle, metaDescription, ogImageUrl, canonicalUrl: SEO 직접 제어

### Video

- hlsStatus, hlsError: HLS 패키징 상태
- CaptionTrack: VTT/SRT 자막 트랙 직접 등록
- DubTrack: ElevenLabs 더빙 트랙 상태 유지

### Payout

- sellerId, status, grossAmount, platformFee, payoutAmount
- periodStart, periodEnd, paidAt, memo
- 최고 관리자가 수동 정산할 수 있도록 대시보드에서 제어

## 4. 결제 플로우

Toss Payments V2 원칙을 따른다.

1. 클라이언트는 결제 인증만 시작한다.
2. 서버가 주문 금액을 DB에 저장한다.
3. 성공 리다이렉트 후 서버가 Toss confirm API를 호출한다.
4. 서버는 DB에 저장된 주문 금액과 전달 금액을 비교한다.
5. 승인 완료 후 Purchase를 생성한다.
6. 웹훅은 보조 검증과 상태 동기화에 사용한다.

### 초기 수강신청 / 계좌입금 운영

- Toss 결제 코드는 유지하되, 초기 운영의 기본 CTA는 `수강 신청`이다.
- `EnrollmentRequest`가 신청, 금액, 플랫폼 수수료율, 수수료 금액, 판매자 수령액을 스냅샷으로 저장한다.
- 플랫폼 수수료율이 0%이면 이벤트 기간으로 보고 신청 즉시 `APPROVED` 처리 후 `Purchase`를 생성한다.
- 플랫폼 수수료율이 1bp 이상이면 `AWAITING_PLATFORM_FEE` 상태로 두고, 판매자가 플랫폼 계좌로 수수료를 입금한 뒤 최고관리자가 확인한다.
- 최고관리자가 입금 확인을 누르면 `EnrollmentRequest`가 `APPROVED`가 되고, 그 시점에 수강생의 `Purchase`가 생성된다.
- 판매자는 판매자 대시보드에서 수강생이 입금할 개인 계좌를 등록한다.
- Toss 결제 성공도 동일하게 승인된 `EnrollmentRequest`와 `Purchase`를 생성하므로, 추후 카드결제로 전환해도 수강권한 구조는 유지된다.

## 5. HLS / 더빙 / 자막

### HLS 우선순위

- 웹: `master.m3u8` + Hls.js alt-audio 트랙 전환
- 앱/WebView: `master_{lang}.m3u8` 후보를 우선 전달
- 원본 영상은 직접 노출하지 않고, HLS 경로 중심으로 학습 화면을 구성

### 더빙

- 판매자 업로드 후 별도 Express 서버가 아니라 Next.js 앱 내부의 로컬 전용 인코딩 API에서 ElevenLabs 더빙 작업을 실행
- 배포된 Vercel 앱은 동일 코드를 포함하지만, 기본값으로 로컬 인코딩 실행을 차단한다. 실제 HLS/더빙 처리는 운영자가 프로젝트를 로컬에서 실행한 뒤 관리자 화면에서 승인하듯 처리한다.
- DubTrack 상태: processing, ready, failed
- ready 트랙은 HLS master에 연결

### 로컬 승인형 인코딩 운영

- 강의 판매자는 원본 영상을 업로드하고 섹션에 `Video` 레코드를 만든다.
- 운영자 또는 강의 소유자가 관리자 화면에서 HLS 인코딩/더빙 처리를 실행한다.
- Next API `/api/admin/videos/local-encode`가 원본 S3 객체를 내려받고, ffmpeg로 video-only HLS와 origin/audio HLS를 만든다.
- 선택된 언어가 있으면 ElevenLabs 더빙 오디오를 받고 정규화한 뒤 언어별 HLS 오디오 트랙으로 패키징한다.
- 생성물은 `assets/curriculumsection/{sectionId}/` 아래로 업로드한다.
- Vercel 운영 도메인은 웹, 결제, 대시보드, 수강 화면만 맡고, 무거운 ffmpeg 작업은 로컬 승인 과정에서만 실행한다.

### 자막

- 판매자가 VTT/SRT를 직접 등록 가능
- 플레이어에서는 기본적으로 자막을 끈 상태로 둔다.
- 영상 자체에 자막이 박혀 있어도 강제로 자막을 띄우지 않는다.

## 6. 디자인 시스템

### 색

- 바탕: 밝은 뉴트럴
- 주 색: 깊은 잉크 블루
- 보조 색: 민트, 옐로, 레드 계열 액센트
- 대시보드: 정보 밀도가 높고, 반복 작업에 피로하지 않은 대비

### 레이아웃

- 공개 웹: 검색과 강의 카탈로그가 첫 화면의 핵심
- 수강 화면: 플레이어 우선, 커리큘럼은 접었다 펼 수 있음
- 운영 화면: 좌측 내비게이션 + 표/상태/폼 중심

### 컴포넌트 원칙

- 반복 항목에만 카드 사용
- 버튼에는 lucide 아이콘 사용
- 폼은 SEO, 가격, 미디어, 자막, 더빙을 섹션화
- 모바일에서는 기능을 숨기지 않고 배치를 바꿈

## 7. 구현 순서

1. 브랜드/SEO/레이아웃 리브랜딩
2. 강의 목록/상세/결제 CTA 강화
3. 판매자 대시보드와 강의 등록 폼 확장
4. HLS 플레이어 안전성 보강 및 자막 표시
5. 최고 관리자 대시보드와 정산 큐 구현
6. HLS 테스트 소스 패키징 및 로컬 검증
7. 배포 환경: Vercel + 현재 Postgres/Supabase 또는 Neon 중 실제 연결 상태에 맞춰 확정
