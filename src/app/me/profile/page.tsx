"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function MeProfilePage() {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.name ?? "")
  const [email] = useState(user?.email ?? "")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">프로필</h1>

      <Card>
        <CardHeader>
          <CardTitle>내 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="홍길동"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">이메일</label>
            <input
              value={email}
              disabled
              className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
            />
          </div>
          <div>
            <Button size="sm">프로필 저장</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">새 비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="********"
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">새 비밀번호 확인</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="********"
            />
          </div>
          <div>
            <Button size="sm" variant="secondary">변경하기</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계정 삭제</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">삭제 시 모든 데이터가 복구 불가합니다.</p>
          <Button size="sm" variant="destructive">계정 삭제</Button>
        </CardContent>
      </Card>
    </div>
  )
}


