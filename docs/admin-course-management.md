### 강의 관리(어드민) 기능 사양서

이 문서는 강의 생성/편집/커리큘럼 관리/이미지 업로드 전 과정을 정리한 운영 가이드입니다. DB, 백엔드 API, 프론트 흐름, 인증/보안, 환경변수까지 포함합니다.

---

### 핵심 개념 및 데이터 모델

- **Lecture**: 강의의 최상위 개체. 강의명, 설명, 가격, 할인가격, 공개여부, 대표이미지 키 보유. `instructorId`로 제작자 소유 관계.
- **Curriculum**: 강의 하위의 커리큘럼 묶음. 섹션(수업)의 컨테이너 역할.
- **CurriculumSection**: 실제 수업 단위. 제목/설명/공개여부(`isActive`).
- **Video / File**: 섹션 내 영상/파일 (현재 문서의 범위에선 CRUD 일부만 사용).
- **User**: Supabase Auth 사용자와 1:1 매핑된 Prisma `User`.

관련 Prisma 필드 요약(전체 스키마는 `prisma/schema.prisma` 참고)

```12:30:prisma/schema.prisma
model Lecture {
  id            Int       @id @default(autoincrement())
  title         String
  description   String?
  price         Int
  discountPrice Int?
  isActive      Boolean   @default(true)
  imageUrl      String?   // CDN 없이 S3 키만 저장
  instructorId  Int?
  Curriculums   Curriculum[]
}
```

---

### 인증/보안

- Supabase 세션 기반 인증을 사용하며, 모든 어드민 API는 로그인 확인 및 소유권 검사를 수행.
- 헬퍼: `src/lib/auth/get-auth-user.ts`
  - `getAuthUserFromRequest(req)` → `{ id, email, supabaseId } | null`
  - Prisma `User` 레코드를 upsert/동기화 후 최소 필드만 반환.

---

### 환경 변수

- AWS 업로드
  - `AWS_ACCESS_KEY`, `AWS_SECRET_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME`
- CDN
  - `NEXT_PUBLIC_CDN_URL` (기본값: `https://storage.lingoost.com`)
- Supabase
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 백엔드 API

모든 경로는 인증 필요. 소유자가 아닌 강의/커리큘럼/섹션 접근 시 403.

- 강의 목록/생성/상세/수정
  - `GET /api/admin/courses`
    - 응답: 본인 소유 `[{ id, title, price, isActive, imageUrl }]`
  - `POST /api/admin/courses`
    - 바디: `{ title?: string, price?: number }`
    - 동작: 초안 강의 생성, `instructorId` 자동 설정 → `{ id }`
  - `GET /api/admin/courses/[lectureId]`
    - 응답: `{ id, title, description, price, discountPrice, imageUrl, isActive }`
  - `PATCH /api/admin/courses/[lectureId]`
    - 바디(부분 갱신): `{ title?, description?, price?, discountPrice?, imageUrl?, isActive? }`

- 커리큘럼/섹션
  - `GET /api/admin/curriculums/[lectureId]`
    - 응답: `Curriculum[]` + 각 `CurriculumSections[]` 포함
  - `POST /api/admin/curriculums/[lectureId]`
    - 바디: `{ title?: string, description?: string }`
    - 동작: 커리큘럼 1개 생성 + 기본 섹션 1개 생성
  - `POST /api/admin/curriculums/[lectureId]/sections`
    - 바디: `{ curriculumId: number, title?: string, description?: string }`
    - 동작: 해당 커리큘럼에 섹션 추가
  - `PATCH /api/admin/curriculums/[lectureId]/sections/[sectionId]`
    - 바디: `{ title?, description?, isActive? }`
  - `DELETE /api/admin/curriculums/[lectureId]/sections/[sectionId]`
  - `DELETE /api/admin/curriculums/[lectureId]/[curriculumId]`
    - 주의: 하위 `Video`, `File`, `CurriculumSection` 일괄 삭제 후 `Curriculum` 삭제
    - Prisma where 조건은 관계명 대소문자 정확히 사용: `CurriculumSection: { is: { curriculumId } }`

- 파일 업로드(프리사인)
  - `POST /api/admin/files/presign`
    - 바디: `{ contentType: string, pathPrefix?: string }`
    - 응답: `{ url, key }`
    - S3 PUT URL과 객체 키 반환. 키만 DB에 저장하고 표시 시 CDN 조합.

