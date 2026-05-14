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
import { uploadBinary } from "@/lib/upload/uploadBinary"
import { toCdnUrl } from "@/lib/brand"
import { useState } from "react"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import DubbingUploader from "./_components/dubbing-uploader"
import HlsPlayerModal from "@/components/video/hls-player-modal"
import OriginalPlayer from "@/components/video/original-player"

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
  Videos: (Video & { DubTrack?: DubItem[] })[]
  Files: FileItem[]
}

type Video = {
  id: number
  title?: string | null
  description?: string | null
  videoUrl: string
  thumbnailUrl?: string | null
  duration?: number | null
  hlsStatus?: string
  hlsError?: string | null
  isFreePreview?: boolean
  CaptionTracks?: CaptionTrack[]
}

type DubItem = { id: string; lang: string; status: string; url?: string | null }
type CaptionTrack = { id: string; lang: string; label: string; url: string; format: string; isDefault: boolean }

type FileItem = {
  id: number
  url: string
}

function toDateTimeLocal(value?: string | Date | null) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return offsetDate.toISOString().slice(0, 16)
}

function fromDateTimeLocal(value: string) {
  return value ? new Date(value).toISOString() : null
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
      return data as {
        id: number
        title: string
        slug?: string | null
        shortDescription?: string | null
        description: string | null
        category?: string | null
        level?: string | null
        languageCode?: string | null
        tags?: string[]
        seoKeywords?: string[]
        targetAudience?: string | null
        requirements?: string | null
        learningOutcomes?: string[]
        metaTitle?: string | null
        metaDescription?: string | null
        ogImageUrl?: string | null
        canonicalUrl?: string | null
        enrollmentOpen: boolean
        enrollmentStartAt?: string | null
        enrollmentEndAt?: string | null
        enrollmentCapacity?: number | null
        price: number
        discountPrice?: number | null
        imageUrl?: string | null
        isActive: boolean
      }
    },
    enabled: Number.isFinite(lectureIdNum),
  })

  const updateLecture = useMutation({
    mutationFn: async (payload: Partial<{
      title: string
      slug: string
      shortDescription: string
      description: string
      category: string
      level: string
      languageCode: string
      tags: string[]
      seoKeywords: string[]
      targetAudience: string
      requirements: string
      learningOutcomes: string[]
      metaTitle: string
      metaDescription: string
      ogImageUrl: string
      canonicalUrl: string
      enrollmentOpen: boolean
      enrollmentStartAt: string | null
      enrollmentEndAt: string | null
      enrollmentCapacity: number | null
      price: number
      discountPrice: number | null
      imageUrl: string | null
      isActive: boolean
    }>) => {
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
      payload: { sectionId: number; title?: string; description?: string; isActive?: boolean }
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

  

  const updateVideo = useMutation({
    mutationFn: async (payload: { id: number; title?: string; description?: string; thumbnailUrl?: string; language?: string; videoUrl?: string; duration?: number; isFreePreview?: boolean }) => {
      const { id, ...rest } = payload
      const { data } = await axios.patch(`/api/admin/videos/${id}`, rest)
      return data as Video
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  const deleteVideo = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/admin/videos/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  const createFileRec = useMutation({
    mutationFn: async (payload: { curriculumSectionId: number; url: string }) => {
      const { data } = await axios.post(`/api/admin/files`, payload)
      return data as FileItem
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  const deleteFileRec = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/admin/files/${id}`)
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
              onBlur={(e) =>
                updateLecture.mutate(
                  { title: e.target.value },
                  {
                    onSuccess: () => toast.success("제목이 저장되었습니다"),
                    onError: () => toast.error("제목 저장 실패"),
                  },
                )
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">슬러그</label>
            <Input
              defaultValue={lecture?.slug ?? ""}
              placeholder="nextjs-hls-course"
              onBlur={(e) =>
                updateLecture.mutate(
                  { slug: e.target.value },
                  {
                    onSuccess: () => toast.success("슬러그가 저장되었습니다"),
                    onError: () => toast.error("슬러그 저장 실패"),
                  },
                )
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">한 줄 요약</label>
            <Input
              defaultValue={lecture?.shortDescription ?? ""}
              placeholder="검색 결과와 상세 상단에 노출될 짧은 설명"
              onBlur={(e) =>
                updateLecture.mutate(
                  { shortDescription: e.target.value },
                  {
                    onSuccess: () => toast.success("한 줄 요약이 저장되었습니다"),
                    onError: () => toast.error("한 줄 요약 저장 실패"),
                  },
                )
              }
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-muted-foreground">설명</label>
            <textarea
              defaultValue={lecture?.description ?? ""}
              onBlur={(e) =>
                updateLecture.mutate(
                  { description: e.target.value },
                  {
                    onSuccess: () => toast.success("설명이 저장되었습니다"),
                    onError: () => toast.error("설명 저장 실패"),
                  },
                )
              }
              className="min-h-24 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">카테고리</label>
              <Input
                defaultValue={lecture?.category ?? ""}
                placeholder="웹 개발"
                onBlur={(e) => updateLecture.mutate({ category: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">난이도</label>
              <Input
                defaultValue={lecture?.level ?? ""}
                placeholder="입문 / 중급 / 고급"
                onBlur={(e) => updateLecture.mutate({ level: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">대표 언어</label>
              <Input
                defaultValue={lecture?.languageCode ?? "ko"}
                placeholder="ko"
                onBlur={(e) => updateLecture.mutate({ languageCode: e.target.value || "ko" })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">태그</label>
              <Input
                defaultValue={(lecture?.tags ?? []).join(", ")}
                placeholder="Next.js, HLS, SEO"
                onBlur={(e) => updateLecture.mutate({ tags: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">SEO 키워드</label>
              <Input
                defaultValue={(lecture?.seoKeywords ?? []).join(", ")}
                placeholder="온라인 강의, 강의 판매, 웹 개발"
                onBlur={(e) => updateLecture.mutate({ seoKeywords: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">추천 대상</label>
              <textarea
                defaultValue={lecture?.targetAudience ?? ""}
                className="min-h-24 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                onBlur={(e) => updateLecture.mutate({ targetAudience: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">준비물/선수 지식</label>
              <textarea
                defaultValue={lecture?.requirements ?? ""}
                className="min-h-24 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                onBlur={(e) => updateLecture.mutate({ requirements: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">학습 결과</label>
              <textarea
                defaultValue={(lecture?.learningOutcomes ?? []).join("\n")}
                placeholder="줄바꿈으로 여러 개 입력"
                className="min-h-24 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                onBlur={(e) => updateLecture.mutate({ learningOutcomes: e.target.value.split("\n").map((v) => v.trim()).filter(Boolean) })}
              />
            </div>
          </div>
          <div className="rounded-[14px] border bg-background p-4">
            <div className="mb-3 text-sm font-medium">SEO 메타</div>
            <div className="grid gap-3">
              <Input
                defaultValue={lecture?.metaTitle ?? ""}
                placeholder="메타 타이틀"
                onBlur={(e) => updateLecture.mutate({ metaTitle: e.target.value })}
              />
              <Input
                defaultValue={lecture?.metaDescription ?? ""}
                placeholder="메타 설명"
                onBlur={(e) => updateLecture.mutate({ metaDescription: e.target.value })}
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  defaultValue={lecture?.ogImageUrl ?? ""}
                  placeholder="OG 이미지 URL 또는 S3 key"
                  onBlur={(e) => updateLecture.mutate({ ogImageUrl: e.target.value })}
                />
                <Input
                  defaultValue={lecture?.canonicalUrl ?? ""}
                  placeholder="Canonical URL"
                  onBlur={(e) => updateLecture.mutate({ canonicalUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">비공개</span>
            <Switch
              checked={!!lecture?.isActive}
              onCheckedChange={(v: boolean) =>
                updateLecture.mutate(
                  { isActive: Boolean(v) },
                  {
                    onSuccess: () => toast.success("공개 상태가 변경되었습니다"),
                    onError: () => toast.error("공개 상태 변경 실패"),
                  },
                )
              }
            />
            <span className="text-sm text-muted-foreground">공개</span>
          </div>

          <div className="rounded-[14px] border bg-background p-4">
            <div className="mb-3 text-sm font-medium">수강 모집 설정</div>
            <div className="grid gap-4 md:grid-cols-[160px_1fr_1fr_140px]">
              <label className="flex items-center gap-3">
                <Switch
                  checked={lecture?.enrollmentOpen ?? true}
                  onCheckedChange={(v: boolean) =>
                    updateLecture.mutate(
                      { enrollmentOpen: Boolean(v) },
                      {
                        onSuccess: () => toast.success("모집 상태가 저장되었습니다"),
                        onError: () => toast.error("모집 상태 저장 실패"),
                      },
                    )
                  }
                />
                <span className="text-sm text-muted-foreground">신청 오픈</span>
              </label>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">신청 시작</label>
                <Input
                  type="datetime-local"
                  key={`start-${lecture?.enrollmentStartAt ?? "empty"}`}
                  defaultValue={toDateTimeLocal(lecture?.enrollmentStartAt)}
                  onBlur={(e) => updateLecture.mutate({ enrollmentStartAt: fromDateTimeLocal(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">신청 마감</label>
                <Input
                  type="datetime-local"
                  key={`end-${lecture?.enrollmentEndAt ?? "empty"}`}
                  defaultValue={toDateTimeLocal(lecture?.enrollmentEndAt)}
                  onBlur={(e) => updateLecture.mutate({ enrollmentEndAt: fromDateTimeLocal(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground">모집 정원</label>
                <Input
                  type="number"
                  min={0}
                  key={`capacity-${lecture?.enrollmentCapacity ?? "empty"}`}
                  defaultValue={lecture?.enrollmentCapacity ?? ""}
                  placeholder="무제한"
                  onBlur={(e) => {
                    const value = e.target.value
                    updateLecture.mutate({ enrollmentCapacity: value === "" ? null : Number(value) })
                  }}
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              신청 기간이 지나거나 모집 정원이 차면 수강생에게 다음 신청 시기에 다시 신청하라는 안내가 표시됩니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">가격(₩)</label>
              <Input
                type="number"
                defaultValue={lecture?.price ?? 0}
                onBlur={(e) =>
                  updateLecture.mutate(
                    { price: Number(e.target.value || 0) },
                    {
                      onSuccess: () => toast.success("가격이 저장되었습니다"),
                      onError: () => toast.error("가격 저장 실패"),
                    },
                  )
                }
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
                  updateLecture.mutate(
                    { discountPrice: v === '' ? null : Number(v) },
                    {
                      onSuccess: () => toast.success("할인 가격이 저장되었습니다"),
                      onError: () => toast.error("할인 가격 저장 실패"),
                    },
                  )
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
                try {
                  const { key } = await uploadImageWebp(file, { pathPrefix: 'lectures', quality: 0.8, maxWidth: 1920 })
                  await updateLecture.mutateAsync({ imageUrl: key })
                  toast.success('대표 이미지가 업데이트되었습니다')
                } catch {
                  toast.error('대표 이미지 업로드 실패')
                } finally {
                  URL.revokeObjectURL(objectUrl)
                  setLocalPreviewUrl(null)
                }
              }} />
              {(() => {
                const src = localPreviewUrl ?? toCdnUrl(lecture?.imageUrl)
                return src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt="thumbnail" className="h-16 w-16 rounded-[14px] border object-cover" />
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
              <div key={cur.id} className="rounded-[14px] border">
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
                      <div key={sec.id} className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 좌측: 메타 정보 카드 */}
                          <Card>
                            <CardHeader className="space-y-1">
                              <CardTitle className="text-base">수업 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid gap-2">
                                <label className="text-xs text-muted-foreground">수업 제목</label>
                                <Input
                                  defaultValue={sec.title}
                                  onBlur={(e) =>
                                    updateSection.mutate(
                                      { sectionId: sec.id, title: e.target.value },
                                      {
                                        onSuccess: () => toast.success("수업 제목이 저장되었습니다"),
                                        onError: () => toast.error("수업 제목 저장 실패"),
                                      },
                                    )
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <label className="text-xs text-muted-foreground">수업 설명</label>
                                <textarea
                                  defaultValue={sec.description ?? ""}
                                  onBlur={(e) =>
                                    updateSection.mutate(
                                      { sectionId: sec.id, description: e.target.value },
                                      {
                                        onSuccess: () => toast.success("수업 설명이 저장되었습니다"),
                                        onError: () => toast.error("수업 설명 저장 실패"),
                                      },
                                    )
                                  }
                                  className="min-h-24 w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus:border-foreground"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">비공개</span>
                                <Switch
                                  checked={sec.isActive}
                                  onCheckedChange={(v: boolean) =>
                                    updateSection.mutate(
                                      { sectionId: sec.id, isActive: Boolean(v) },
                                      {
                                        onSuccess: () => toast.success("수업 공개 상태가 변경되었습니다"),
                                        onError: () => toast.error("수업 공개 상태 변경 실패"),
                                      },
                                    )
                                  }
                                />
                                <span className="text-xs text-muted-foreground">공개</span>
                                <Button
                                  variant="ghost"
                                  className="ml-auto text-destructive"
                                  onClick={async () => {
                                    try {
                                      await deleteSection.mutateAsync(sec.id)
                                      toast.success("수업이 삭제되었습니다")
                                    } catch {
                                      toast.error("수업 삭제 실패")
                                    }
                                  }}
                                >
                                  수업 삭제
                                </Button>
                              </div>
                            </CardContent>
                          </Card>

                          {/* 우측: 업로드 카드 (영상/자료) */}
                          <Card>
                            <CardHeader className="space-y-1">
                              <CardTitle className="text-base">업로드</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="space-y-2">
                                <div className="text-sm font-medium">강의 영상</div>
                                <p className="text-xs text-muted-foreground">MP4 등 동영상 파일을 선택하거나 드래그앤드랍하세요.</p>
                                <DubbingUploader curriculumSectionId={sec.id} />
                                <div className="space-y-2">
                                  {(sec.Videos ?? []).length === 0 ? (
                                    <div className="text-sm text-muted-foreground">등록된 영상이 없습니다.</div>
                                  ) : (
                                    (sec.Videos ?? []).map((v) => {
                                      return (
                                        <div key={v.id} className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Input
                                              defaultValue={v.title ?? ""}
                                              onBlur={(e) =>
                                                updateVideo.mutate(
                                                  { id: v.id, title: e.target.value },
                                                  {
                                                    onSuccess: () => toast.success("영상 제목이 저장되었습니다"),
                                                    onError: () => toast.error("영상 제목 저장 실패"),
                                                  },
                                                )
                                              }
                                            />
                                            <OriginalPlayer videoUrl={v.videoUrl} title={v.title ?? undefined} />
                                            <label className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs text-muted-foreground">
                                              <Switch
                                                checked={Boolean(v.isFreePreview)}
                                                onCheckedChange={(checked: boolean) =>
                                                  updateVideo.mutate(
                                                    { id: v.id, isFreePreview: checked },
                                                    {
                                                      onSuccess: () => toast.success("무료공개 설정이 저장되었습니다"),
                                                      onError: () => toast.error("무료공개 설정 저장 실패"),
                                                    },
                                                  )
                                                }
                                              />
                                              무료공개
                                            </label>
                                            <Button
                                              variant="ghost"
                                              className="text-destructive"
                                              onClick={async () => {
                                                try {
                                                  await deleteVideo.mutateAsync(v.id)
                                                  toast.success("영상이 삭제되었습니다")
                                                } catch {
                                                  toast.error("영상 삭제 실패")
                                                }
                                              }}
                                            >
                                              삭제
                                            </Button>
                                          </div>
                                          {/* DubTrack 상태 표시 */}
                                          <div className="text-xs">
                                            {Array.isArray((v as { DubTrack?: DubItem[] }).DubTrack) && (v as { DubTrack?: DubItem[] }).DubTrack!.length > 0 ? (
                                              <div className="flex flex-wrap gap-2">
                                                {(v as { DubTrack?: DubItem[] }).DubTrack!.map((t: DubItem) => (
                                                  <span key={t.id} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 ${t.status === 'ready' ? 'border-primary text-primary' : t.status === 'processing' ? 'border-foreground text-foreground' : t.status === 'failed' ? 'border-destructive text-destructive' : 'border-muted-foreground text-muted-foreground'}`}>
                                                    <span className="font-mono">{t.lang}</span>
                                                    <span>·</span>
                                                    <span>{t.status}</span>
                                                  </span>
                                                ))}
                                              </div>
                                            ) : (
                                              <span className="text-muted-foreground">더빙 트랙 없음</span>
                                            )}
                                          </div>
                                          <CaptionManager videoId={v.id} captions={v.CaptionTracks ?? []} />
                                          {/* HLS 미리보기 */}
                                          <HlsPlayerModal sectionId={sec.id} title={sec.title} />
                                        </div>
                                      )
                                    })
                                  )}
                                </div>
                              </div>

                              <Separator />

                              <div className="space-y-2">
                                <div className="text-sm font-medium">참고 자료</div>
                                <p className="text-xs text-muted-foreground">PDF/이미지/기타 파일을 선택하거나 드래그앤드랍하세요.</p>
                                <FileDropzone
                                  onFiles={async (files) => {
                                    const file = files[0]
                                    if (!file) return
                                    try {
                                      const { key } = await uploadBinary(file, { pathPrefix: "files", contentType: file.type })
                                      await createFileRec.mutateAsync({ curriculumSectionId: sec.id, url: key })
                                      toast.success("참고자료 업로드 완료")
                                    } catch {
                                      toast.error("참고자료 업로드 실패")
                                    }
                                  }}
                                />
                                <div className="space-y-2">
                                  {(sec.Files ?? []).length === 0 ? (
                                    <div className="text-sm text-muted-foreground">등록된 자료가 없습니다.</div>
                                  ) : (
                                    (sec.Files ?? []).map((f) => {
                                      const href = toCdnUrl(f.url) ?? ""
                                      return (
                                        <div key={f.id} className="flex items-center gap-2">
                                          <a href={href} target="_blank" rel="noreferrer" className="text-sm underline truncate max-w-xs">
                                            {f.url}
                                          </a>
                                          <Button
                                            variant="ghost"
                                            className="text-destructive"
                                            onClick={async () => {
                                              try {
                                                await deleteFileRec.mutateAsync(f.id)
                                                toast.success("참고자료가 삭제되었습니다")
                                              } catch {
                                                toast.error("참고자료 삭제 실패")
                                              }
                                            }}
                                          >
                                            삭제
                                          </Button>
                                        </div>
                                      )
                                    })
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
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

      {/* 드롭존 컴포넌트들 */}
      <VideoDropzoneDefinitions />
      <FileDropzoneDefinitions />
    </div>
  )
}
function VideoDropzoneDefinitions() { return null }
function FileDropzoneDefinitions() { return null }

