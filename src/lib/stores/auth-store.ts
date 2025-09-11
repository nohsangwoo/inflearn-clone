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

      supabase.auth.onAuthStateChange((_event, session) => {
        const nextUser = session?.user
        set({
          user: nextUser
            ? { id: nextUser.id, email: nextUser.email ?? "" }
            : null,
        })
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
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
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error

      const needsEmailVerification = !data.session

      if (data.user && data.session) {
        set({ user: { id: data.user.id, email: data.user.email ?? "" } })
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


