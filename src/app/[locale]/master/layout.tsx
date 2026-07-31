'use client'

import { MasterSidebar } from './_components/sidebar'
import { MasterMobileSidebar } from './_components/mobile-sidebar'

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary/45">
      <div className="sticky top-[72px] z-30 border-b border-border/80 bg-background/92 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-4 px-4 h-14">
          <MasterMobileSidebar />
          <h1 className="font-semibold text-lg">최고 관리자</h1>
        </div>
      </div>

      <div className="flex">
        <MasterSidebar />

        <main className="min-w-0 flex-1">
          <div className="container max-w-7xl px-4 py-8 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

