import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const locales = [
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

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") || ""
  const detectedLocale = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].split("-")[0].trim())
    .find((lang) => locales.includes(lang))

  return detectedLocale || "ko"
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next()
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
