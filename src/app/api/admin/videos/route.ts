import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"

// POST: 비디오 레코드 생성 (클라이언트에서 presign 업로드 완료 후 키 전달)
// body: { curriculumSectionId: number, videoUrl: string, title?: string, description?: string, thumbnailUrl?: string, language?: string }
export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const curriculumSectionId = Number(body?.curriculumSectionId)
  const videoUrl: string | undefined = body?.videoUrl // 업로드된 객체의 key 또는 절대 URL
  const targetLanguages: string[] | undefined = Array.isArray(body?.targetLanguages) ? body.targetLanguages : undefined

  if (!Number.isFinite(curriculumSectionId)) {
    return NextResponse.json({ message: "curriculumSectionId required" }, { status: 400 })
  }
  if (!videoUrl || typeof videoUrl !== "string") {
    return NextResponse.json({ message: "videoUrl required" }, { status: 400 })
  }

  // 소유권 확인: 섹션 → 커리큘럼 → 강의 → instructorId === user.id
  const can = await prisma.curriculumSection.findFirst({
    where: { id: curriculumSectionId, Curriculum: { Lecture: { instructorId: user.id } } },
    select: { id: true },
  })
  if (!can) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const dubbingServer = process.env.DUBBING_SERVER
  if (!dubbingServer) {
    return NextResponse.json({ message: "DUBBING_SERVER not configured" }, { status: 500 })
  }

  // key -> 절대 URL 변환 (이미 절대 URL이면 그대로 사용)
  const cdnBase = process.env.CDN_URL || process.env.NEXT_PUBLIC_CDN_URL || "https://storage.lingoost.com"
  const inputVideoUrl = /^(https?:)?\/\//.test(videoUrl) ? videoUrl : `${cdnBase.replace(/\/$/, "")}/${videoUrl.replace(/^\//, "")}`

  // 타겟 언어: 요청 바디 > 환경변수(DUBBING_LANGS=ko,en,ja) > 기본 en
  const envLangs = (process.env.DUBBING_LANGS ?? "").split(",").map(s => s.trim()).filter(Boolean)
  const langs = (targetLanguages && targetLanguages.length > 0) ? targetLanguages : (envLangs.length > 0 ? envLangs : ["en"])

  // 더빙 서버에 비동기 트리거 (응답 대기하지 않음)
  void fetch(`${dubbingServer.replace(/\/$/, "")}/api/dubbing`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ inputVideoUrl, targetLanguages: langs, curriculumSectionId }),
    // Next.js Edge/Node fetch는 기본 keepalive 지원. 에러는 무시하고 즉시 리턴
  }).catch(() => {})

  return NextResponse.json({ ok: true, queued: true }, { status: 202 })
}


