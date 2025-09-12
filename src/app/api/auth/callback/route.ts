import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import prisma from "@/lib/prismaClient"

export const dynamic = "force-dynamic"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/login?error=supabase_env", request.url))
  }

  // Determine final redirect target before creating the response
  const currentUrl = new URL(request.url)
  const redirectTo = currentUrl.searchParams.get("redirect_to")
  const target = new URL(redirectTo || "/", request.url)

  // We must set cookies on this response while exchanging code for a session
  const response = NextResponse.redirect(target)

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const code = currentUrl.searchParams.get("code")
  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=no_code`, request.url))
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(exchangeError.message)}`,
        request.url,
      ),
    )
  }

  const { data: userData, error: getUserError } = await supabase.auth.getUser()
  if (getUserError || !userData.user) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(getUserError?.message || "no_user")}`,
        request.url,
      ),
    )
  }

  const supabaseId = userData.user.id
  const email = userData.user.email ?? ""
  if (!email) {
    return NextResponse.redirect(
      new URL(`/login?error=missing_email`, request.url),
    )
  }

  try {
    // Ensure user exists in our DB (idempotent)
    await prisma.user.upsert({
      where: { supabaseId },
      create: {
        supabaseId,
        email,
        isVerified: true,
      },
      update: {
        email,
        isVerified: true,
      },
    })
  } catch (e) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("db_upsert_failed")}`,
        request.url,
      ),
    )
  }

  // Optional redirect target passthrough
  return response
}


