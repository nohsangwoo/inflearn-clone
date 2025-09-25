'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bell, LayoutDashboard, Send } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

function useLocaleBase() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  const locales = ['ko','en','ja','vi','ru','zh','zh-CN','zh-TW','fr','de','es','pt','it','id','th','hi','ar','tr','pl','uk']
  const base = locales.includes(first) ? `/${first}` : ''
  return base
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors',
        isActive
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  )
}

export function MasterSidebar() {
  const pathname = usePathname()
  const base = useLocaleBase()
  const navItems: NavItem[] = [
    { href: `${base}/master`, label: '대시보드', icon: LayoutDashboard },
    { href: `${base}/master/fcm`, label: 'FCM 발송', icon: Send },
    { href: `${base}/master/notifications`, label: '발송 이력', icon: Bell },
  ]
  return (
    <aside className="hidden md:block w-72 shrink-0 border-r bg-background">
      <div className="h-16 flex items-center px-5 font-semibold text-lg border-b">
        최고 관리자
      </div>
      <nav className="flex flex-col gap-2 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </nav>
    </aside>
  )
}

export default MasterSidebar


