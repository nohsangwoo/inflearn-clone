"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

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

export default function NewCoursePage() {
  const qc = useQueryClient()
  const [lectureId, setLectureId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  // 최초 진입 시 임시 강의 생성 (없으면)
  useEffect(() => {
    if (lectureId !== null || creating) return
    setCreating(true)
    axios
      .post("/api/admin/courses", { title: "새 강의", price: 0 })
      .then((res) => setLectureId(res.data.id))
      .finally(() => setCreating(false))
  }, [lectureId, creating])

  const { data: curriculums } = useQuery({
    queryKey: ["curriculums", lectureId],
    queryFn: async () => {
      if (!lectureId) return [] as Curriculum[]
      const { data } = await axios.get(`/api/admin/curriculums/${lectureId}`)
      return data as Curriculum[]
    },
    enabled: !!lectureId,
  })

  const addCurriculum = useMutation({
    mutationFn: async (payload: { title?: string }) => {
      if (!lectureId) throw new Error("no lecture")
      const { data } = await axios.post(`/api/admin/curriculums/${lectureId}`, payload)
      return data as Curriculum
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureId] }),
  })

  const removeCurriculum = useMutation({
    mutationFn: async (curriculumId: number) => {
      if (!lectureId) throw new Error("no lecture")
      await axios.delete(`/api/admin/curriculums/${lectureId}/${curriculumId}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureId] }),
  })

  const addSection = useMutation({
    mutationFn: async (payload: { curriculumId: number; title?: string }) => {
      if (!lectureId) throw new Error("no lecture")
      const { data } = await axios.post(
        `/api/admin/curriculums/${lectureId}/sections`,
        payload
      )
      return data as CurriculumSection
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureId] }),
  })

  const updateSection = useMutation({
    mutationFn: async (
      payload: { sectionId: number; title?: string; isActive?: boolean }
    ) => {
      if (!lectureId) throw new Error("no lecture")
      const { sectionId, ...rest } = payload
      const { data } = await axios.patch(
        `/api/admin/curriculums/${lectureId}/sections/${sectionId}`,
        rest
      )
      return data as CurriculumSection
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureId] }),
  })

  const deleteSection = useMutation({
    mutationFn: async (sectionId: number) => {
      if (!lectureId) throw new Error("no lecture")
      await axios.delete(
        `/api/admin/curriculums/${lectureId}/sections/${sectionId}`
      )
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureId] }),
  })

  const disabled = lectureId == null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">새 강의 만들기</h1>
          <p className="text-sm text-muted-foreground mt-1">
            커리큘럼과 섹션을 추가/삭제하고 공개 상태를 조절하세요
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {lectureId ? `Lecture #${lectureId}` : "강의 생성 중..."}
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>커리큘럼</CardTitle>
          <Button
            size="sm"
            disabled={disabled || addCurriculum.isPending}
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
                    <div className="p-3 text-sm text-muted-foreground">
                      수업이 없습니다.
                    </div>
                  ) : (
                    cur.CurriculumSections.map((sec) => (
                      <div key={sec.id} className="flex items-center p-3 gap-3">
                        <Input
                          defaultValue={sec.title}
                          onBlur={(e) =>
                            updateSection.mutate({
                              sectionId: sec.id,
                              title: e.target.value,
                            })
                          }
                        />
                        <div className="ml-auto flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">공개</span>
                          <Switch
                            checked={sec.isActive}
                            onCheckedChange={(v: boolean) =>
                              updateSection.mutate({
                                sectionId: sec.id,
                                isActive: Boolean(v),
                              })
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


