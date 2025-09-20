# SEO 최적화 범용 템플릿 가이드

## 📝 사용자 입력 섹션
아래 정보를 모두 입력하세요. 이 정보를 기반으로 하단의 모든 SEO 설정이 자동으로 생성됩니다.

```
=== 필수 정보 ===
SITE_URL: https://www.lingoost.com/
COMPANY_NAME: 주식회사 럿지
COMPANY_NAME_EN: Ludgi Inc.
COMPANY_SHORT_DESC: 스타트업부터 대기업까지, 각 비즈니스 단계에 맞는 최적의 기술 솔루션을 제공합니다
COMPANY_LONG_DESC: 
```
주식회사 럿지
혁신적인 기술 솔루션으로 비즈니스의 미래를 만들어갑니다...등등 소개하려는 내용을 자유롭게 작성하세요.
```
COMPANY_KEYWORDS: 아웃소싱, 인프런, 외주 개발사, 럿지, 주식회사 럿지

=== 연락처 정보 ===
PHONE: 02-931-9310
PHONE_FULL: +82-10-3006-9310
EMAIL: milli@molluhub.com
ADDRESS_STREET: 인천광역시 연수구 인천타워대로 323, 에이동 20층 2001,2002,2003,2
004,2005,2006호 A - 317(송도동, 송도 센트로드) 123
ADDRESS_CITY: 인천
ADDRESS_REGION: 인천광역시
POSTAL_CODE: 22606
COUNTRY_CODE: KR
LATITUDE: 37.399561
LONGITUDE: 126.629763

=== 미디어 자원 ===
LOGO_PATH: /logo.png
OG_IMAGE_PATH: /logo.png
FAVICON_PATH: /favicon.ico

=== 소셜 미디어 ===
YOUTUBE_URL: https://www.youtube.com/@bknil
TWITTER_HANDLE: https://x.com/bknil_offitial

=== 비즈니스 정보 ===
BUSINESS_TYPE: LocalBusiness (또는 EducationalOrganization, SoftwareApplication)
PRICE_RANGE: ₩₩ (₩~₩₩₩₩)
OPENING_DAYS: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
OPENING_TIME: 09:00
CLOSING_TIME: 21:00
FOUNDED_YEAR: 2025

=== 추가 SEO 정보 ===
MAIN_PRODUCT_SERVICE: 온라인 강의 공유 및 학습 관리 플랫폼 (LMS)
TARGET_AUDIENCE: 강의 제공자(강사), 강의 수강생(학생), 교육 기관, 기업 교육 담당자
LANGUAGE: ko
```

---

## 🚀 자동 생성 SEO 코드

### 1. 필수 메타 태그
아래 코드를 HTML `<head>` 섹션에 추가하세요:

```html
<!DOCTYPE html>
<html lang="{LANGUAGE}">
<head>
  <!-- 문자 인코딩 -->
  <meta charset="UTF-8">
  
  <!-- 뷰포트 설정 (모바일 필수) -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 페이지 제목 (30-60자 권장) -->
  <title>{COMPANY_NAME} - {COMPANY_SHORT_DESC} | {MAIN_PRODUCT_SERVICE}</title>
  
  <!-- 메타 설명 (120-160자 권장) -->
  <meta name="description" content="{COMPANY_LONG_DESC}">
  
  <!-- 키워드 -->
  <meta name="keywords" content="{COMPANY_KEYWORDS}">
  
  <!-- 작성자 -->
  <meta name="author" content="{COMPANY_NAME}">
  
  <!-- 로봇 메타 태그 -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  
  <!-- 캐노니컬 URL -->
  <link rel="canonical" href="{SITE_URL}/">
  
  <!-- 대체 언어 버전 -->
  <link rel="alternate" hreflang="{LANGUAGE}" href="{SITE_URL}/">
  <link rel="alternate" hreflang="{ALTERNATE_LANGUAGE}" href="{ALTERNATE_URL}/">
  
  <!-- 사이트 검증 -->
  <meta name="google-site-verification" content="{GOOGLE_SITE_VERIFICATION}">
  <meta name="naver-site-verification" content="{NAVER_SITE_VERIFICATION}">
  
  <!-- 지역 정보 -->
  <meta name="geo.region" content="{COUNTRY_CODE}-11">
  <meta name="geo.placename" content="{ADDRESS_CITY}">
  <meta name="geo.position" content="{LATITUDE};{LONGITUDE}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="{FAVICON_PATH}">
</head>
```

### 2. 오픈 그래프 (Open Graph)
```html
<!-- 기본 OG 태그 -->
<meta property="og:title" content="{COMPANY_NAME} - {COMPANY_SHORT_DESC}">
<meta property="og:description" content="{COMPANY_LONG_DESC}">
<meta property="og:type" content="website">
<meta property="og:url" content="{SITE_URL}/">
<meta property="og:site_name" content="{COMPANY_NAME}">
<meta property="og:locale" content="{LANGUAGE}_{COUNTRY_CODE}">

<!-- OG 이미지 -->
<meta property="og:image" content="{SITE_URL}{OG_IMAGE_PATH}">
<meta property="og:image:secure_url" content="{SITE_URL}{OG_IMAGE_PATH}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{COMPANY_NAME} - {COMPANY_SHORT_DESC}">
```

