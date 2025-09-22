'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, BookOpen } from 'lucide-react'
import { useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}

export function BottomNavigation() {
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

  const localePath = (path: string) => {
    // path가 이미 /로 시작하는지 확인
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `/${currentLocale}${cleanPath}`
  }

  const getCurrentTab = () => {
    const cleanPath = pathname.replace(`/${currentLocale}`, '') || '/'
    if (cleanPath === '/' || cleanPath === '') return 'home'
    if (cleanPath.startsWith('/admin')) return 'admin'
    if (cleanPath.startsWith('/me')) return 'me'
    return 'home'
  }

  const navItems: NavItem[] = [
    {
      href: '/',
      icon: Home,
      label: '홈',
      value: 'home'
    },
    {
      href: '/admin',
      icon: BookOpen,
      label: '지식공유자',
      value: 'admin'
    },
    {
      href: '/me',
      icon: User,
      label: '내 메뉴',
      value: 'me'
    }
  ]

  return (
    <Tabs value={getCurrentTab()} className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <TabsList className="h-16 w-full rounded-none border-t bg-background grid grid-cols-3 p-0">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = getCurrentTab() === item.value

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              asChild
              className="h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none p-0"
            >
              <Link
                href={localePath(item.href)}
                prefetch={false}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 h-full w-full relative",
                  "transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-primary rounded-b-full" />
                )}
                <div className="flex flex-col items-center gap-0.5">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive && "scale-110"
                    )}
                  />
                  <span className={cn(
                    "text-[10px] transition-all duration-200",
                    isActive ? "font-semibold" : "font-medium"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
