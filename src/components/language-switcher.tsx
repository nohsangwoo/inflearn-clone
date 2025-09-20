"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocaleStore, type Locale } from "@/lib/stores/locale-store"

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
  const { locale: storedLocale, setLocale: setStoredLocale } = useLocaleStore()

  // URL에서 현재 locale 추출
  const currentLocale = useMemo(() => {
    const seg = pathname.split("/").filter(Boolean)[0]
    return locales.find((l) => l.code === seg)?.code ?? "ko"
  }, [pathname])

  // 페이지 로드시 저장된 locale이 있으면 해당 locale로 이동
  useEffect(() => {
    if (storedLocale && storedLocale !== currentLocale) {
      switchLocale(storedLocale, false) // 재귀 방지를 위해 store 업데이트 없이 이동
    }
  }, []) // 의도적으로 의존성 배열을 비워두어 초기 로드시에만 실행

  function switchLocale(nextLocale: string, updateStore = true) {
    if (nextLocale === currentLocale) return

    // store에 저장
    if (updateStore) {
      setStoredLocale(nextLocale as Locale)
    }

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
          <DropdownMenuItem
            key={l.code}
            onClick={() => switchLocale(l.code)}
            data-state={l.code === currentLocale ? "checked" : undefined}
          >
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}