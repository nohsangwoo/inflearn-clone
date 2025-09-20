# 다국어 지원 시스템 구성 가이드

## 개요
이 프로젝트는 20개 언어를 지원하는 완전한 다국어 시스템이 구현되어 있습니다.
- URL 기반 라우팅 (`/[locale]/...`)
- 언어 선택 영속성 (zustand + localStorage)
- 자동 locale 감지 및 리다이렉트
- 모든 페이지 및 컴포넌트에서 locale 유지

## 지원 언어 (20개)
- ko (한국어) - 기본값, URL prefix 없음
- en (영어)
- ja (일본어)
- vi (베트남어)
- ru (러시아어)
- zh (중국어)
- zh-CN (중국어 간체)
- zh-TW (중국어 번체)
- fr (프랑스어)
- de (독일어)
- es (스페인어)
- pt (포르투갈어)
- it (이탈리아어)
- id (인도네시아어)
- th (태국어)
- hi (힌디어)
- ar (아랍어)
- tr (터키어)
- pl (폴란드어)
- uk (우크라이나어)

## 핵심 파일 구조

### 1. 번역 시스템
- **`/src/lib/translations.ts`**: 모든 번역 텍스트 중앙 관리
- **`/src/lib/translations-helper.ts`**: 누락된 번역 기본값 제공
- **`/src/lib/stores/locale-store.ts`**: 언어 선택 영속성 관리 (zustand)

### 2. 라우팅 시스템
- **`/src/middleware.ts`**: 자동 locale 감지 및 리다이렉트
- **`/src/app/[locale]/`**: 동적 locale 기반 라우팅

### 3. 컴포넌트
- **`/src/components/language-switcher.tsx`**: 언어 선택 드롭다운
- **`/src/components/site-header.tsx`**: locale 유지하는 네비게이션 링크
- **`/src/components/course-card.tsx`**: locale 포함 코스 링크
- **`/src/components/recommendation-carousel.tsx`**: locale 포함 추천 링크

## 언어 영속성 구현

### 1. Zustand Store (`locale-store.ts`)
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'ko' | 'en' | 'ja' | 'vi' | 'ru' | 'zh' | 'zh-CN' | 'zh-TW' |
  'fr' | 'de' | 'es' | 'pt' | 'it' | 'id' | 'th' | 'hi' | 'ar' | 'tr' | 'pl' | 'uk'

interface LocaleStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'ko',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'locale-storage',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
)
```

### 2. Language Switcher 컴포넌트
```typescript
const { locale: storedLocale, setLocale: setStoredLocale } = useLocaleStore()

// 페이지 로드시 저장된 locale 적용
useEffect(() => {
  if (storedLocale && storedLocale !== currentLocale) {
    switchLocale(storedLocale, false)
  }
}, [])

// 언어 변경시 store 업데이트
function switchLocale(nextLocale: string, updateStore = true) {
  if (updateStore) {
    setStoredLocale(nextLocale as Locale)
  }
  // URL 변경 로직...
}
```

## Locale 포함 링크 구현 패턴

### 컴포넌트에서 현재 locale 추출
```typescript
import { usePathname } from "next/navigation"
import { useMemo } from "react"

const pathname = usePathname()

const currentLocale = useMemo(() => {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  const locales = [
    'ko', 'en', 'ja', 'vi', 'ru', 'zh', 'zh-CN', 'zh-TW',
    'fr', 'de', 'es', 'pt', 'it', 'id', 'th', 'hi',
    'ar', 'tr', 'pl', 'uk'
  ]
  return locales.includes(firstSegment) ? firstSegment : 'ko'
}, [pathname])
```

### Locale 포함 경로 생성
```typescript
// 한국어는 prefix 없이, 다른 언어는 prefix 포함
const localePath = (path: string) => {
  if (currentLocale === 'ko') {
    return path
  }
  return `/${currentLocale}${path}`
}

// 사용 예시
<Link href={localePath('/company')}>회사소개</Link>
<Link href={localePath(`/course/${courseId}`)}>코스 상세</Link>
```

## 번역 추가 방법

### 1. 새로운 페이지 번역 추가
`/src/lib/translations.ts`에서 각 언어별로 섹션 추가:

```typescript
ko: {
  // 기존 섹션들...
  newSection: {
    title: '제목',
    description: '설명',
    // ...
  }
}
```

### 2. 누락된 번역 기본값 설정
`/src/lib/translations-helper.ts`에서 기본값 추가:

```typescript
const defaultNewSectionTranslation = {
  title: 'Title',
  description: 'Description',
  // ...
}

