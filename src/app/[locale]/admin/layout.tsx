import { redirect } from "next/navigation"
import { AdminSidebar } from './_components/sidebar'
import { AdminMobileSidebar } from './_components/mobile-sidebar'
import { localizedLoginRedirectPath } from "@/lib/brand"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getAuthUserFromRequest()

  if (!user) {
    redirect(localizedLoginRedirectPath(locale, "/admin"))
  }

  return (
    <div className="min-h-screen bg-secondary/45">
      <div className="sticky top-[72px] z-30 border-b border-border/80 bg-background/92 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-4 px-4 h-14">
          <AdminMobileSidebar />
          <h1 className="font-semibold text-lg">강의 제공자</h1>
        </div>
      </div>

      <div className="flex">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="container max-w-7xl px-4 py-8 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
