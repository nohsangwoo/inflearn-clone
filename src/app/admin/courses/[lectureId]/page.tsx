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
import { useState } from "react"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"

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
  Videos: Video[]
  Files: FileItem[]
}

type Video = {
  id: number
  title?: string | null
  description?: string | null
  videoUrl: string
  thumbnailUrl?: string | null
  duration?: number | null
}

type FileItem = {
  id: number
  url: string
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

  const createVideo = useMutation({
    mutationFn: async (payload: { curriculumSectionId: number; videoUrl: string; title?: string }) => {
      const { data } = await axios.post(`/api/admin/videos`, payload)
      return data as Video
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["curriculums", lectureIdNum] }),
  })

  const updateVideo = useMutation({
    mutationFn: async (payload: { id: number; title?: string; description?: string; thumbnailUrl?: string; language?: string; videoUrl?: string; duration?: number }) => {
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
                      <div key={sec.id}>
                        <div className="flex items-center p-3 gap-3">
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

                        <div className="p-3 space-y-4">
                          <div className="grid gap-2">
                            <label className="text-sm text-muted-foreground">수업 설명</label>
                            <textarea
                              defaultValue={sec.description ?? ""}
                              onBlur={(e) =>
                                updateSection.mutate({ sectionId: sec.id, description: e.target.value })
                              }
                              className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            />
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">강의 영상</div>
                              <VideoDropzone
                                onFiles={async (files) => {
                                  const file = files[0]
                                  if (!file) return
                                  try {
                                    const { key } = await uploadBinary(file, { pathPrefix: "videos", contentType: file.type })
                                    await createVideo.mutateAsync({ curriculumSectionId: sec.id, videoUrl: key, title: file.name })
                                    toast.success("영상 업로드 완료")
                                  } catch {
                                    toast.error("영상 업로드 실패")
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              {(sec.Videos ?? []).length === 0 ? (
                                <div className="text-sm text-muted-foreground">등록된 영상이 없습니다.</div>
                              ) : (
                                (sec.Videos ?? []).map((v) => {
                                  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
                                  const href = `${cdnBase}/${v.videoUrl}`
                                  return (
                                    <div key={v.id} className="flex items-center gap-2">
                                      <Input
                                        defaultValue={v.title ?? ""}
                                        onBlur={(e) => updateVideo.mutate({ id: v.id, title: e.target.value })}
                                      />
                                      <a href={href} target="_blank" rel="noreferrer" className="text-sm underline">
                                        보기
                                      </a>
                                      <Button
                                        variant="ghost"
                                        className="text-red-600"
                                        onClick={() => deleteVideo.mutate(v.id)}
                                      >
                                        삭제
                                      </Button>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">참고 자료</div>
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
                            </div>
                            <div className="space-y-2">
                              {(sec.Files ?? []).length === 0 ? (
                                <div className="text-sm text-muted-foreground">등록된 자료가 없습니다.</div>
                              ) : (
                                (sec.Files ?? []).map((f) => {
                                  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? "https://storage.lingoost.com"
                                  const href = `${cdnBase}/${f.url}`
                                  return (
                                    <div key={f.id} className="flex items-center gap-2">
                                      <a href={href} target="_blank" rel="noreferrer" className="text-sm underline truncate max-w-xs">
                                        {f.url}
                                      </a>
                                      <Button
                                        variant="ghost"
                                        className="text-red-600"
                                        onClick={() => deleteFileRec.mutate(f.id)}
                                      >
                                        삭제
                                      </Button>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          </div>
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

function VideoDropzone({ onFiles }: CommonDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    accept: { "video/*": [] },
    onDrop: (acceptedFiles) => onFiles(acceptedFiles),
  })
  return (
    <div
      {...getRootProps()}
      className={`border rounded px-3 py-2 text-sm cursor-pointer ${isDragActive ? "bg-accent" : "bg-background"}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? "여기에 파일을 놓으세요" : "영상 선택 또는 드래그앤드랍"}
    </div>
  )
}

function FileDropzone({ onFiles }: CommonDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => onFiles(acceptedFiles),
  })
  return (
    <div
      {...getRootProps()}
      className={`border rounded px-3 py-2 text-sm cursor-pointer ${isDragActive ? "bg-accent" : "bg-background"}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? "여기에 파일을 놓으세요" : "파일 선택 또는 드래그앤드랍"}
    </div>
  )
}