type CommonDropzoneProps = { onFiles: (files: File[]) => Promise<void> | void }

function FileDropzone({ onFiles }: CommonDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => onFiles(acceptedFiles),
  })
  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border px-3 py-2 text-sm ${isDragActive ? "bg-accent" : "bg-background"}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? "여기에 파일을 놓으세요" : "파일 선택 또는 드래그앤드랍"}
    </div>
  )
}

function CaptionManager({ videoId, captions }: { videoId: number; captions: CaptionTrack[] }) {
  const qc = useQueryClient()
  const [lang, setLang] = useState("ko")
  const [label, setLabel] = useState("한국어")
  const [url, setUrl] = useState("")

  const addCaption = useMutation({
    mutationFn: async () => {
      if (!url.trim()) throw new Error("caption url required")
      const { data } = await axios.post(`/api/admin/videos/${videoId}/captions`, {
        lang,
        label,
        url,
        format: url.toLowerCase().endsWith(".srt") ? "srt" : "vtt",
        isDefault: false,
      })
      return data as CaptionTrack
    },
    onSuccess: async () => {
      setUrl("")
      await qc.invalidateQueries({ queryKey: ["curriculums"] })
      toast.success("자막이 등록되었습니다")
    },
    onError: () => toast.error("자막 등록 실패"),
  })

  const deleteCaption = useMutation({
    mutationFn: async (captionId: string) => {
      await axios.delete(`/api/admin/videos/${videoId}/captions/${captionId}`)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["curriculums"] })
      toast.success("자막이 삭제되었습니다")
    },
    onError: () => toast.error("자막 삭제 실패"),
  })

  return (
    <div className="rounded-[14px] border bg-background p-3">
      <div className="mb-2 text-sm font-medium">자막 트랙</div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[80px_120px_1fr_auto]">
        <Input value={lang} onChange={(e) => setLang(e.target.value)} placeholder="ko" />
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="한국어" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="VTT/SRT S3 key 또는 URL" />
        <Button type="button" variant="secondary" onClick={() => addCaption.mutate()} disabled={addCaption.isPending}>
          등록
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {captions.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            등록된 자막이 없습니다. 영상 자체에 자막이 박혀 있으면 등록하지 않아도 됩니다.
          </div>
        ) : (
          captions.map((caption) => (
            <div key={caption.id} className="flex items-center gap-2 text-xs">
              <span className="rounded-full border px-2.5 py-1 font-medium">{caption.label}</span>
              <span className="text-muted-foreground">{caption.lang} · {caption.format}</span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{caption.url}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => deleteCaption.mutate(caption.id)}
              >
                삭제
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
