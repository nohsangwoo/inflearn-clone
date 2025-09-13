"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { uploadImageWebp } from "@/lib/upload/uploadImageWebp"
import { useState } from "react"

type Curriculum = {
  id: number
  lectureId: number | null
  CurriculumSections: CurriculumSection[]
}

type CurriculumSection = {
  id: number
  title: string
  description: string | null
  isActive: boolean
}

export default function EditCoursePage() {
  const routeParams = useParams<{ lectureId: string }>()
  const lectureIdNum = Number(routeParams?.lectureId)
  const qc = useQueryClient()
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)

  const { data: lecture } = useQuery({
    queryKey: ["lecture", lectureIdNum],
    queryFn: async () => {
      const { data } = await axios.get(`/api/admin/courses/${lectureIdNum}`)
      return data as { id: number; title: string; description: string | null; price: number; discountPrice?: number | null; imageUrl?: string | null; isActive: boolean }
    },
    enabled: Number.isFinite(lectureIdNum),
  })

  const updateLecture = useMutation({
    mutationFn: async (payload: Partial<{ title: string; description: string; price: number; discountPrice: number | null; imageUrl: string | null; isActive: boolean }>) => {
      const { data } = await axios.patch(`/api/admin/courses/${lectureIdNum}`, payload)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lecture", lectureIdNum] }),
  })

  const { data: curriculums } = useQuery({
    queryKey: ["curriculums", lectureIdNum],
    queryFn: async () => {
      const { data } = await axios.get(`/api/admin/curriculums/${lectureIdNum}`)
      return data as Curriculum[]
    },
    enabled: Number.isFinite(lectureIdNum),
  })

  const addCurriculum = useMutation({
    mutationFn: async (payload: { title?: string }) => {
      const { data } = await axios.post(`/api/admin/curriculums/${lectureIdNum}`, payload)
      return data as Curriculum
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  const removeCurriculum = useMutation({
    mutationFn: async (curriculumId: number) => {
      await axios.delete(`/api/admin/curriculums/${lectureIdNum}/${curriculumId}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  const addSection = useMutation({
    mutationFn: async (payload: { curriculumId: number; title?: string }) => {
      const { data } = await axios.post(
        `/api/admin/curriculums/${lectureIdNum}/sections`,
        payload
      )
      return data as CurriculumSection
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  const updateSection = useMutation({
    mutationFn: async (
      payload: { sectionId: number; title?: string; isActive?: boolean }
    ) => {
      const { sectionId, ...rest } = payload
      const { data } = await axios.patch(
        `/api/admin/curriculums/${lectureIdNum}/sections/${sectionId}`,
        rest
      )
      return data as CurriculumSection
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  const deleteSection = useMutation({
    mutationFn: async (sectionId: number) => {
      await axios.delete(
        `/api/admin/curriculums/${lectureIdNum}/sections/${sectionId}`
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">강의 편집</h1>
          <p className="text-sm text-muted-foreground mt-1">
            기본 정보 수정 및 커리큘럼 관리
          </p>
        </div>
        <div className="text-sm text-muted-foreground">Lecture #{lectureIdNum}</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">제목</label>
            <Input
              defaultValue={lecture?.title ?? ""}
              onBlur={(e) => updateLecture.mutate({ title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">설명</label>
            <textarea
              defaultValue={lecture?.description ?? ""}
              onBlur={(e) => updateLecture.mutate({ description: e.target.value })}
              className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">비공개</span>
            <Switch
              checked={!!lecture?.isActive}
              onCheckedChange={(v: boolean) => updateLecture.mutate({ isActive: Boolean(v) })}
            />
            <span className="text-sm text-muted-foreground">공개</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">가격(₩)</label>
              <Input
                type="number"
                defaultValue={lecture?.price ?? 0}
                onBlur={(e) => updateLecture.mutate({ price: Number(e.target.value || 0) })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">할인 가격(₩)</label>
              <Input
                type="number"
                defaultValue={lecture?.discountPrice ?? ''}
                placeholder="미설정 시 비워두세요"
                onBlur={(e) => {
                  const v = e.target.value
                  updateLecture.mutate({ discountPrice: v === '' ? null : Number(v) })
                }}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">대표 이미지</label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const objectUrl = URL.createObjectURL(file)
                setLocalPreviewUrl(objectUrl)
                const { key } = await uploadImageWebp(file, { pathPrefix: 'lectures', quality: 0.8, maxWidth: 1920 })
                updateLecture.mutate({ imageUrl: key })
                URL.revokeObjectURL(objectUrl)
                setLocalPreviewUrl(null)
              }} />
              {(() => {
                const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? 'https://storage.lingoost.com'
                const src = localPreviewUrl ?? (lecture?.imageUrl ? `${cdnBase}/${lecture.imageUrl}` : null)
                return src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="thumbnail" className="h-16 w-16 rounded object-cover border" />
                ) : null
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>커리큘럼</CardTitle>
          <Button
            size="sm"
            disabled={addCurriculum.isPending}
            onClick={() => addCurriculum.mutate({ title: "새 섹션" })}
          >
            섹션 추가
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {(curriculums ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 섹션이 없습니다.</p>
          ) : (
            (curriculums ?? []).map((cur, idx) => (
              <div key={cur.id} className="rounded-md border">
                <div className="flex items-center justify-between p-3">
                  <div className="font-medium">섹션 {idx + 1}</div>
                  <div className="space-x-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeCurriculum.mutate(cur.id)}
                    >
                      섹션 삭제
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addSection.mutate({ curriculumId: cur.id })}
                    >
                      수업 추가
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="divide-y">
                  {cur.CurriculumSections.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">수업이 없습니다.</div>
                  ) : (
                    cur.CurriculumSections.map((sec) => (
                      <div key={sec.id} className="flex items-center p-3 gap-3">
                        <Input
                          defaultValue={sec.title}
                          onBlur={(e) =>
                            updateSection.mutate({ sectionId: sec.id, title: e.target.value })
                          }
                        />
                        <div className="ml-auto flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">공개</span>
                          <Switch
                            checked={sec.isActive}
                            onCheckedChange={(v: boolean) =>
                              updateSection.mutate({ sectionId: sec.id, isActive: Boolean(v) })
                            }
                          />
                          <Button
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => deleteSection.mutate(sec.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}


