'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'
import { useMemo } from 'react'

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuthStore()

  // URL에서 현재 locale 추출
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

  // locale을 포함한 경로 생성 헬퍼 (모든 언어에 locale prefix 포함)
  const localePath = (path: string) => {
    return `/${currentLocale}${path}`
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('로그아웃되었습니다')
      router.replace(localePath('/'))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(message || '로그아웃에 실패했습니다')
    }
  }
  return (
    <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href={localePath('/')} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="lingoost logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="font-semibold">lingoost</span>
            </Link>
          </div>

          <nav className="flex-1 flex items-center justify-center gap-6 text-sm">
            <Link href={localePath('/company')} className="hover:text-primary">
              회사소개 {/* 회사소개 */}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href={localePath('/admin')} className="hidden sm:block">
              <Button variant="outline" size="sm">
                지식공유자 {/* 지식공유자 */}
              </Button>
            </Link>
            <LanguageSwitcher />
            <ModeToggle />
            {!user ? (
              <Link href={localePath('/login')}>
                <Button size="sm">로그인 {/* 로그인 */}</Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1">
                    <Avatar>
                      <AvatarImage src="/avatar.png" alt="profile" />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {user?.email || ''}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/me/profile')}>프로필 {/* 프로필 */}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/me/courses')}>내 강의 {/* 내 강의 */}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/me')}>대시보드 {/* 대시보드 */}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                    로그아웃 {/* 로그아웃 */}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}