'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Banknote, Bell, BookOpen, LayoutDashboard, Send } from 'lucide-react'

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
        'flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors',
        isActive
          ? 'bg-[#ff385c] text-white'
          : 'text-[#aa9ea2] hover:bg-white/7 hover:text-white'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="size-[18px]" />
      <span>{item.label}</span>
    </Link>
  )
}

export function MasterSidebar() {
  const pathname = usePathname()
  const base = useLocaleBase()
  const navItems: NavItem[] = [
    { href: `${base}/master`, label: '대시보드', icon: LayoutDashboard },
    { href: `${base}/master/courses`, label: '강의 관리', icon: BookOpen },
    { href: `${base}/master/payouts`, label: '정산 관리', icon: Banknote },
    { href: `${base}/master/fcm`, label: 'FCM 발송', icon: Send },
    { href: `${base}/master/notifications`, label: '발송 이력', icon: Bell },
  ]
  return (
    <aside className="sticky top-[72px] hidden h-[calc(100dvh-72px)] w-64 shrink-0 border-r border-[#3b3236] bg-[#1b1719] text-white md:block">
      <div className="border-b border-[#3b3236] px-5 py-6">
        <p className="editorial-label text-[#ff8da1]">Operations</p>
        <div className="font-brand mt-2 text-lg font-extrabold">최고 관리자</div>
      </div>
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </nav>
    </aside>
  )
}

export default MasterSidebar
