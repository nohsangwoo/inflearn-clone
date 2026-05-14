"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, GraduationCap, LogOut, Menu, PlayCircle, ShieldCheck, Sparkles, User, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { brand, withLocalePath } from "@/lib/brand"
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const navItems = [
  { href: "/", label: "강의", icon: PlayCircle, isNew: false },
  { href: "/admin", label: "스튜디오", icon: Video, isNew: true },
  { href: "/me", label: "학습", icon: Sparkles, isNew: true },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("로그아웃되었습니다")
      router.replace(withLocalePath(pathname, "/"))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(message || "로그아웃에 실패했습니다")
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Link href={withLocalePath(pathname, "/")} className="flex min-w-0 items-center gap-2" prefetch={false}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              박
            </span>
            <span className="truncate text-[18px] font-semibold text-primary">
              {brand.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const href = withLocalePath(pathname, item.href)
              const active =
                item.href === "/"
                  ? pathname === href || pathname === "/ko"
                  : pathname.startsWith(href)
              return (
                <Link
                  key={item.href}
                  href={href}
                  prefetch={false}
                  className={cn(
                    "relative inline-flex h-16 flex-col items-center justify-center gap-1 text-sm font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="relative grid size-8 place-items-center">
                    <Icon className="size-6" strokeWidth={1.8} />
                    {item.isNew ? (
                      <span className="absolute -right-4 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold leading-none text-primary-foreground">
                        NEW
                      </span>
                    ) : null}
                  </span>
                  <span>{item.label}</span>
                  {active ? <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-foreground" /> : null}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden rounded-full px-4 font-semibold lg:inline-flex">
              <Link href={withLocalePath(pathname, "/admin")} prefetch={false}>
                강의 판매하기
              </Link>
            </Button>
            <LanguageSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-full border-border px-3">
                  <Menu className="size-4" />
                  {user ? (
                    <Avatar className="size-7">
                      <AvatarImage src="/avatar.png" alt="profile" />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="size-5 rounded-full bg-accent p-1" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={withLocalePath(pathname, "/login")} prefetch={false}>
                        <User className="size-4" />
                        로그인
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link href={withLocalePath(pathname, "/me")} prefetch={false}>
                    <BarChart3 className="size-4" />
                    내 대시보드
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={withLocalePath(pathname, "/me/profile")} prefetch={false}>
                    <User className="size-4" />
                    프로필
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={withLocalePath(pathname, "/admin")} prefetch={false}>
                    <GraduationCap className="size-4" />
                    판매자 스튜디오
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={withLocalePath(pathname, "/master")} prefetch={false}>
                    <ShieldCheck className="size-4" />
                    최고 관리자
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user ? (
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                    <LogOut className="size-4" />
                    로그아웃
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