Next.js 15 주의점

- 동적 API 라우트의 `params`는 Promise. 모든 핸들러에서 `await params`로 언래핑.

---

### 프론트엔드 구성

- 공통 Provider: `src/components/providers.tsx`
  - React Query `QueryClientProvider` + Devtools, `ThemeProvider`, `Toaster` 초기화.

- 강의 목록 페이지: `src/app/admin/courses/page.tsx`
  - 데이터: `GET /api/admin/courses`
  - 기능
    - 썸네일(키 → CDN URL 변환) 미리보기
    - 공개/비공개 토글 → `PATCH /api/admin/courses/{id}`
    - 새 강의 만들기: `POST /api/admin/courses` → 생성된 id로 `/admin/courses/{id}` 이동

- 강의 편집 페이지: `src/app/admin/courses/[lectureId]/page.tsx`
  - 데이터: `GET /api/admin/courses/[lectureId]`, `GET /api/admin/curriculums/[lectureId]`
  - 기본 정보
    - 제목/설명 인라인 업데이트
    - 가격/할인 가격 입력 → Blur 시 PATCH
    - 공개/비공개 토글(Switch) → `isActive` 패치
    - 대표 이미지 업로드
      - 업로드 전 클라이언트에서 WebP로 압축 → presign → S3 PUT → `imageUrl`에 키만 저장
      - 즉시 로컬 미리보기 표시 후 업로드 완료 시 CDN 경로로 업데이트
  - 커리큘럼/섹션
    - “섹션 추가” → 커리큘럼 생성(기본 수업 1개 포함)
    - 섹션(수업) 목록 렌더링: 각 강의 내부에서 1, 2, 3… 순서로 표시(전역 id 아님)
    - 수업 제목 수정, 공개 토글(`CurriculumSection.isActive`), 수업 삭제
    - 커리큘럼 삭제 시 하위 리소스 일괄 삭제

CDN URL 규칙

- DB에는 S3 **키**만 저장. 표시 시 `(${NEXT_PUBLIC_CDN_URL} || 'https://storage.lingoost.com') + '/' + key` 로 구성.

---

### 업로드 헬퍼 (재사용)

- 위치: `src/lib/upload/uploadImageWebp.ts`
- 시그니처

```ts
export async function uploadImageWebp(
  file: File,
  options?: {
    pathPrefix?: string // 기본 'lectures'
    quality?: number    // 0~1, 기본 0.8
    maxWidth?: number   // 선택 리사이즈
    maxHeight?: number  // 선택 리사이즈
  }
): Promise<{ key: string; cdnUrl: string }>
```

- 동작
  1) `<canvas>`로 WebP 압축(옵션 리사이즈)
  2) `POST /api/admin/files/presign` 호출 (경로 prefix 전달 가능)
  3) S3 PUT으로 업로드(클라이언트 자원 사용)
  4) `{ key, cdnUrl }` 반환 (DB 저장은 `key`만)

간단 사용 예시

```ts
const { key } = await uploadImageWebp(file, { pathPrefix: 'lectures', quality: 0.8, maxWidth: 1920 })
await axios.patch(`/api/admin/courses/${lectureId}`, { imageUrl: key })
```

---

### UI 컴포넌트

- `src/components/ui/switch.tsx`: Radix Switch 래퍼. `checked`, `onCheckedChange(checked:boolean)` 지원.

---

### 개발/운영 팁

- 소유권 체크 실패 시 403, 인증 미확인 401을 클라이언트에서 처리하여 UX 명확화.
- 섹션 번호 표시는 강의 내부 인덱스로 처리했으나, 실제 정렬 보장 필요 시 `order` 컬럼 도입 권장(생성 시 `max(order)+1`).
- 커리큘럼 삭제 트랜잭션에서 Prisma 관계 이름 대소문자를 반드시 정확히 사용.
- Next.js 15 App Router의 동적 API에서 `params`는 Promise이므로 항상 `await params`로 언래핑.

---

### 앞으로의 확장 아이디어

- 섹션/수업 Drag & Drop 정렬, 일괄 공개/비공개, 배지/아이콘, 썸네일 크롭/썸네일 생성, S3 객체 삭제 API, 배포 환경에서 Signed Cookie/Signed URL로 보호된 HLS 등.


