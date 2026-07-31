"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Compass, GraduationCap } from "lucide-react"
import { getLocaleFromPath, withLocalePath, withLoginRedirectPath } from "@/lib/brand"
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Compass, label: "탐색", value: "home", requiresAuth: false },
  { href: "/me", icon: BookOpen, label: "내 학습", value: "me", requiresAuth: true },
  { href: "/admin", icon: GraduationCap, label: "판매자", value: "admin", requiresAuth: true },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const locale = getLocaleFromPath(pathname)
  const cleanPath = pathname.replace(`/${locale}`, "") || "/"

  function isActive(href: string) {
    if (href === "/") return cleanPath === "/" || cleanPath === ""
    return cleanPath.startsWith(href)
  }

  return (
    <nav data-bottom-navigation className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="grid h-16 grid-cols-3 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const href = item.requiresAuth && !user
            ? withLoginRedirectPath(pathname, item.href)
            : withLocalePath(pathname, item.href)
          return (
            <Link
              key={item.value}
              href={href}
              prefetch={false}
              className={cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active ? <span className="absolute top-0 h-0.5 w-8 rounded-b bg-primary" /> : null}
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
