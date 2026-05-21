export const brand = {
  name: "링구스트",
  nameEn: "Lingoost",
  tagline: "배우고, 팔고, 끝까지 수강되는 온라인 강의 플랫폼",
  description:
    "링구스트는 강의를 판매하고 싶은 사람과 배우고 싶은 수강생을 연결하는 주식회사 럿지의 웹 우선 온라인 강의 플랫폼입니다. 시즌제 강의 모집, 계좌입금 수강신청, HLS 영상 수강, 자막, 더빙, 판매자 정산 흐름을 지원하며 LMS와 강의 플랫폼 제작 레퍼런스로도 활용됩니다.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://www.lingoost.com",
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || "https://storage.lingoost.com",
  creator: "주식회사 럿지",
  creatorEn: "LUDGI Inc.",
  legalName: "LUDGI Inc. (주식회사 럿지)",
  ceo: "노상우",
  founded: "2024",
  businessRegistrationNumber: "307-88-03283",
  dunsNumber: "963415644",
  supportEmail: "milli@molluhub.com",
  phone: "010-3006-9310",
  phoneInternational: "+82-10-3006-9310",
  address:
    "인천광역시 연수구 인천타워대로 323, 에이동 20층",
  companyUrl: "https://info.ludgi.ai/company",
}

export const supportedLocales = [
  "ko",
  "en",
  "ja",
  "vi",
  "ru",
  "zh",
  "zh-CN",
  "zh-TW",
  "fr",
  "de",
  "es",
  "pt",
  "it",
  "id",
  "th",
  "hi",
  "ar",
  "tr",
  "pl",
  "uk",
]

export function getLocaleFromPath(pathname: string) {
  const first = pathname.split("/").filter(Boolean)[0]
  return supportedLocales.includes(first) ? first : "ko"
}

export function withLocalePath(pathname: string, target: string) {
  const locale = getLocaleFromPath(pathname)
  const cleanPath = target.startsWith("/") ? target : `/${target}`
  return `/${locale}${cleanPath}`
}

export function withLoginRedirectPath(pathname: string, target: string) {
  const destination = withLocalePath(pathname, target)
  return `${withLocalePath(pathname, "/login")}?next=${encodeURIComponent(destination)}`
}

export function localizedLoginRedirectPath(locale: string, target: string) {
  const safeLocale = supportedLocales.includes(locale) ? locale : "ko"
  const cleanTarget = target.startsWith("/") ? target : `/${target}`
  const destination =
    cleanTarget === `/${safeLocale}` || cleanTarget.startsWith(`/${safeLocale}/`)
      ? cleanTarget
      : `/${safeLocale}${cleanTarget}`

  return `/${safeLocale}/login?next=${encodeURIComponent(destination)}`
}

export function toCdnUrl(value?: string | null) {
  if (!value) return null
  if (/^(https?:)?\/\//.test(value) || value.startsWith("/")) return value
  return `${brand.cdnUrl.replace(/\/$/, "")}/${value.replace(/^\//, "")}`
}
