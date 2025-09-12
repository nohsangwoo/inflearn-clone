import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import prisma from "@/lib/prismaClient"

export const runtime = "nodejs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: "supabase_env" }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true })

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

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 })
  }

  const user = data.user
  const email = user.email ?? ""
  if (!email) {
    return NextResponse.json({ ok: false, error: "missing_email" }, { status: 422 })
  }

  try {
    await prisma.user.upsert({
      where: { supabaseId: user.id },
      create: {
        supabaseId: user.id,
        email,
        isVerified: true,
      },
      update: {
        email,
        isVerified: true,
      },
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: "db_upsert_failed" }, { status: 500 })
  }

  return response
}


