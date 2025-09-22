'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import { Smartphone } from 'lucide-react'
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
  const deviceInfo = useDeviceDetection()

  // URL에서 현재 locale 추출
  const currentLocale = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]
    const locales = [
      'ko',
      'en',
      'ja',
      'vi',
      'ru',
      'zh',
      'zh-CN',
      'zh-TW',
      'fr',
      'de',
      'es',
      'pt',
      'it',
      'id',
      'th',
      'hi',
      'ar',
      'tr',
      'pl',
      'uk',
    ]
    return locales.includes(firstSegment) ? firstSegment : 'ko'
  }, [pathname])

  // locale을 포함한 경로 생성 헬퍼 (모든 언어에 locale prefix 포함)
  const localePath = (path: string) => {
    // path가 이미 /로 시작하는지 확인
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `/${currentLocale}${cleanPath}`
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

  const showDeviceInfo = () => {
    const lingoostApp = (window as any).LingoostApp
    const message = `
📱 Device Detection Info:
• isWebView: ${deviceInfo.isWebView}
• isIOS: ${deviceInfo.isIOS}
• isIPad: ${deviceInfo.isIPad}
• isAndroid: ${deviceInfo.isAndroid}
• User Agent: ${navigator.userAgent.substring(0, 100)}...
• LingoostApp: ${lingoostApp ? JSON.stringify(lingoostApp, null, 2) : 'Not detected'}
    `.trim()

    console.log('[DeviceInfo]', {
      deviceInfo,
      lingoostApp,
      userAgent: navigator.userAgent
    })

    toast.info(message, {
      duration: 10000,
      style: {
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        fontSize: '12px',
        textAlign: 'left'
      }
    })
  }
  return (
    <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href={localePath('/')} className="flex items-center gap-2" prefetch={false}>
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

          <div className="flex-1"></div>

          <div className="flex items-center gap-2">
            {/* Device Info Test Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={showDeviceInfo}
              className="gap-1"
              title="Show Device Info"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Device</span>
            </Button>

            <LanguageSwitcher />
            <ModeToggle />
            {!user ? (
              <Link href={localePath('/login')} prefetch={false}>
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
                    <Link href={localePath('/me/profile')} prefetch={false}>
                      프로필 {/* 프로필 */}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/me/courses')} prefetch={false}>
                      내 강의 {/* 내 강의 */}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/me')} prefetch={false}>
                      대시보드 {/* 대시보드 */}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* 지식공유자 */}
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/admin')} prefetch={false}>
                      지식공유자 {/* 지식공유자 */}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/company')} prefetch={false}>
                      회사소개 {/* 회사소개 */}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/privacy')} prefetch={false}>
                      개인정보처리방침 {/* 개인정보처리방침 */}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={localePath('/terms')} prefetch={false}>
                      이용약관 {/* 이용약관 */}
                    </Link>
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
