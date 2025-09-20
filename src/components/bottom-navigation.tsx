'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, BookOpen } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
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
    return `/${currentLocale}${path}`
  }

  const isActive = (path: string) => {
    const fullPath = localePath(path)
    if (path === '/') {
      return pathname === fullPath
    }
    return pathname.startsWith(fullPath)
  }

  const navItems: NavItem[] = [
    {
      href: '/',
      icon: Home,
      label: '홈'
    },
    {
      href: '/admin',
      icon: BookOpen,
      label: '지식공유자'
    },
    {
      href: '/me',
      icon: User,
      label: '내 메뉴'
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-0 flex-1",
                "hover:bg-transparent hover:text-primary",
                "transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}
              asChild
            >
              <Link href={localePath(item.href)}>
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform",
                    active && "scale-110"
                  )}
                />
                <span className="text-xs font-medium">
                  {item.label}
                </span>
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}
