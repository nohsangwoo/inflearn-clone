"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Apple } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
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

  useEffect(() => {
    if (user) {
      router.replace("/")
    }
  }, [user, router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해 주세요")
      return
    }
    if (!isValidEmail(email)) {
      setError("올바른 이메일 형식이 아닙니다")
      return
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다")
      return
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다")
      return
    }
    try {
      setLoading(true)
      if (mode === "login") {
        await loginWithEmailPassword(email, password)
        toast.success("로그인에 성공했습니다")
      } else {
        const { needsEmailVerification } = await signUpWithEmailPassword(
          email,
          password,
        )
        if (needsEmailVerification) {
          toast.success("확인 메일이 전송되었습니다. 메일함을 확인해 주세요.")
        }
        if (!needsEmailVerification) {
          toast.success("회원가입이 완료되었습니다")
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || (mode === "login" ? "로그인에 실패했습니다." : "회원가입에 실패했습니다."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{mode === "login" ? "로그인" : "회원가입"}</h1>
          <p className="text-sm text-muted-foreground">계속하려면 아래 방법 중 하나를 선택하세요</p>
        </div>

        <div className="mt-6 space-y-3">
          <Button variant="outline" className="w-full justify-center">
            <GoogleIcon className="mr-2 h-4 w-4" />
            Google로 계속하기
          </Button>
          <Button variant="outline" className="w-full justify-center">
            <Apple className="mr-2 h-4 w-4" />
            Apple로 계속하기
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>또는</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">이메일</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">비밀번호</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="********"
              disabled={isLoading}
            />
          </div>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="********"
                disabled={isLoading}
              />
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (mode === "login" ? "로그인 중..." : "회원가입 중...") : (mode === "login" ? "이메일로 로그인" : "이메일로 회원가입")}
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
              계정이 없으신가요? 회원가입
            </button>
          ) : (
            <button
              type="button"
              className="text-primary underline underline-offset-4"
              onClick={() => setMode("login")}
              disabled={isLoading}
            >
              이미 계정이 있으신가요? 로그인
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
          로그인 시 서비스 약관 및 개인정보 처리방침에 동의한 것으로 간주됩니다.
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


