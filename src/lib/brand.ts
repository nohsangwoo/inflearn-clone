export const brand = {
  name: "박살강의",
  nameEn: "Baksal Class",
  tagline: "배우고, 팔고, 끝까지 수강되는 강의 거래소",
  description:
    "박살강의는 판매자가 강의를 만들고 수강생이 결제 후 HLS 기반으로 학습하는 웹 우선 강의 교환 플랫폼입니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.baksalclass.com",
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || "https://storage.lingoost.com",
  creator: "주식회사 럿지",
  supportEmail: "contact@baksalclass.com",
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

export function toCdnUrl(value?: string | null) {
  if (!value) return null
  if (/^(https?:)?\/\//.test(value) || value.startsWith("/")) return value
  return `${brand.cdnUrl.replace(/\/$/, "")}/${value.replace(/^\//, "")}`
}
