"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Bell, Heart, User, Library } from "lucide-react"
import { cn } from "@/lib/utils"

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
      className={cn(
        "flex items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors",
        isActive
          ? "bg-secondary text-secondary-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  )
}

export function MeSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block w-72 shrink-0 border-r bg-background">
      <div className="h-16 flex items-center px-5 font-semibold text-lg border-b">
        내 계정
      </div>
      <nav className="flex flex-col gap-2 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={pathname === item.href} />
        ))}
      </nav>
    </aside>
  )
}

export default MeSidebar