export function fillMissingTranslations(translation: Record<string, unknown>) {
  return {
    ...translation,
    newSection: translation.newSection || defaultNewSectionTranslation,
  }
}
```

### 3. 필수 번역 섹션 (login, dashboard, course)
모든 언어에 아래 섹션이 필수로 포함되어야 합니다:

```typescript
login: {
  title: 'Login',
  subtitle: 'Choose one of the methods below to continue',
  continueWith: 'Continue with',
  google: 'Continue with Google',
  apple: 'Continue with Apple',
  or: 'or',
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  emailPlaceholder: 'you@example.com',
  passwordPlaceholder: '********',
  login: 'Login',
  signup: 'Sign Up',
  loginButton: 'Login with Email',
  signupButton: 'Sign Up with Email',
  loggingIn: 'Logging in...',
  signingUp: 'Signing up...',
  noAccount: "Don't have an account? Sign up",
  hasAccount: 'Already have an account? Login',
  agreement: 'By logging in, you agree to our Terms of Service and Privacy Policy.',
  errors: {
    required: 'Please enter email and password',
    invalidEmail: 'Invalid email format',
    passwordLength: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
    loginFailed: 'Login failed',
    signupFailed: 'Sign up failed',
    socialLoginFailed: 'Social login failed',
  },
  success: {
    login: 'Login successful',
    signup: 'Sign up complete',
    emailVerification: 'Verification email sent. Please check your inbox.',
  },
},
dashboard: {
  title: 'Dashboard',
  subtitle: 'Recent activity and learning progress',
  stats: {
    coursesInProgress: 'Courses in Progress',
    weeklyHours: 'Weekly Hours',
    likes: 'Likes',
  },
},
course: {
  students: 'students',
  curriculum: 'Curriculum',
  noCurriculum: 'No curriculum yet.',
  reviews: 'Reviews',
  noReviews: 'No reviews yet.',
  writeReview: 'Write Review',
  reviewPlaceholder: 'Leave your course review',
  sendWithCtrlEnter: 'Send with Ctrl+Enter',
  reply: 'Reply',
  replyPlaceholder: 'Write a reply',
  private: 'Private',
  free: 'Free',
  originalPrice: 'Original Price',
  enroll: 'Enroll',
  addToCart: 'Add to Cart',
  inCart: 'In Cart',
  startLearning: 'Start Learning',
  peoplesLikes: 'people like this',
  loading: 'Loading...',
},
```

## 주요 수정 내역

### 2025-09-21 언어 영속성 및 링크 완전 수정
1. **언어 영속성 구현**
   - zustand store에 persist middleware 추가
   - localStorage에 선택 언어 저장 (키: `locale-storage`)
   - 페이지 로드시 자동 적용
   - 모든 페이지 이동시 언어 유지

2. **모든 내부 링크 locale 지원 (완전 수정)**
   - `site-header.tsx`: 모든 네비게이션 링크 locale 포함
   - `course-card.tsx`: 코스 카드 링크 locale 포함
   - `recommendation-carousel.tsx`: 추천 캐러셀 링크 locale 포함 (currentLocale 변수 정의 추가)
   - `page-wrapper.tsx`: 학습하기 버튼 router.push에 locale 포함
   - `lecture/page.tsx`: 뒤로가기 버튼 locale 포함

3. **TypeScript 타입 안정성**
   - Locale 타입 정의 및 export
   - 모든 언어에 필수 섹션(login, dashboard, course) 추가
   - any 타입 제거 및 타입 체크 통과

## 디버깅 팁

### 언어가 초기화되는 경우 확인사항
1. **Link 컴포넌트 확인**: href에 locale prefix 포함 여부
   - 잘못된 예: `<Link href="/course/123">`
   - 올바른 예: `<Link href={localePath('/course/123')}>`
2. **router.push 확인**: 경로에 locale prefix 포함 여부
   - 잘못된 예: `router.push('/course/lecture')`
   - 올바른 예: `router.push(localePath('/course/lecture'))`
3. **middleware.ts 확인**: locale 감지 로직
4. **localStorage 확인**: `locale-storage` 키 값
5. **컴포넌트별 currentLocale 변수 확인**: 모든 컴포넌트에서 currentLocale이 정의되어 있는지 확인

### 개발자 도구에서 확인
```javascript
// 현재 저장된 locale 확인
localStorage.getItem('locale-storage')

