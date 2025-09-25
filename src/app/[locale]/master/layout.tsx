'use client'

import { MasterSidebar } from './_components/sidebar'
import { MasterMobileSidebar } from './_components/mobile-sidebar'

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 px-4 h-14">
          <MasterMobileSidebar />
          <h1 className="font-semibold text-lg">최고 관리자</h1>
        </div>
      </div>

      <div className="flex">
        <MasterSidebar />

        <main className="flex-1 min-w-0">
          <div className="container max-w-6xl px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


