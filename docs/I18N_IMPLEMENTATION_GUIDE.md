# 다국어(i18n) 시스템 구현 가이드

## 📋 개요
Next.js 15 App Router 기반의 완전한 다국어 지원 시스템입니다. 20개 언어를 지원하며, URL 경로 기반 라우팅을 사용합니다.

## 🌍 지원 언어 (20개)
```typescript
const supportedLocales = [
  'ko',     // 한국어 (기본)
  'en',     // 영어
  'ja',     // 일본어
  'vi',     // 베트남어
  'ru',     // 러시아어
  'zh',     // 중국어(간체)
  'zh-CN',  // 중국어(간체-중국)
  'zh-TW',  // 중국어(번체-대만)
  'fr',     // 프랑스어
  'de',     // 독일어
  'es',     // 스페인어
  'pt',     // 포르투갈어
  'it',     // 이탈리아어
  'id',     // 인도네시아어
  'th',     // 태국어
  'hi',     // 힌디어
  'ar',     // 아랍어
  'tr',     // 터키어
  'pl',     // 폴란드어
  'uk'      // 우크라이나어
]
```

## 📁 프로젝트 구조

```
src/
├── middleware.ts                 # 언어 감지 및 리다이렉트 처리
├── app/
│   ├── [locale]/                # 동적 언어 라우트
│   │   ├── layout.tsx          # 언어별 레이아웃
│   │   ├── page.tsx            # 메인 페이지
│   │   ├── login/              # 로그인 페이지
│   │   ├── course/
│   │   │   └── [id]/          # 코스 상세 페이지
│   │   ├── me/                # 사용자 대시보드
│   │   └── company/           # 회사 소개 페이지
│   ├── api/                   # API 라우트 (언어 무관)
│   └── layout.tsx             # 루트 레이아웃
├── lib/
│   └── translations.ts        # 번역 시스템 및 모든 번역 데이터
└── components/
    └── language-switcher.tsx  # 언어 선택 컴포넌트
```

## 🔧 핵심 파일 설명

### 1. `src/middleware.ts`
```typescript
// 자동 언어 감지 및 리다이렉트 처리
// - Accept-Language 헤더로 선호 언어 감지
// - URL에 언어 코드가 없으면 자동 리다이렉트
// - 예: / → /ko/, /course/11 → /ko/course/11
```

### 2. `src/lib/translations.ts`
```typescript
// 중앙 집중식 번역 관리 시스템
export type Locale = 'ko' | 'en' | 'ja' | ... // 20개 언어

type Translation = {
  homepage: { ... },
  footer: { ... },
  company: { ... },
  login: { ... },
  dashboard: { ... },
  course: { ... }
}

// 사용법:
const locale = useLocale(pathname)
const t = getTranslation(locale)
// t.homepage.search.placeholder
```

### 3. `src/app/[locale]/layout.tsx`
```typescript
// 모든 언어별 페이지의 공통 레이아웃
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return children
}
```

## 🚀 구현 방법

### 1단계: 미들웨어 설정
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // 언어 코드가 있는지 확인
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // 언어 감지 및 리다이렉트
    const locale = getLocale(request)
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)',]
}
```

### 2단계: 페이지에 번역 적용
```typescript
// 예: src/app/[locale]/login/page.tsx
"use client"

import { usePathname } from "next/navigation"
import { getTranslation, useLocale } from "@/lib/translations"

export default function LoginPage() {
  const pathname = usePathname()
  const locale = useLocale(pathname)
  const t = getTranslation(locale).login

  return (
    <div>
      <h1>{t.title}</h1> {/* "로그인" */}
      <input placeholder={t.emailPlaceholder} /> {/* "you@example.com" */}
    </div>
  )
}
```

### 3단계: 동적 라우트 처리
```typescript
// src/app/[locale]/course/[id]/page.tsx
interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params
  // locale와 id 사용
}
```

## 🎯 사용 예시

### URL 구조
- 한국어: `http://localhost:3000/ko`
- 영어: `http://localhost:3000/en`
- 일본어: `http://localhost:3000/ja`
- 코스 상세 (영어): `http://localhost:3000/en/course/11`
- 로그인 (중국어): `http://localhost:3000/zh/login`

### 컴포넌트에서 번역 사용
```typescript
const t = getTranslation(locale)

// 홈페이지 번역
t.homepage.search.placeholder  // "강의, 강사, 키워드를 검색하세요"
t.homepage.filters.all         // "전체"
t.homepage.price.free          // "무료"

// 로그인 번역
t.login.title                  // "로그인"
t.login.errors.required        // "이메일과 비밀번호를 입력해 주세요"

// 코스 번역
t.course.curriculum            // "커리큘럼"
t.course.reviews               // "리뷰"
```

## 🐛 디버깅 팁

### 한국어 주석 사용
번역 키를 사용하는 모든 곳에 원본 한국어 텍스트를 주석으로 표시:
```typescript
{t.login.title} {/* "로그인" */}
placeholder={t.emailPlaceholder} // "you@example.com"
```

### 타입 안정성
TypeScript를 활용해 번역 키 오타 방지:
```typescript
type Translation = {
  login: {
    title: string
    // ... 모든 키 정의
  }
}
```

## ⚠️ 주의사항

1. **API 라우트는 언어 무관**: `/api/*` 경로는 미들웨어에서 제외
2. **정적 파일 처리**: 이미지, 폰트 등은 언어 경로 없이 접근
3. **SEO 고려**: 각 언어별 메타데이터 설정 필요
4. **캐시 전략**: 언어별로 별도 캐싱 고려

## 📝 새 페이지 추가 방법

1. `src/app/[locale]/새페이지/page.tsx` 생성
2. `src/lib/translations.ts`에 번역 추가
3. 컴포넌트에서 `useLocale`와 `getTranslation` 사용
4. 한국어 주석 추가 (디버깅용)

## 🔄 번역 추가/수정 방법

1. `src/lib/translations.ts` 열기
2. `Translation` 타입에 새 키 추가
3. 모든 20개 언어에 대해 번역 추가
4. TypeScript 오류 없는지 확인

## 📊 현재 구현 상태

✅ 완료:
- 미들웨어를 통한 자동 언어 감지
- 20개 언어 지원
- URL 기반 라우팅
- 메인 페이지 다국어 지원
- 로그인 페이지 다국어 지원
- 대시보드 다국어 지원
- 코스 상세 페이지 다국어 지원
- 회사 소개 페이지 다국어 지원
- 푸터 다국어 지원

⏳ 추가 필요:
- 일부 하위 페이지 오류 수정
- 나머지 언어 번역 완성
- 언어별 SEO 메타데이터 최적화

## 🛠 트러블슈팅

### 404 오류 발생 시
1. `[locale]` 폴더 구조 확인
2. 중복 페이지 제거 (루트에 같은 이름 페이지 없어야 함)
3. `.next` 폴더 삭제 후 재빌드

### 500 오류 발생 시
1. params await 처리 확인
2. locale 파라미터 추가 확인
3. 서버 재시작

### 타입 오류 발생 시
1. Translation 타입 정의 확인
2. 모든 언어에 필수 키 추가
3. TypeScript 서버 재시작