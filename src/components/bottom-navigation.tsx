"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Compass, GraduationCap } from "lucide-react"
import { getLocaleFromPath, withLocalePath } from "@/lib/brand"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Compass, label: "탐색", value: "home" },
  { href: "/me", icon: BookOpen, label: "내 학습", value: "me" },
  { href: "/admin", icon: GraduationCap, label: "판매자", value: "admin" },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const locale = getLocaleFromPath(pathname)
  const cleanPath = pathname.replace(`/${locale}`, "") || "/"

  function isActive(href: string) {
    if (href === "/") return cleanPath === "/" || cleanPath === ""
    return cleanPath.startsWith(href)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.value}
              href={withLocalePath(pathname, item.href)}
              prefetch={false}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active ? <span className="absolute top-0 h-0.5 w-12 rounded-b bg-primary" /> : null}
              <Icon className="size-5" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
