'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Switch } from '@/components/ui/switch'

export default function AdminCoursesPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['admin-lectures'],
    queryFn: async () => {
      const { data } = await axios.get('/api/admin/courses')
      return data as { id: number; title: string; price: number; isActive: boolean; imageUrl?: string | null }[]
    },
  })
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await axios.patch(`/api/admin/courses/${id}`,{ isActive })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-lectures'] }),
  })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">강의관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            강의 목록과 상태를 확인하고 관리하세요
          </p>
        </div>
        <Button
          size="sm"
          onClick={async () => {
            const { data: created } = await axios.post('/api/admin/courses', {
              title: '새 강의',
              price: 0,
            })
            router.push(`/admin/courses/${created.id}`)
          }}
        >
          새 강의 만들기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>강의 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>강의명</TableHead>
                <TableHead>이미지</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가격</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    강의가 없습니다. 우측 상단의 &quot;새 강의 만들기&quot; 버튼으로 시작하세요.
                  </TableCell>
                </TableRow>
              ) : (
                (data ?? []).map((lec) => (
                  <TableRow key={lec.id}>
                    <TableCell>{lec.title}</TableCell>
                    <TableCell>
                      {lec.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`${process.env.NEXT_PUBLIC_CDN_URL ?? 'https://storage.lingoost.com'}/${lec.imageUrl}`} alt="thumb" className="h-10 w-10 rounded object-cover border" />
                      ) : (
                        <div className="h-10 w-10 rounded border bg-muted" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">비공개</span>
                        <Switch checked={lec.isActive} onCheckedChange={(v: boolean) => toggleActive.mutate({ id: lec.id, isActive: Boolean(v) })} />
                        <span className="text-xs text-muted-foreground">공개</span>
                      </div>
                    </TableCell>
                    <TableCell>{`₩${lec.price.toLocaleString()}`}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/courses/${lec.id}`)}>
                        수정
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