### 3. 트위터 카드
```html
<!-- 트위터 카드 -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="{TWITTER_HANDLE}">
<meta name="twitter:creator" content="{TWITTER_HANDLE}">
<meta name="twitter:title" content="{COMPANY_NAME} - {COMPANY_SHORT_DESC}">
<meta name="twitter:description" content="{COMPANY_LONG_DESC}">
<meta name="twitter:image" content="{SITE_URL}{OG_IMAGE_PATH}">
<meta name="twitter:image:alt" content="{COMPANY_NAME}">
```

### 4. 구조화된 데이터 (JSON-LD)

#### WebSite 스키마
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "{COMPANY_NAME}",
  "alternateName": "{COMPANY_NAME_EN}",
  "url": "{SITE_URL}/",
  "description": "{COMPANY_LONG_DESC}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "{SITE_URL}/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

#### Organization 스키마
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{COMPANY_NAME}",
  "url": "{SITE_URL}/",
  "logo": "{SITE_URL}{LOGO_PATH}",
  "image": "{SITE_URL}{STORE_IMAGE_PATH}",
  "description": "{COMPANY_LONG_DESC}",
  "foundingDate": "{FOUNDED_YEAR}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{ADDRESS_STREET}",
    "addressLocality": "{ADDRESS_CITY}",
    "addressRegion": "{ADDRESS_REGION}",
    "postalCode": "{POSTAL_CODE}",
    "addressCountry": "{COUNTRY_CODE}"
  },
  "telephone": "{PHONE_FULL}",
  "email": "{EMAIL}",
  "sameAs": [
    "{FACEBOOK_URL}",
    "{INSTAGRAM_URL}",
    "{YOUTUBE_URL}",
    "{NAVER_BLOG_URL}"
  ],
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [{OPENING_DAYS}],
    "opens": "{OPENING_TIME}",
    "closes": "{CLOSING_TIME}"
  }
}
</script>
```

#### LocalBusiness 스키마
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "{BUSINESS_TYPE}",
  "name": "{COMPANY_NAME}",
  "image": "{SITE_URL}{STORE_IMAGE_PATH}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{ADDRESS_STREET}",
    "addressLocality": "{ADDRESS_CITY}",
    "addressRegion": "{ADDRESS_REGION}",
    "postalCode": "{POSTAL_CODE}",
    "addressCountry": "{COUNTRY_CODE}"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": {LATITUDE},
    "longitude": {LONGITUDE}
  },
  "url": "{SITE_URL}/",
  "telephone": "{PHONE_FULL}",
  "email": "{EMAIL}",
  "priceRange": "{PRICE_RANGE}",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [{OPENING_DAYS}],
      "opens": "{OPENING_TIME}",
      "closes": "{CLOSING_TIME}"
    }
  ],
  "sameAs": [
    "{FACEBOOK_URL}",
    "{INSTAGRAM_URL}",
    "{YOUTUBE_URL}",
    "{NAVER_BLOG_URL}"
  ]
}
</script>
```

#### BreadcrumbList 스키마 (예시)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "홈",
      "item": "{SITE_URL}/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "제품",
      "item": "{SITE_URL}/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{MAIN_PRODUCT_SERVICE}",
      "item": "{SITE_URL}/products/main"
    }
  ]
}
</script>
```

### 5. robots.txt
```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$
Crawl-delay: 1

# 이미지 크롤러
User-agent: Googlebot-Image
Allow: /images/

# 사이트맵 위치
Sitemap: {SITE_URL}/sitemap.xml
```

### 6. sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>{SITE_URL}/</loc>
    <lastmod>2024-01-20T10:00:00+09:00</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>{SITE_URL}{OG_IMAGE_PATH}</image:loc>
      <image:title>{COMPANY_NAME}</image:title>
      <image:caption>{COMPANY_SHORT_DESC}</image:caption>
    </image:image>
  </url>
  <url>
    <loc>{SITE_URL}/products</loc>
    <lastmod>2024-01-20T09:00:00+09:00</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>{SITE_URL}/about</loc>
    <lastmod>2024-01-20T09:00:00+09:00</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{SITE_URL}/contact</loc>
    <lastmod>2024-01-20T09:00:00+09:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### 7. 모바일 최적화
```html
<!-- 터치 아이콘 -->
<link rel="apple-touch-icon" sizes="180x180" href="{SITE_URL}/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="{SITE_URL}/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="{SITE_URL}/favicon-16x16.png">

