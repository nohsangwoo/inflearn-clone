"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, BookOpen, Compass, GraduationCap, LogOut, ShieldCheck, User } from "lucide-react"
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
import { ModeToggle } from "@/components/mode-toggle"
import { brand, withLocalePath } from "@/lib/brand"
import { useAuthStore } from "@/lib/stores/auth-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const navItems = [
  { href: "/", label: "탐색", icon: Compass },
  { href: "/me", label: "내 학습", icon: BookOpen },
  { href: "/admin", label: "판매자", icon: GraduationCap },
  { href: "/master", label: "관리자", icon: ShieldCheck },
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
    <header className="sticky top-0 z-40 border-b bg-background/88 backdrop-blur supports-[backdrop-filter]:bg-background/72">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center gap-4">
          <Link href={withLocalePath(pathname, "/")} className="flex items-center gap-3" prefetch={false}>
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
              박
            </span>
            <span className="leading-tight">
              <span className="block text-base font-black">{brand.name}</span>
              <span className="hidden text-xs text-muted-foreground sm:block">Course exchange platform</span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
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
                    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                    active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex-1" />

          <div className="hidden items-center gap-2 sm:flex">
            <LanguageSwitcher />
            <ModeToggle />
          </div>

          {!user ? (
            <Button asChild size="sm">
              <Link href={withLocalePath(pathname, "/login")} prefetch={false}>
                로그인
              </Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-10 p-0">
                  <Avatar>
                    <AvatarImage src="/avatar.png" alt="profile" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
                <DropdownMenuSeparator />
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
                <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                  <LogOut className="size-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
