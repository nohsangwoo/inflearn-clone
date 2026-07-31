import { redirect } from "next/navigation"
import { AdminSidebar } from './_components/sidebar'
import { AdminMobileSidebar } from './_components/mobile-sidebar'
import { localizedLoginRedirectPath } from "@/lib/brand"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { AlertTriangle, Database, RefreshCw } from "lucide-react"

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  let user: Awaited<ReturnType<typeof getAuthUserFromRequest>>
  try {
    user = await getAuthUserFromRequest()
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error
    console.error("[admin] Local authentication database is unavailable", error)
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-16">
        <section className="w-full rounded-[24px] border bg-card p-6 shadow-sm md:p-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
            <AlertTriangle className="size-6" />
          </div>
          <p className="editorial-label mt-6 text-primary">LOCAL SETUP REQUIRED</p>
          <h1 className="font-brand mt-3 text-balance text-3xl font-extrabold tracking-[-0.035em] md:text-4xl">
            공개 화면은 데모 데이터로 열렸지만, 관리자 화면은 실제 DB 연결이 필요합니다.
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
            현재 로컬 데이터베이스 인증에 실패했습니다. Neon에서 새 연결 문자열을 발급해
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-foreground">DATABASE_URL</code>
            과
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-foreground">DIRECT_URL</code>
            을 갱신한 뒤 개발 서버를 다시 시작해 주세요.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-[16px] border bg-background p-4">
              <Database className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-bold">1. 연결 정보 갱신</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  로컬 <code>.env</code>에 유효한 Neon pooled/direct URL을 저장합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-[16px] border bg-background p-4">
              <RefreshCw className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-bold">2. 마이그레이션 후 재시작</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  <code>pnpm db:migrate</code> 실행 후 <code>pnpm dev</code>를 다시 시작합니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

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
