"use client"

import { useCallback, useMemo, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { uploadBinary } from "@/lib/upload/uploadBinary"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

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
  
  const existingLangs = useMemo(() => {
    // curriculums 캐시에서 현재 섹션의 DubTrack 언어들을 수집
    const all = qc.getQueryCache().findAll({ queryKey: ["curriculums"] })
    const langs = new Set<string>()
    for (const q of all) {
      const data = q.state.data as Array<{ CurriculumSections?: Array<{ id: number; Videos?: Array<{ DubTrack?: Array<{ lang: string }> }> }> }> | undefined
      if (!Array.isArray(data)) continue
      for (const cur of data) {
        for (const sec of (cur?.CurriculumSections ?? [])) {
          if (sec?.id !== curriculumSectionId) continue
          for (const v of (sec?.Videos ?? [])) {
            for (const t of (v?.DubTrack ?? [])) langs.add(String(t.lang))
          }
        }
      }
      break
    }
    return Array.from(langs) as DubbingLanguageCode[]
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
    if (!uploadedKey || !videoCreated) {
      toast.error("먼저 영상을 업로드하세요")
      return
    }
    if (selected.length === 0) {
      toast.error("언어를 하나 이상 선택하세요")
      return
    }

    toast.info("더빙은 별도로 처리됩니다. 나중에 더빙 기능을 구현하세요.")

    // 더빙 서버가 구현되면 아래 주석을 해제하세요
    /*
    const cdnBase = process.env.NEXT_PUBLIC_CDN_URL ?? 'https://storage.lingoost.com'
    const uploadedUrl = `${cdnBase}/${uploadedKey}`
    const base = (process.env.NEXT_PUBLIC_DUBBING_SERVER || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "")
    const endpoint = `${base}/api/dubbing`

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ inputVideoUrl: uploadedUrl, targetLanguages: selected, curriculumSectionId }),
    })
    if (!res.ok) {
      toast.error("더빙 요청 실패")
      return
    }
    toast.success("더빙 요청을 전송했습니다")
    */

    // 목록 새로고침(비동기): DubTrack 반영되면 화면 최신화
    void qc.invalidateQueries({ queryKey: ["curriculums"] })
  }

  return (
    <div className="space-y-4">
      {/* 1) 업로드 + 진행률 */}
      <div className="space-y-2">
        <div className="text-sm font-medium">영상 업로드</div>
        <div {...getRootProps()} className={`border rounded px-3 py-2 text-sm cursor-pointer ${isDragActive ? "bg-accent" : "bg-background"} ${isUploading ? "opacity-60 pointer-events-none" : ""}`}>
          <input {...getInputProps()} />
          {isDragActive ? "여기에 파일을 놓으세요" : (isUploading ? `업로드 중... ${progress}%` : (videoCreated ? "영상 업로드 완료 (다시 업로드)" : "영상 선택 또는 드래그앤드랍"))}
        </div>
        {isUploading || uploadedKey ? (
          <div className="h-2 w-full bg-muted rounded">
            <div className="h-2 bg-primary rounded" style={{ width: `${progress}%`, transition: "width .2s" }} />
          </div>
        ) : null}
      </div>

      {/* 2) 언어 선택(추가할 언어) */}
      <div className="space-y-2">
        <div className="text-sm font-medium">언어 선택</div>
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
              <span className={`text-muted-foreground ${existingLangs.includes(code) ? 'line-through' : ''}`}>{LABEL[code]}{existingLangs.includes(code) ? ' (적용됨)' : ''}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3) 요청 버튼 */}
      <div className="flex gap-2">
        <Button type="button" onClick={requestDubbing} disabled={!videoCreated}>번역 요청하기</Button>
        <Button type="button" variant="secondary" onClick={() => void qc.invalidateQueries({ queryKey: ["curriculums"] })}>상태 새로고침</Button>
      </div>
    </div>
  )
}
