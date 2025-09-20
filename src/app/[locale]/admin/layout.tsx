'use client'

import dynamic from 'next/dynamic'

const AdminSidebar = dynamic(() => import('./_components/sidebar').then(mod => mod.AdminSidebar), {
  ssr: false,
  loading: () => <div className="w-64 md:w-72 shrink-0 border-r bg-sidebar animate-pulse" />
})

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="flex gap-6 py-6">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
