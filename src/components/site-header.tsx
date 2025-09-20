'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/stores/auth-store'
import { toast } from 'sonner'

export function SiteHeader() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('로그아웃되었습니다')
      router.replace('/')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(message || '로그아웃에 실패했습니다')
    }
  }
  return (
    <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="logo" width={24} height={24} />
              <span className="font-semibold">lingoost</span>
            </Link>
          </div>

          <nav className="flex-1 flex items-center justify-center gap-6 text-sm">
            <Link href="/company" className="hover:text-primary">
              회사소개
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/admin" className="hidden sm:block">
              <Button variant="outline" size="sm">
                지식공유자
              </Button>
            </Link>
            <LanguageSwitcher />
            <ModeToggle />
            {!user ? (
              <Link href="/login">
                <Button size="sm">로그인</Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1">
                    <Avatar>
                      <AvatarImage src="/avatar.png" alt="profile" />
                      <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {user?.email || ''}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/me/profile">프로필</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/me/courses">내 강의</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/me">대시보드</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
