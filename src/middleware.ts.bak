import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = [
  'ko', 'en', 'ja', 'vi', 'ru', 'zh', 'zh-CN', 'zh-TW',
  'fr', 'de', 'es', 'pt', 'it', 'id', 'th', 'hi',
  'ar', 'tr', 'pl', 'uk'
]

// Get the preferred locale from headers
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || ''
  const detectedLocale = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].split('-')[0].trim())
    .find(lang => locales.includes(lang))

  return detectedLocale || 'ko' // Default to Korean
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // Redirect if there is no locale
  const locale = getLocale(request)
  const newUrl = new URL(`/${locale}${pathname}`, request.url)
  return NextResponse.redirect(newUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    '/((?!_next|api|android-chrome|apple-touch|favicon|test-|sitemap).*)',
  ],
}