'use client'

import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { usePathname } from 'next/navigation'

function useCurrentLocale() {
  const pathname = usePathname()
  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const first = segments[0]
    const locales = ['ko','en','ja','vi','ru','zh','zh-CN','zh-TW','fr','de','es','pt','it','id','th','hi','ar','tr','pl','uk']
    return locales.includes(first) ? first : 'ko'
  }, [pathname])
}

export default function MasterFcmPage() {
  const locale = useCurrentLocale()
  const [mode, setMode] = useState<'unicast'|'broadcast'>('broadcast')
  const [userId, setUserId] = useState('')
  const [token, setToken] = useState('')
  const [title, setTitle] = useState('테스트 알림')
  const [body, setBody] = useState('FCM 발송 테스트 본문')
  const [data, setData] = useState('')
  const [onlyActive, setOnlyActive] = useState(true)
  const [platform, setPlatform] = useState('')
  const [foreground, setForeground] = useState(false)

  const sendMutation = useMutation({
    mutationFn: async () => {
      const parsedData = (() => {
        try { return data ? JSON.parse(data) : {} } catch { return {} }
      })()
      if (mode === 'unicast') {
        const payload: any = { title, body, data: parsedData, foreground }
        if (userId) payload.userId = Number(userId)
        if (token) payload.token = token
        return axios.post('/api/admin/fcm/unicast', payload)
      } else {
        const payload: any = { title, body, data: parsedData, onlyActive, foreground }
        if (platform) payload.platform = platform
        return axios.post('/api/admin/fcm/broadcast', payload)
      }
    }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">FCM 발송</h2>
      <div className="grid gap-4 max-w-2xl">
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode==='broadcast'} onChange={() => setMode('broadcast')} />
            브로드캐스트
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mode==='unicast'} onChange={() => setMode('unicast')} />
            유니캐스트
          </label>
        </div>

        {mode === 'unicast' && (
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">userId 또는 token</label>
            <div className="grid grid-cols-2 gap-3">
              <input className="border rounded px-3 py-2" placeholder="userId (숫자)" value={userId} onChange={(e)=>setUserId(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="token" value={token} onChange={(e)=>setToken(e.target.value)} />
            </div>
          </div>
        )}

        {mode === 'broadcast' && (
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onlyActive} onChange={(e)=>setOnlyActive(e.target.checked)} />
              활성 토큰만
            </label>
            <select className="border rounded px-3 py-2" value={platform} onChange={(e)=>setPlatform(e.target.value)}>
              <option value="">전체 플랫폼</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </div>
        )}

        <div className="grid gap-2">
          <label className="text-sm text-muted-foreground">제목</label>
          <input className="border rounded px-3 py-2" value={title} onChange={(e)=>setTitle(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-muted-foreground">본문</label>
          <textarea className="border rounded px-3 py-2" rows={4} value={body} onChange={(e)=>setBody(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-muted-foreground">데이터(JSON)</label>
          <textarea className="border rounded px-3 py-2" rows={4} placeholder='{"screen":"home"}' value={data} onChange={(e)=>setData(e.target.value)} />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={foreground} onChange={(e)=>setForeground(e.target.checked)} />
          앱 활성화중에도 배너 표시 요청
        </label>

        <div>
          <button
            className="inline-flex items-center gap-2 rounded bg-emerald-600 text-white px-4 py-2 disabled:opacity-60"
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending}
          >
            {sendMutation.isPending ? '전송 중...' : '전송하기'}
          </button>
          {sendMutation.isError && (
            <p className="text-sm text-red-600 mt-2">
              전송 실패: {(sendMutation.error as any)?.response?.data?.error || (sendMutation.error as any)?.response?.data?.message || 'unknown'}
            </p>
          )}
          {sendMutation.isSuccess && (
            <p className="text-sm text-emerald-600 mt-2">전송 완료</p>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">현재 언어: {locale}</p>
    </div>
  )
}


