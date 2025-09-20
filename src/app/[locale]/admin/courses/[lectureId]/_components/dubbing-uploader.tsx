"use client"

import { useCallback, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { uploadBinary } from "@/lib/upload/uploadBinary"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import OriginalPlayer from "@/components/video/original-player"

type Props = { curriculumSectionId: number }

type DubbingLanguageCode =
  | "ar" | "bg" | "cs" | "da" | "de" | "el" | "en" | "es" | "fi" | "fr"
  | "he" | "hi" | "hu" | "id" | "it" | "ja" | "ko" | "ms" | "nl" | "no"
  | "pl" | "pt" | "ro" | "ru" | "sk" | "sv" | "th" | "tr" | "uk" | "vi"
  | "zh" | "fil"

const LABEL: Record<DubbingLanguageCode, string> = {
  ar: "아랍어", bg: "불가리아어", cs: "체코어", da: "덴마크어", de: "독일어",
  el: "그리스어", en: "영어", es: "스페인어", fi: "핀란드어", fr: "프랑스어",
  he: "히브리어", hi: "힌디어", hu: "헝가리어", id: "인도네시아어", it: "이탈리아어",
  ja: "일본어", ko: "한국어", ms: "말레이어", nl: "네덜란드어", no: "노르웨이어",
  pl: "폴란드어", pt: "포르투갈어", ro: "루마니아어", ru: "러시아어", sk: "슬로바키아어",
  sv: "스웨덴어", th: "태국어", tr: "터키어", uk: "우크라이나어", vi: "베트남어",
  zh: "중국어", fil: "필리핀어",
}

export default function DubbingUploader({ curriculumSectionId }: Props) {
  const qc = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedKey, setUploadedKey] = useState<string | null>(null)
  const [selected, setSelected] = useState<DubbingLanguageCode[]>([])
  const [videoCreated, setVideoCreated] = useState(false)

  // 기존 비디오 및 더빙 트랙 정보 수집
  const { existingLangs, existingVideo } = useMemo(() => {
    const all = qc.getQueryCache().findAll({ queryKey: ["curriculums"] })
    console.log("=== Query Cache Debug ===")
    console.log("All queries found:", all.length)

    const langs = new Set<string>()
    let video: { videoUrl?: string; title?: string | null } | null = null

    for (const q of all) {
      const data = q.state.data as unknown
      console.log("Query data:", data)

      if (!Array.isArray(data)) {
        console.log("Data is not array, skipping")
        continue
      }

      for (const cur of data) {
        console.log("Curriculum:", cur)
        for (const sec of (cur?.CurriculumSections ?? [])) {
          console.log(`Section ${sec?.id} vs curriculumSectionId ${curriculumSectionId}`)
          if (sec?.id !== curriculumSectionId) continue

          console.log("Found matching section! Videos:", sec?.Videos)
          for (const v of (sec?.Videos ?? [])) {
            // 첫 번째 비디오 정보를 저장
            if (!video && v?.videoUrl) {
              video = { videoUrl: v.videoUrl, title: v.title }
              console.log("Found video:", video)
            }
            for (const t of (v?.DubTrack ?? [])) {
              langs.add(String(t.lang))
              console.log("Found language:", t.lang)
            }
          }
        }
      }
      break
    }

    console.log("Final existingVideo:", video)
    console.log("Final existingLangs:", Array.from(langs))

    return {
      existingLangs: Array.from(langs) as DubbingLanguageCode[],
      existingVideo: video
    }
  }, [curriculumSectionId, qc])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      setProgress(0)
      setVideoCreated(false)
      setUploadedKey(null)

      // S3에 업로드
      const { key } = await uploadBinary(file, {
        pathPrefix: "videos",
        contentType: file.type,
        onProgress: ({ percent }) => setProgress(percent),
      })

      // Video 레코드 생성 (videoUrl에 저장)
      const res = await fetch('/api/admin/videos/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          curriculumSectionId,
          videoUrl: key,
          title: file.name.replace(/\.[^/.]+$/, '')
        })
      })

      if (!res.ok) {
        throw new Error('Video 레코드 생성 실패')
      }

      setUploadedKey(key)
      setVideoCreated(true)

      // curriculums 쿼리 새로고침
      await qc.invalidateQueries({ queryKey: ["curriculums"] })

      toast.success("영상 업로드가 완료되었습니다")
    } catch (e) {
      toast.error("영상 업로드 실패")
    } finally {
      setIsUploading(false)
    }
  }, [curriculumSectionId, qc])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ multiple: false, accept: { "video/*": [] }, onDrop })

  async function requestDubbing() {
    // 업로드된 비디오 또는 기존 비디오가 있는지 확인
    const videoUrl = uploadedKey || existingVideo?.videoUrl

    console.log("=== Dubbing Request Debug ===")
    console.log("uploadedKey:", uploadedKey)
    console.log("existingVideo:", existingVideo)
    console.log("videoUrl:", videoUrl)
    console.log("curriculumSectionId:", curriculumSectionId)
    console.log("selected languages:", selected)

    if (!videoUrl) {
      toast.error("먼저 영상을 업로드하세요")
      return
    }
    if (selected.length === 0) {
      toast.error("언어를 하나 이상 선택하세요")
      return
    }

    try {
      const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? 'https://storage.lingoost.com'
      const fullVideoUrl = videoUrl.startsWith('http') ? videoUrl : `${cdnBase}/${videoUrl}`

      console.log("fullVideoUrl:", fullVideoUrl)

      // 더빙 서버의 API 엔드포인트
      const dubbingServerUrl = process.env.NEXT_PUBLIC_DUBBING_SERVER || 'http://localhost:3500'
      const endpoint = `${dubbingServerUrl}/api/dubbing`

      const requestBody = {
        inputVideoUrl: fullVideoUrl,
        targetLanguages: selected,
        curriculumSectionId,
        sourceLanguage: "ko" // Korean as source language
      }

      console.log("Request endpoint:", endpoint)
      console.log("Request body:", JSON.stringify(requestBody, null, 2))

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const error = await res.text()
        toast.error(`더빙 요청 실패: ${error}`)
        return
      }

      toast.success("더빙 요청을 전송했습니다. 처리가 완료되면 언어별 트랙이 생성됩니다.")

      // 선택한 언어 초기화
      setSelected([])

      // 목록 새로고침(비동기): DubTrack 반영되면 화면 최신화
      void qc.invalidateQueries({ queryKey: ["curriculums"] })
    } catch (error) {
      toast.error(`더빙 요청 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }
  }

  // 현재 비디오 URL 결정 (업로드된 것 또는 기존 것)
  const currentVideoUrl = uploadedKey || existingVideo?.videoUrl
  const currentVideoTitle = existingVideo?.title

  return (
    <div className="space-y-4">
      {/* 1) 업로드 + 진행률 */}
      <div className="space-y-2">
        <div className="text-sm font-medium">영상 업로드</div>
        <div {...getRootProps()} className={`border rounded px-3 py-2 text-sm cursor-pointer ${isDragActive ? "bg-accent" : "bg-background"} ${isUploading ? "opacity-60 pointer-events-none" : ""}`}>
          <input {...getInputProps()} />
          {isDragActive ? "여기에 파일을 놓으세요" : (isUploading ? `업로드 중... ${progress}%` : (videoCreated ? "영상 업로드 완료 (다시 업로드)" : (existingVideo ? "기존 영상이 있습니다 (다시 업로드)" : "영상 선택 또는 드래그앤드랍")))}
        </div>
        {isUploading || uploadedKey ? (
          <div className="h-2 w-full bg-muted rounded">
            <div className="h-2 bg-primary rounded" style={{ width: `${progress}%`, transition: "width .2s" }} />
          </div>
        ) : null}

        {/* 원본 영상 재생 버튼 - 영상이 있을 때만 표시 */}
        {currentVideoUrl && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">원본 영상:</span>
            <OriginalPlayer videoUrl={currentVideoUrl} title={currentVideoTitle ?? undefined} />
          </div>
        )}
      </div>

      {/* 2) 언어 선택(추가할 언어) */}
      <div className="space-y-2">
        <div className="text-sm font-medium">번역할 언어 선택</div>
        {currentVideoUrl ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(Object.keys(LABEL) as DubbingLanguageCode[]).map(code => (
              <label key={code} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selected.includes(code)}
                  disabled={existingLangs.includes(code)}
                  onChange={(e) => {
                    setSelected(prev => e.target.checked ? [...prev, code] : prev.filter(c => c !== code))
                  }}
                />
                <span className="font-medium w-10">{code}</span>
                <span className={`text-muted-foreground ${existingLangs.includes(code) ? 'line-through' : ''}`}>
                  {LABEL[code]}{existingLangs.includes(code) ? ' (완료)' : ''}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">먼저 영상을 업로드하세요</div>
        )}
      </div>

      {/* 3) 요청 버튼 */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={requestDubbing}
          disabled={!currentVideoUrl || selected.length === 0}
        >
          번역 요청하기 {selected.length > 0 && `(${selected.length}개 언어)`}
        </Button>
        <Button type="button" variant="secondary" onClick={() => void qc.invalidateQueries({ queryKey: ["curriculums"] })}>
          상태 새로고침
        </Button>
      </div>
    </div>
  )
}