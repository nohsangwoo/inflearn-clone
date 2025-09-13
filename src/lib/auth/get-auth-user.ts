import { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import prisma from "@/lib/prismaClient"
import { cookies as nextCookies } from "next/headers"

export type DbUser = {
  id: number
  email: string
  supabaseId: string
}

/**
 * 현재 로그인한 유저의 Prisma User 레코드를 반환합니다.
 * - API Route에서는 NextRequest를 전달하세요.
 * - 서버 컴포넌트/라우트 핸들러 컨텍스트에서는 인자 없이 사용 가능합니다.
 * 로그인하지 않은 경우 null을 반환합니다.
 */
export async function getAuthUserFromRequest(request?: NextRequest): Promise<DbUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env missing")
  }

  const supabase = request
    ? createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // API Route에서 응답 쿠키 설정은 라우트 핸들러에서 처리
          },
        },
      })
    : createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          async getAll() {
            const store = await nextCookies()
            return store.getAll()
          },
          async setAll() {
            // 서버 컴포넌트 컨텍스트에서는 쿠키 설정 불가
          },
        },
      })

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) return null

  const supaUser = data.user
  const email = supaUser.email ?? ""

  const selectFields = { id: true, email: true, supabaseId: true } as const

  let dbUser = await prisma.user.findUnique({ where: { supabaseId: supaUser.id }, select: selectFields })
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        supabaseId: supaUser.id,
        email,
        isVerified: true,
      },
      select: selectFields,
    })
  } else if (email && dbUser.email !== email) {
    dbUser = await prisma.user.update({
      where: { supabaseId: supaUser.id },
      data: { email },
      select: selectFields,
    })
  } else {
    // ensure selected fields
    dbUser = await prisma.user.findUniqueOrThrow({
      where: { supabaseId: supaUser.id },
      select: selectFields,
    })
  }

  return dbUser as DbUser
}


