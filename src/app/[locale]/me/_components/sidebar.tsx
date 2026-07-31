"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Bell, Heart, User, Library, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { withLocalePath } from "@/lib/brand"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/me", label: "대시보드", icon: LayoutDashboard },
  { href: "/me/profile", label: "프로필", icon: User },
  { href: "/me/courses", label: "내 강의", icon: Library },
  { href: "/me/enrollments", label: "수강 신청", icon: ClipboardList },
  { href: "/me/notifications", label: "알림", icon: Bell },
  { href: "/me/likes", label: "좋아요", icon: Heart },
]

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  const pathname = usePathname()
  return (
    <Link
      href={withLocalePath(pathname, item.href)}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-colors",
        isActive
          ? "bg-[#ff385c] text-white"
          : "text-[#aa9ea2] hover:bg-white/7 hover:text-white"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-[18px]" />
      <span>{item.label}</span>
    </Link>
  )
}

export function MeSidebar() {
  const pathname = usePathname()
  const cleanPath = pathname.replace(/^\/(ko|en|ja|vi|ru|zh|zh-CN|zh-TW|fr|de|es|pt|it|id|th|hi|ar|tr|pl|uk)/, "") || "/"

  return (
    <aside className="sticky top-[72px] hidden h-[calc(100dvh-72px)] w-64 shrink-0 border-r border-[#3b3236] bg-[#1b1719] text-white md:block">
      <div className="border-b border-[#3b3236] px-5 py-6">
        <p className="editorial-label text-[#ff8da1]">Learner space</p>
        <div className="font-brand mt-2 text-lg font-extrabold">내 학습</div>
      </div>
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} isActive={cleanPath === item.href} />
        ))}
      </nav>
    </aside>
  )
}

export default MeSidebar
