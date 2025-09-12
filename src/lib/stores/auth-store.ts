'use client'

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

type AuthUser = {
  id: string
  email: string
  name?: string
} | null

type SignInResult = {
  success: boolean
  error?: string
  url?: string
}

type AuthState = {
  user: AuthUser
  isLoading: boolean
  error: string | null
  setUser: (user: AuthUser) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  loginWithEmailPassword: (email: string, password: string) => Promise<void>
  signUpWithEmailPassword: (
    email: string,
    password: string,
  ) => Promise<{ needsEmailVerification: boolean }>
  loginWithOAuth: (provider: 'google' | 'apple') => Promise<SignInResult>
  logout: () => Promise<void>
}

const supabase = createClient()

// 인증된 세션이 있을 때 서버 DB에 사용자 레코드가 존재하도록 보장
const ensureUserOnServer = async () => {
  try {
    await fetch('/api/auth/ensure-user', { method: 'POST' })
  } catch {
    // 네트워크 오류 시 다음 기회에 재시도
  }
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: user => set({ user }),
  setLoading: isLoading => set({ isLoading }),

  initialize: async () => {
    set({ isLoading: true })
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      set({
        user: user ? { id: user.id, email: user.email ?? '' } : null,
      })

      // 세션이 있다면 DB 사용자 보장 (이메일 인증된 사용자만 생성됨)
      if (user) {
        await ensureUserOnServer()
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        const nextUser = session?.user
        set({
          user: nextUser
            ? { id: nextUser.id, email: nextUser.email ?? '' }
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
      set({ user: user ? { id: user.id, email: user.email ?? '' } : null })
      if (user) {
        await ensureUserOnServer()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(message || '로그인에 실패했습니다')
    } finally {
      set({ isLoading: false })
    }
  },

  loginWithOAuth: async (provider: 'google' | 'apple'): Promise<SignInResult> => {
    try {
      set({ isLoading: true, error: null })
      
      // 개발 환경과 프로덕션 환경 구분 - 쿼리스트링 없이 깔끔한 콜백 URL 사용
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`
      
      console.log('OAuth Redirect URL:', redirectUrl) // 디버깅용
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) {
        set({ error: error.message, isLoading: false })
        return { success: false, error: error.message }
      }

      if (!data?.url) {
        const errorMsg = 'OAuth URL을 가져올 수 없습니다'
        set({ error: errorMsg, isLoading: false })
        return { success: false, error: errorMsg }
      }

      set({ isLoading: false })
      return { success: true, url: data.url }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'OAuth 로그인 중 오류가 발생했습니다'
      set({ error: errorMsg, isLoading: false })
      return { success: false, error: errorMsg }
    }
  },

  signUpWithEmailPassword: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      // 이메일 인증도 깔끔한 콜백 URL 사용
      const emailRedirectTo = typeof window !== 'undefined'
        ? `${window.location.origin}/api/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`
      
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
        set({ user: { id: data.user.id, email: data.user.email ?? '' } })
        await ensureUserOnServer()
      }

      return { needsEmailVerification }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(message || '회원가입에 실패했습니다')
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
      throw new Error(message || '로그아웃에 실패했습니다')
    } finally {
      set({ isLoading: false })
    }
  },
}))
