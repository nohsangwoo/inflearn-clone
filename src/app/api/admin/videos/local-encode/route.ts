import { NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { curriculumSections, curriculums, db, lectures } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import {
  DUBBING_LANGUAGE_CODES,
  type DubbingLanguageCode,
} from "@/lib/local-encoding/elevenlabs"
import { canRunLocalEncoding, runLocalEncoding } from "@/lib/local-encoding/processor"

export const runtime = "nodejs"

const LANGUAGE_SET = new Set<string>(DUBBING_LANGUAGE_CODES)

export async function POST(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const curriculumSectionId = Number(body?.curriculumSectionId)
  const force = body?.force === true

  if (!Number.isFinite(curriculumSectionId)) {
    return NextResponse.json({ message: "curriculumSectionId required" }, { status: 400 })
  }

  const targetLanguages = normalizeTargetLanguages(body?.targetLanguages)
  if (!targetLanguages) {
    return NextResponse.json({ message: "지원하지 않는 더빙 언어가 포함되어 있습니다" }, { status: 400 })
  }

  const canEncode = await canUserEncodeSection(curriculumSectionId, user)
  if (!canEncode) return NextResponse.json({ message: "forbidden" }, { status: 403 })

  if (!canRunLocalEncoding()) {
    return NextResponse.json(
      {
        message:
          "로컬 인코딩은 배포 환경에서 비활성화되어 있습니다. 프로젝트를 로컬에서 실행한 뒤 다시 시도하세요.",
      },
      { status: 409 },
    )
  }

  try {
    const result = await runLocalEncoding({
      curriculumSectionId,
      targetLanguages,
      force,
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "local encoding failed"
    return NextResponse.json({ message }, { status: 500 })
  }
}

function normalizeTargetLanguages(value: unknown): DubbingLanguageCode[] | null {
  const raw = Array.isArray(value) ? value : []
  const deduped = Array.from(new Set(raw.map((lang) => String(lang).trim()).filter(Boolean)))

  if (deduped.some((lang) => !LANGUAGE_SET.has(lang))) return null

  return deduped as DubbingLanguageCode[]
}

async function canUserEncodeSection(
  curriculumSectionId: number,
  user: { id: number; role: "ADMIN" | "STUDENT" | "TEACHER" },
) {
  const rows = await db
    .select({ id: curriculumSections.id })
    .from(curriculumSections)
    .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
    .innerJoin(lectures, eq(curriculums.lectureId, lectures.id))
    .where(
      user.role === "ADMIN"
        ? eq(curriculumSections.id, curriculumSectionId)
        : and(eq(curriculumSections.id, curriculumSectionId), eq(lectures.instructorId, user.id)),
    )
    .limit(1)

  return Boolean(rows[0])
}
