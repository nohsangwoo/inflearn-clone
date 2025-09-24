"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Apple } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"
import { getTranslation, useLocale } from "@/lib/translations"
import { useDeviceDetection } from "@/hooks/useDeviceDetection"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale(pathname)
  const t = getTranslation(locale).login
  const device = useDeviceDetection()

  const {
    user,
    isLoading,
    setLoading,
    loginWithEmailPassword,
    signUpWithEmailPassword,
    initialize,
  } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [confirmPassword, setConfirmPassword] = useState("")
  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  useEffect(() => {
    initialize()
  }, [initialize])

  // Expose Supabase client and native token handler for WebView bridge
  useEffect(() => {
    const supabase = createClient()
    ;(window as any).__supabase = supabase
    ;(window as any).supabase = supabase

    const consumePendingSession = async () => {
      try {
        const s = (window as any).__pendingSupabaseSession
        if (!s) return
        const { error } = await supabase.auth.setSession({
          access_token: s.access_token,
          refresh_token: s.refresh_token,
        })
        if (!error) {
          delete (window as any).__pendingSupabaseSession
          await useAuthStore.getState().initialize()
          router.replace('/')
        }
      } catch (e) {
        console.error('consumePendingSession failed', e)
      }
    }

    void consumePendingSession()
    const onPending = () => { void consumePendingSession() }
    window.addEventListener('pendingSupabaseSession', onPending)

    ;(window as any).handleGoogleSignInToken = async (payload: {
      success: boolean
      idToken?: string
      accessToken?: string
      user?: unknown
    }) => {
      if (!payload?.success) return
      try {
        if (payload.idToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: payload.idToken,
            access_token: payload.accessToken,
          } as any)
          if (!error) {
            await useAuthStore.getState().initialize()
            router.replace('/')
          }
        }
      } catch (e) {
        console.error('handleGoogleSignInToken failed', e)
      }
    }
    ;(window as any).handleAppleSignInToken = async (payload: {
      success: boolean
      idToken?: string
      authorizationCode?: string
    }) => {
      if (!payload?.success) return
      try {
        if (payload.idToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: payload.idToken,
          } as any)
          if (!error) {
            await useAuthStore.getState().initialize()
            router.replace('/')
          }
        }
      } catch (e) {
        console.error('handleAppleSignInToken failed', e)
      }
    }

    ;(window as any).receiveSupabaseSession = async (sessionData: {
      access_token: string
      refresh_token: string
    }) => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        })
        if (!error) {
          await useAuthStore.getState().initialize()
          router.replace('/')
        }
      } catch (e) {
        console.error('receiveSupabaseSession failed', e)
      }
    }
    return () => { window.removeEventListener('pendingSupabaseSession', onPending) }
  }, [router])

  // Android WebView 등에서 OAuth redirect 후 code 쿼리로 돌아온 경우, 클라이언트에서 직접 세션 교환
  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const error = url.searchParams.get('error')
        if (!code || error) return
        const supabase = (window as any).__supabase || createClient()
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code)
        if (!exErr) {
          await useAuthStore.getState().initialize()
          router.replace('/')
        }
      } catch (_) {}
    }
    run()
  }, [router])

  useEffect(() => {
    if (user) {
      router.replace("/")
    }
  }, [user, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError(t.errors.required) // "이메일과 비밀번호를 입력해 주세요"
      return
    }
    if (!isValidEmail(email)) {
      setError(t.errors.invalidEmail) // "올바른 이메일 형식이 아닙니다"
      return
    }
    if (password.length < 8) {
      setError(t.errors.passwordLength) // "비밀번호는 8자 이상이어야 합니다"
      return
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError(t.errors.passwordMismatch) // "비밀번호가 일치하지 않습니다"
      return
    }
    try {
      setLoading(true)
      if (mode === "login") {
        await loginWithEmailPassword(email, password)
        toast.success(t.success.login) // "로그인에 성공했습니다"
      } else {
        const { needsEmailVerification } = await signUpWithEmailPassword(
          email,
          password,
        )
        if (needsEmailVerification) {
          toast.success(t.success.emailVerification) // "확인 메일이 전송되었습니다. 메일함을 확인해 주세요."
        }
        if (!needsEmailVerification) {
          toast.success(t.success.signup) // "회원가입이 완료되었습니다"
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || (mode === "login" ? t.errors.loginFailed : t.errors.signupFailed)) // "로그인에 실패했습니다." : "회원가입에 실패했습니다."
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: "google" | "apple") => {
    try {
      setLoading(true)
      // 앱(WebView) 환경이면 네이티브 브리지 호출로 분기
      if (typeof window !== 'undefined') {
        const w = window as any
        const isWebView = device.isWebView || !!w.LingoostApp?.isWebView

        if (isWebView) {
          if (provider === 'google') {
            // webview_flutter: JavaScriptChannel("LingoostAuth") 사용
            if (w.LingoostAuth && typeof w.LingoostAuth.postMessage === 'function') {
              try {
                w.LingoostAuth.postMessage(JSON.stringify({ action: 'google' }))
                return
              } catch (_) {}
            }
            // flutter_inappwebview fallback
            if (w.flutter_inappwebview && typeof w.flutter_inappwebview.callHandler === 'function') {
              try {
                await w.flutter_inappwebview.callHandler('googleSignIn')
                return
              } catch (_) {}
            }
          }
          if (provider === 'apple') {
            // iOS WebView에서는 네이티브로 처리
            const isIOS = device?.isIOS || /\(i[^;]+;( U;)? CPU.+Mac OS X/.test(navigator.userAgent)
            if (isIOS) {
              if (w.LingoostAuth && typeof w.LingoostAuth.postMessage === 'function') {
                try {
                  w.LingoostAuth.postMessage(JSON.stringify({ action: 'apple' }))
                  return
                } catch (_) {}
              }
              if (w.flutter_inappwebview && typeof w.flutter_inappwebview.callHandler === 'function') {
                try {
                  await w.flutter_inappwebview.callHandler('appleSignIn')
                  return
                } catch (_) {}
              }
            }
            // Android WebView에서는 웹 OAuth로 진행 (네이티브 호출 안 함)
          }
        }
      }

      await useAuthStore.getState().loginWithOAuth(provider)
      // OAuth는 외부로 리다이렉트되므로 여기서 추가 동작 없음
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      toast.error(message || t.errors.socialLoginFailed) // "소셜 로그인에 실패했습니다"
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{mode === "login" ? t.login : t.signup}</h1> {/* "로그인" : "회원가입" */}
          <p className="text-sm text-muted-foreground">{t.subtitle}</p> {/* "계속하려면 아래 방법 중 하나를 선택하세요" */}
        </div>

        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => handleOAuth("google")}
            disabled={isLoading}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            {t.google} {/* "Google로 계속하기" */}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-center"
            onClick={() => handleOAuth("apple")}
            disabled={isLoading}
          >
            <Apple className="mr-2 h-4 w-4" />
            {t.apple} {/* "Apple로 계속하기" */}
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>{t.or}</span> {/* "또는" */}
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">{t.email}</label> {/* "이메일" */}
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={t.emailPlaceholder} // "you@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">{t.password}</label> {/* "비밀번호" */}
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={t.passwordPlaceholder} // "********"
              disabled={isLoading}
            />
          </div>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">{t.confirmPassword}</label> {/* "비밀번호 확인" */}
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={t.passwordPlaceholder} // "********"
                disabled={isLoading}
              />
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (mode === "login" ? t.loggingIn : t.signingUp) : (mode === "login" ? t.loginButton : t.signupButton)} {/* "로그인 중..." : "회원가입 중..." : "이메일로 로그인" : "이메일로 회원가입" */}
          </Button>
        </form>

        <div className="mt-3 text-center text-sm">
          {mode === "login" ? (
            <button
              type="button"
              className="text-primary underline underline-offset-4"
              onClick={() => setMode("signup")}
              disabled={isLoading}
            >
              {t.noAccount} {/* "계정이 없으신가요? 회원가입" */}
            </button>
          ) : (
            <button
              type="button"
              className="text-primary underline underline-offset-4"
              onClick={() => setMode("login")}
              disabled={isLoading}
            >
              {t.hasAccount} {/* "이미 계정이 있으신가요? 로그인" */}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
          {t.agreement} {/* "로그인 시 서비스 약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다." */}
        </p>
      </div>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.7-5.4 3.7-3.2 0-5.9-2.6-5.9-5.9s2.6-5.9 5.9-5.9c1.8 0 3 .7 3.7 1.4l2.5-2.5C16.9 3.3 14.7 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.7S6.9 21 12 21c6.9 0 9.6-4.8 9.6-7.2 0-.5 0-.9-.1-1.2H12z"/>
      <path fill="#34A853" d="M3.9 7.4l3.2 2.3c.9-2.6 3.1-4.1 4.9-4.1 1.8 0 3 .7 3.7 1.4l2.5-2.5C16.9 3.3 14.7 2.4 12 2.4 8.6 2.4 5.6 4.3 3.9 7.4z" opacity=".0"/>
      <path fill="#FBBC05" d="M12 21c2.7 0 4.9-.9 6.5-2.4l-3-2.5c-.8.6-1.9 1-3.5 1-2.7 0-5-1.8-5.8-4.2l-3.2 2.5C4.7 18.6 8 21 12 21z" opacity=".8"/>
      <path fill="#4285F4" d="M21.6 13.8c.1-.5.1-.9.1-1.2 0-.4 0-.8-.1-1.2H12v3.9h5.4c-.3 1.5-1.2 2.5-2.1 3.1l3 2.5c1.7-1.6 2.9-4 3.3-7.1z"/>
      <path fill="#34A853" d="M6.2 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9L3 7.6C2.3 9 2 10.3 2 12s.3 3 1 4.4l3.2-2.5z"/>
      <path fill="#FBBC05" d="M12 5.6c1.8 0 3 .7 3.7 1.4l2.5-2.5C16.9 3.3 14.7 2.4 12 2.4 8.6 2.4 5.6 4.3 3.9 7.4l3.2 2.3C8 7.1 9.9 5.6 12 5.6z"/>
    </svg>
  )
}