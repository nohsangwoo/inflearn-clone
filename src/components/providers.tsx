"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" richColors duration={3000} />
    </ThemeProvider>
  )
}

export default Providers


