import { MeSidebar } from "./_components/sidebar"

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="flex gap-6 py-6">
        <MeSidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}


