"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Bell, Heart, User, Library } from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/me", label: "대시보드", icon: LayoutDashboard },
  { href: "/me/profile", label: "프로필", icon: User },
  { href: "/me/courses", label: "내 강의", icon: Library },
  { href: "/me/notifications", label: "알림", icon: Bell },
  { href: "/me/likes", label: "좋아요", icon: Heart },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={
        `flex items-center gap-2 md:gap-3 rounded-md px-3 py-2 md:px-4 md:py-3 text-sm md:text-base transition-colors ` +
        (isActive
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground")
      }
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-4 w-4 md:h-5 md:w-5" />
      <span>{item.label}</span>
    </Link>
  )
}

export function MeSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 md:w-72 shrink-0 border-r bg-sidebar text-sidebar-foreground">
      <div className="h-14 md:h-16 flex items-center px-4 md:px-5 font-semibold md:text-lg">내 계정</div>
      <nav className="flex flex-col gap-1 md:gap-2 px-2 md:px-3 pb-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </nav>
    </aside>
  )
}

export default MeSidebar


