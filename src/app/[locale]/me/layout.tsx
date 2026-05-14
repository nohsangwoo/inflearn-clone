import { redirect } from "next/navigation"
import { MeSidebar } from "./_components/sidebar"
import { MeMobileSidebar } from "./_components/mobile-sidebar"
import { localizedLoginRedirectPath } from "@/lib/brand"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

export default async function MeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getAuthUserFromRequest()

  if (!user) {
    redirect(localizedLoginRedirectPath(locale, "/me"))
  }

  return (
    <div className="min-h-screen">
      <div className="md:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 px-4 h-14">
          <MeMobileSidebar />
          <h1 className="font-semibold text-lg">내 계정</h1>
        </div>
      </div>

      <div className="flex">
        <MeSidebar />

        <main className="flex-1 min-w-0">
          <div className="container max-w-6xl px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
