'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bell, LayoutDashboard, Menu, Send } from 'lucide-react'
import { useState } from 'react'

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

export function MasterMobileSidebar({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const base = useLocaleBase()
  const navItems: NavItem[] = [
    { href: `${base}/master`, label: '대시보드', icon: LayoutDashboard },
    { href: `${base}/master/fcm`, label: 'FCM 발송', icon: Send },
    { href: `${base}/master/notifications`, label: '발송 이력', icon: Bell },
  ]
  return (
    <div className={cn('relative', className)}>
      <button className="p-2 -ml-2" onClick={() => setOpen((v) => !v)}>
        <Menu className="h-6 w-6" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-md border bg-background shadow">
          <nav className="flex flex-col py-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 text-sm',
                  pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  )
}

export default MasterMobileSidebar


