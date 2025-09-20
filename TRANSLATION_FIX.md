# 번역 타입 에러 수정 가이드

## 문제
`translations.ts` 파일에서 일부 언어(ja, vi, ru 등)에 login, dashboard, course 섹션이 누락되어 TypeScript 타입 에러 발생

## 빠른 해결방법

### 방법 1: 임시 타입 무시 (Quick Fix)
```typescript
// @ts-ignore 또는 @ts-expect-error 추가
export const translations: Record<Locale, Translation> = {
  // ... existing translations
}
```

### 방법 2: 부분 타입 사용 (Partial Type)
```typescript
export const translations: Record<Locale, Partial<Translation>> = {
  // ... existing translations
}
```

### 방법 3: 완전한 번역 추가 (권장)

각 언어의 번역 객체에 다음 섹션을 추가해야 합니다:

```typescript
// ja, vi, ru, zh, zh-CN, zh-TW, fr, de, es, pt, it, id, th, hi, ar, tr, pl, uk
// 각 언어에 다음 섹션 추가:

login: {
  title: '로그인',
  subtitle: '계속하려면 아래 방법 중 하나를 선택하세요',
  continueWith: '계속하기',
  google: 'Google로 계속하기',
  apple: 'Apple로 계속하기',
  or: '또는',
  email: '이메일',
  password: '비밀번호',
  confirmPassword: '비밀번호 확인',
  emailPlaceholder: 'you@example.com',
  passwordPlaceholder: '********',
  login: '로그인',
  signup: '회원가입',
  loginButton: '이메일로 로그인',
  signupButton: '이메일로 회원가입',
  loggingIn: '로그인 중...',
  signingUp: '회원가입 중...',
  noAccount: '계정이 없으신가요? 회원가입',
  hasAccount: '이미 계정이 있으신가요? 로그인',
  agreement: '로그인 시 서비스 약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.',
  errors: {
    required: '이메일과 비밀번호를 입력해 주세요',
    invalidEmail: '올바른 이메일 형식이 아닙니다',
    passwordLength: '비밀번호는 8자 이상이어야 합니다',
    passwordMismatch: '비밀번호가 일치하지 않습니다',
    loginFailed: '로그인에 실패했습니다',
    signupFailed: '회원가입에 실패했습니다',
    socialLoginFailed: '소셜 로그인에 실패했습니다',
  },
  success: {
    login: '로그인에 성공했습니다',
    signup: '회원가입이 완료되었습니다',
    emailVerification: '확인 메일이 전송되었습니다. 메일함을 확인해 주세요.',
  },
},
dashboard: {
  title: '대시보드',
  subtitle: '최근 활동과 학습 현황',
  stats: {
    coursesInProgress: '진행 중인 강의',
    weeklyHours: '학습 시간(주)',
    likes: '좋아요',
  },
},
course: {
  students: '수강생',
  curriculum: '커리큘럼',
  noCurriculum: '커리큘럼이 아직 없습니다.',
  reviews: '리뷰',
  noReviews: '아직 리뷰가 없습니다.',
  writeReview: '리뷰 작성',
  reviewPlaceholder: '강의 리뷰를 남겨주세요',
  sendWithCtrlEnter: 'Ctrl+Enter로 전송',
  reply: '답글',
  replyPlaceholder: '답글 작성',
  private: '비공개',
  free: '무료',
  originalPrice: '정가',
  enroll: '수강 신청',
  addToCart: '장바구니',
  inCart: '담김',
  startLearning: '학습하기',
  peoplesLikes: '명이 좋아함',
  loading: '불러오는 중...',
},
```

## 임시 해결책 (즉시 적용 가능)

`src/lib/translations.ts` 파일 상단에 추가:

```typescript
// @ts-nocheck
```

또는 각 오류 발생 위치에:

```typescript
// @ts-expect-error - 번역 추가 예정
ja: {
  // ... existing translations
}
```

## 완벽한 해결책

1. `translations-missing.ts` 파일의 내용을 `translations.ts`의 각 언어 섹션에 병합
2. 모든 20개 언어에 대해 동일한 구조 유지
3. TypeScript 컴파일러 재시작

## 번역 도구 활용

Google Translate API나 DeepL API를 사용하여 자동으로 번역 생성:

```javascript
// 번역 자동화 스크립트 예시
const baseTranslation = translations.ko; // 한국어 기준
const targetLanguages = ['ja', 'vi', 'ru', ...];

for (const lang of targetLanguages) {
  const translated = await translateObject(baseTranslation, 'ko', lang);
  console.log(`${lang}: ${JSON.stringify(translated, null, 2)}`);
}
```

## 점진적 적용

1단계: 타입 에러 무시 (`@ts-nocheck`)
2단계: 기본값 사용 (영어 fallback)
3단계: 실제 번역 추가