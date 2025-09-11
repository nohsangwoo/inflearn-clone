"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"

export function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  useEffect(() => {
    initialize()
  }, [initialize])
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" richColors duration={3000} />
    </ThemeProvider>
  )
}

export default Providers


