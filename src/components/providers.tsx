"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

export function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const [queryClient] = useState(() => new QueryClient())
  useEffect(() => {
    initialize()
  }, [initialize])
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        <Toaster position="top-center" richColors duration={3000} />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default Providers