// 수동으로 locale 설정
localStorage.setItem('locale-storage', '{"state":{"locale":"en"},"version":0}')
```

## 주의사항

1. **한국어 처리**: 한국어(ko)는 기본 언어로 URL에 prefix를 포함하지 않음
2. **SSR/CSR 차이**: usePathname은 client component에서만 사용 가능
3. **middleware 우선순위**: middleware의 리다이렉트가 localStorage보다 우선될 수 있음
4. **디버깅 편의**: 원본 텍스트 위치에 한국어 주석 유지 권장

## 추가 개발 가이드

### 새로운 컴포넌트에 locale 지원 추가
1. **필수 imports 추가**
   ```typescript
   import { usePathname } from "next/navigation"
   import { useMemo } from "react"
   ```

2. **currentLocale 계산 로직 추가**
   ```typescript
   const pathname = usePathname()
   const currentLocale = useMemo(() => {
     const segments = pathname.split('/').filter(Boolean)
     const firstSegment = segments[0]
     const locales = [
       'ko', 'en', 'ja', 'vi', 'ru', 'zh', 'zh-CN', 'zh-TW',
       'fr', 'de', 'es', 'pt', 'it', 'id', 'th', 'hi',
       'ar', 'tr', 'pl', 'uk'
     ]
     return locales.includes(firstSegment) ? firstSegment : 'ko'
   }, [pathname])
   ```

3. **localePath 헬퍼 함수 정의**
   ```typescript
   const localePath = (path: string) => {
     if (currentLocale === 'ko') {
       return path
     }
     return `/${currentLocale}${path}`
   }
   ```

4. **모든 내부 링크에 localePath 적용**
5. **TypeScript 타입 체크 확인**

### 번역 작업 시 주의사항
- 모든 언어에 동일한 키 구조 유지
- 누락된 번역은 `translations-helper.ts`에서 기본값 제공
- 특수문자나 방향(RTL) 언어 고려
- **중요**: 원본 텍스트 위치에 한국어 주석 추가로 디버깅 편의성 제공
  ```typescript
  // 예시
  title: 'Dashboard', // 대시보드
  subtitle: 'Recent activity', // 최근 활동
  ```

### 언어별 특이사항
- **아랍어(ar)**: RTL(Right-To-Left) 레이아웃 고려 필요
- **중국어**: zh(간체), zh-CN(간체-중국), zh-TW(번체-대만) 구분
- **한국어(ko)**: 기본 언어로 URL prefix 없음

## 주요 문제 해결 이력

### 1. 404 오류 해결 (Dynamic Routing)
- **문제**: `/ja`, `/en` 등 언어별 URL 접근시 404 오류
- **해결**: `app/[locale]` 동적 라우팅 구조 구현

### 2. TypeScript 타입 오류 해결
- **문제**: 언어별 번역 객체에 필수 속성 누락
- **해결**: 모든 언어에 login, dashboard, course 섹션 추가
- **교훈**: "언어가 누락됐으면 타입무시를 하는게 아니라 언어를 채워야 함"

### 3. 언어 초기화 문제 해결
- **문제**: 코스 상세 페이지 진입시 한국어로 초기화
- **원인**: `course-card.tsx`, `recommendation-carousel.tsx` 등에서 Link href에 locale 누락
- **해결**: 모든 Link 컴포넌트와 router.push에 locale prefix 추가

### 4. Build 오류 해결
- **문제**: `npm run build` 실행시 컴파일 오류
- **해결**:
  - 모든 import 경로 수정
  - TypeScript 타입 오류 해결
  - 중복 변수 선언 제거

## 테스트 체크리스트

### 언어 전환 테스트
- [ ] 언어 선택시 URL 변경 확인 (예: `/ja`, `/en/course/123`)
- [ ] 페이지 새로고침 후 언어 유지 확인
- [ ] 다른 페이지 이동시 언어 유지 확인
- [ ] localStorage에서 `locale-storage` 값 확인

### 링크 테스트
- [ ] 네비게이션 메뉴 링크 locale 포함 확인
- [ ] 코스 카드 클릭시 locale 유지 확인
- [ ] 추천 캐러셀 링크 locale 유지 확인
- [ ] 학습하기 버튼 클릭시 locale 유지 확인
- [ ] 뒤로가기 버튼 클릭시 locale 유지 확인

### Build 테스트
- [ ] `npm run lint` 통과
- [ ] `npm run typecheck` 통과
- [ ] `npm run build` 성공

## 파일별 수정 내역 요약

| 파일 | 수정 내용 | 상태 |
|------|-----------|------|
| `locale-store.ts` | zustand store 생성, persist middleware 추가 | ✅ |
| `language-switcher.tsx` | localStorage 연동, 페이지 로드시 언어 적용 | ✅ |
| `site-header.tsx` | 모든 네비게이션 링크 locale 추가 | ✅ |
| `course-card.tsx` | 코스 링크에 locale 추가 | ✅ |
| `recommendation-carousel.tsx` | 추천 링크에 locale 추가, currentLocale 정의 | ✅ |
| `page-wrapper.tsx` | router.push에 locale 추가 | ✅ |
| `lecture/page.tsx` | 뒤로가기 버튼 locale 추가 | ✅ |
| `translations.ts` | 20개 언어 모두 필수 섹션 추가 | ✅ |
| `translations-helper.ts` | 누락 번역 기본값 제공 | ✅ |