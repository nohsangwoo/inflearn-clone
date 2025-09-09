"use client"

import Link from "next/link"
import Image from "next/image"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function SiteHeader() {
  return (
    <header className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/vercel.svg" alt="logo" width={24} height={24} />
              <span className="font-semibold">Inflearn Clone</span>
            </Link>
          </div>

          <nav className="flex-1 flex items-center justify-center gap-6 text-sm">
            <Link href="#" className="hover:text-primary">강의</Link>
            <Link href="#" className="hover:text-primary">로드맵</Link>
            <Link href="#" className="hover:text-primary">커뮤니티</Link>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
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
                <div className="px-2 py-1.5 text-xs text-muted-foreground">my@email.com</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="#">프로필</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#">내 강의</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#">설정</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>로그아웃</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}


