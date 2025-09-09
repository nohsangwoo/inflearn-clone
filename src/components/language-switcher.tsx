"use client"

import { usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const locales = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
  { code: "zh-CN", label: "简体中文" },
  { code: "zh-TW", label: "繁體中文" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "th", label: "ไทย" },
  { code: "hi", label: "हिन्दी" },
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const currentLocale = useMemo(() => {
    const seg = pathname.split("/").filter(Boolean)[0]
    return locales.find((l) => l.code === seg)?.code ?? "ko"
  }, [pathname])

  function switchLocale(nextLocale: string) {
    if (nextLocale === currentLocale) return
    const parts = pathname.split("/")
    const first = parts[1] ?? ""
    const hasLocalePrefix = locales.some((l) => l.code === first)
    if (nextLocale === "ko") {
      const withoutPrefix = hasLocalePrefix ? ["", ...parts.slice(2)].join("/") || "/" : pathname
      router.push(withoutPrefix || "/")
    } else {
      const rest = hasLocalePrefix ? parts.slice(2).join("/") : parts.slice(1).join("/")
      const nextPath = "/" + [nextLocale, rest].filter(Boolean).join("/")
      router.push(nextPath)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm">
          {locales.find((l) => l.code === currentLocale)?.label ?? "한국어"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {locales.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => switchLocale(l.code)} data-state={l.code === currentLocale ? "checked" : undefined}>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


