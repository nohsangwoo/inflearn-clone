"use client"

import { create } from "zustand"
import { createClient } from "@/lib/supabase/client"

type AuthUser = {
  id: string
  email: string
  name?: string
} | null

type AuthState = {
  user: AuthUser
  isLoading: boolean
  setUser: (user: AuthUser) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  loginWithEmailPassword: (email: string, password: string) => Promise<void>
  signUpWithEmailPassword: (
    email: string,
    password: string,
  ) => Promise<{ needsEmailVerification: boolean }>
  loginWithOAuth: (provider: "google" | "apple") => Promise<void>
  logout: () => Promise<void>
}

const supabase = createClient()

// 인증된 세션이 있을 때 서버 DB에 사용자 레코드가 존재하도록 보장
const ensureUserOnServer = async () => {
  try {
    await fetch("/api/auth/ensure-user", { method: "POST" })
  } catch {
    // 네트워크 오류 시 다음 기회에 재시도
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    set({ isLoading: true })
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      set({
        user: user ? { id: user.id, email: user.email ?? "" } : null,
      })

      // 세션이 있다면 DB 사용자 보장 (이메일 인증된 사용자만 생성됨)
      if (user) {
        await ensureUserOnServer()
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        const nextUser = session?.user
        set({
          user: nextUser
            ? { id: nextUser.id, email: nextUser.email ?? "" }
            : null,
        })
        if (nextUser) {
          void ensureUserOnServer()
        }
      })
    } finally {
      set({ isLoading: false })
    }
  },

  loginWithEmailPassword: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      const user = data.user
      set({ user: user ? { id: user.id, email: user.email ?? "" } : null })
      if (user) {
        await ensureUserOnServer()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(message || "로그인에 실패했습니다")
    } finally {
      set({ isLoading: false })
    }
  },

  loginWithOAuth: async (provider: "google" | "apple") => {
    set({ isLoading: true })
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined
      const currentUrl = typeof window !== "undefined" ? window.location.href : undefined
      const callbackUrl = origin
        ? `${origin}/api/auth/callback${currentUrl ? `?redirect_to=${encodeURIComponent(currentUrl)}` : ""}`
        : undefined
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
        },
      })
      if (error) throw error
      // 성공 시 Supabase가 외부 인증 페이지로 리다이렉트합니다
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(message || "소셜 로그인을 시작하지 못했습니다")
    } finally {
      set({ isLoading: false })
    }
  },

  signUpWithEmailPassword: async (
    email: string,
    password: string,
  ) => {
    set({ isLoading: true })
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : undefined
      const currentUrl = typeof window !== "undefined" ? window.location.href : undefined
      const emailRedirectTo = origin
        ? `${origin}/api/auth/callback${currentUrl ? `?redirect_to=${encodeURIComponent(currentUrl)}` : ""}`
        : undefined
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      })
      if (error) throw error

      const needsEmailVerification = !data.session

      if (data.user && data.session) {
        set({ user: { id: data.user.id, email: data.user.email ?? "" } })
        await ensureUserOnServer()
      }

      return { needsEmailVerification }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(message || "회원가입에 실패했습니다")
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await supabase.auth.signOut()
      set({ user: null })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(message || "로그아웃에 실패했습니다")
    } finally {
      set({ isLoading: false })
    }
  },
}))