<!-- 모바일 웹앱 설정 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="apple-mobile-web-app-title" content="{COMPANY_NAME}">

<!-- 테마 색상 -->
<meta name="theme-color" content="#4CAF50">

<!-- 매니페스트 -->
<link rel="manifest" href="/manifest.json">
```

### 8. manifest.json
```json
{
  "name": "{COMPANY_NAME}",
  "short_name": "{COMPANY_NAME}",
  "description": "{COMPANY_SHORT_DESC}",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 9. 성능 최적화
```html
<!-- Preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://www.google-analytics.com">

<!-- Preload 중요 리소스 -->
<link rel="preload" href="/css/main.css" as="style">
<link rel="preload" href="/fonts/NotoSansKR-Regular.woff2" as="font" type="font/woff2" crossorigin>

<!-- 중요 CSS 인라인 -->
<style>
  /* Critical CSS - 페이지 로드 시 즉시 필요한 스타일 */
  body { margin: 0; font-family: 'Noto Sans KR', sans-serif; }
  .header { background: #fff; height: 60px; }
</style>

<!-- 비중요 CSS 지연 로딩 -->
<link rel="preload" href="/css/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/css/non-critical.css"></noscript>
```

### 10. 이미지 최적화
```html
<!-- 반응형 이미지 -->
<img src="{STORE_IMAGE_PATH}" 
     srcset="{STORE_IMAGE_PATH}-320w.jpg 320w,
             {STORE_IMAGE_PATH}-640w.jpg 640w,
             {STORE_IMAGE_PATH}-1200w.jpg 1200w"
     sizes="(max-width: 320px) 280px,
            (max-width: 640px) 600px,
            1200px"
     alt="{COMPANY_NAME} - {COMPANY_SHORT_DESC}"
     title="{COMPANY_LONG_DESC}"
     loading="lazy"
     width="1200"
     height="800">

<!-- WebP 포맷 지원 -->
<picture>
  <source srcset="{STORE_IMAGE_PATH}.webp" type="image/webp">
  <source srcset="{STORE_IMAGE_PATH}.jpg" type="image/jpeg">
  <img src="{STORE_IMAGE_PATH}.jpg" alt="{COMPANY_NAME}">
</picture>
```

---

## ✅ SEO 체크리스트

### 필수 항목
- [ ] 모든 사용자 입력 정보 작성 완료
- [ ] 메타 태그 삽입 (title, description, keywords)
- [ ] 캐노니컬 URL 설정
- [ ] OG 이미지 업로드 및 경로 설정 (1200x630px 권장)
- [ ] 구조화된 데이터 삽입 (WebSite, Organization, LocalBusiness)
- [ ] robots.txt 생성 및 업로드
- [ ] sitemap.xml 생성 및 업로드
- [ ] 모바일 반응형 디자인 확인
- [ ] HTTPS 적용
- [ ] 404 페이지 커스터마이징
- [ ] 페이지 로딩 속도 3초 이내
- [ ] 이미지 alt 텍스트 작성
- [ ] Google Search Console 등록
- [ ] Naver Search Advisor 등록

### 추가 최적화
- [ ] 이미지 lazy loading 적용
- [ ] WebP 이미지 포맷 변환
- [ ] Core Web Vitals 최적화 (LCP, FID, CLS)
- [ ] 내부 링크 구조 최적화
- [ ] 백링크 구축 전략 수립
- [ ] 콘텐츠 정기 업데이트 일정
- [ ] Google Analytics 설치
- [ ] Google My Business 등록 (지역 비즈니스)

### 성능 측정 도구
- Google PageSpeed Insights
- GTmetrix
- Lighthouse (Chrome DevTools)
- Google Search Console
- Naver Search Advisor

---

## 📋 사용 방법

1. **사용자 입력 섹션**의 모든 정보를 자신의 회사/사이트 정보로 교체
2. 각 섹션의 코드에서 `{변수명}`을 실제 값으로 치환
3. 생성된 코드를 웹사이트에 적용
4. 체크리스트를 따라 모든 항목 확인
5. 검색 엔진 등록 및 모니터링

## 💡 팁

- OG 이미지는 반드시 1200x630px로 제작
- 모든 이미지는 WebP 포맷으로 변환하여 용량 최적화
- 키워드는 자연스럽게 포함하되 과도한 반복 피하기
- 정기적으로 Search Console에서 성능 모니터링
- 콘텐츠는 최소 월 1회 이상 업데이트

## ⚠️ 주의사항

- 절대 키워드 스터핑(과도한 키워드 반복) 하지 않기
- 중복 콘텐츠 생성 금지
- 숨겨진 텍스트나 링크 사용 금지
- 자동 생성 콘텐츠 피하기
- 모든 이미지에 의미있는 alt 텍스트 필수

---

이 템플릿을 사용하면 어떤 웹사이트든 완벽한 SEO 최적화를 한번에 적용할 수 있습니다.