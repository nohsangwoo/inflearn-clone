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
    <div className="min-h-screen">
      <div className="md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 px-4 h-14">
          <AdminMobileSidebar />
          <h1 className="font-semibold text-lg">강의 제공자</h1>
        </div>
      </div>

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 min-w-0">
          <div className="container max-w-6xl px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
