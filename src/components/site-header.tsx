"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowUpRight, BarChart3, GraduationCap, LogOut, Menu, ShieldCheck, User } from "lucide-react"
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
import { brand, withLocalePath, withLoginRedirectPath } from "@/lib/brand"
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const navItems = [
  { href: "/", label: "강의 탐색", isNew: false, requiresAuth: false },
  { href: "/admin", label: "크리에이터 스튜디오", isNew: true, requiresAuth: true },
  { href: "/me", label: "내 학습", isNew: false, requiresAuth: true },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading } = useAuthStore()
  const protectedHref = (target: string) =>
    user ? withLocalePath(pathname, target) : withLoginRedirectPath(pathname, target)

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
    <>
      <Link
        href="#main-content"
        className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform focus:translate-y-0"
      >
        본문으로 이동
      </Link>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 md:px-6">
          <div className="flex h-[72px] items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <Link href={withLocalePath(pathname, "/")} className="flex min-w-0 shrink-0 items-center gap-3" prefetch={false}>
            <Image
              src="/logo.png?v=lingoost-20260515"
              alt={`${brand.name} logo`}
              width={38}
              height={38}
              className="size-[38px] shrink-0 rounded-[10px]"
              priority
              unoptimized
            />
            <span className="min-w-0">
              <span className="font-brand block truncate text-[18px] font-extrabold leading-none text-foreground">
                {brand.name}
              </span>
              <span className="mt-1.5 hidden text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:block">
                Learning studio
              </span>
            </span>
          </Link>

          <nav className="hidden h-full items-center gap-8 lg:flex" aria-label="주요 메뉴">
            {navItems.map((item) => {
              const localizedHref = withLocalePath(pathname, item.href)
              const href = item.requiresAuth ? protectedHref(item.href) : localizedHref
              const active =
                item.href === "/"
                  ? pathname === localizedHref || pathname === "/ko"
                  : pathname.startsWith(localizedHref)
              return (
                <Link
                  key={item.href}
                  href={href}
                  prefetch={false}
                  className={cn(
                    "relative inline-flex h-full items-center gap-2 text-[13px] font-semibold transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>{item.label}</span>
                  {item.isNew ? (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-extrabold tracking-[0.12em] text-primary">
                      NEW
                    </span>
                  ) : null}
                  {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" /> : null}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center justify-end gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden rounded-full px-4 font-semibold sm:inline-flex">
              <Link href={protectedHref("/admin")} prefetch={false}>
                강의 판매하기
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="사용자 메뉴" className="h-11 rounded-full border-border bg-card px-3 shadow-2xs">
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
                  <Link href={protectedHref("/me")} prefetch={false}>
                    <BarChart3 className="size-4" />
                    내 대시보드
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={protectedHref("/me/profile")} prefetch={false}>
                    <User className="size-4" />
                    프로필
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={protectedHref("/admin")} prefetch={false}>
                    <GraduationCap className="size-4" />
                    판매자 스튜디오
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={protectedHref("/master")} prefetch={false}>
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
    </>
  )
}
