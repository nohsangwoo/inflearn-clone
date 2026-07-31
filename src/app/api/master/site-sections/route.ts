import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { asc, eq, sql as drizzleSql } from "drizzle-orm"
import { db, siteSections } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import { defaultHomepageSections, type HomepageSection, type HomepageSectionKey } from "@/lib/homepage-sections"
import { HOMEPAGE_SECTIONS_TAG } from "@/lib/homepage-sections-data"

const editableKeys = new Set(defaultHomepageSections.map((section) => section.sectionKey))

type EditableSectionInput = {
  sectionKey?: unknown
  eyebrow?: unknown
  title?: unknown
  description?: unknown
  position?: unknown
  isEnabled?: unknown
}

function hasEditableSectionKey(section: EditableSectionInput): section is EditableSectionInput & { sectionKey: HomepageSectionKey } {
  return typeof section.sectionKey === "string" && editableKeys.has(section.sectionKey as HomepageSectionKey)
}

function mergeForEditing(rows: HomepageSection[]) {
  const byKey = new Map(defaultHomepageSections.map((section) => [section.sectionKey, section]))
  for (const row of rows) {
    if (editableKeys.has(row.sectionKey)) byKey.set(row.sectionKey, row)
  }
  return [...byKey.values()].sort((a, b) => a.position - b.position)
}

export async function GET(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const rows = await db
    .select({
      sectionKey: siteSections.sectionKey,
      eyebrow: siteSections.eyebrow,
      title: siteSections.title,
      description: siteSections.description,
      position: siteSections.position,
      isEnabled: siteSections.isEnabled,
      metadata: siteSections.metadata,
    })
    .from(siteSections)
    .where(eq(siteSections.area, "homepage"))
    .orderBy(asc(siteSections.position))

  return NextResponse.json({
    sections: mergeForEditing(
      rows.map((row) => ({
        sectionKey: row.sectionKey as HomepageSectionKey,
        eyebrow: row.eyebrow ?? "",
        title: row.title,
        description: row.description ?? "",
        position: row.position,
        isEnabled: row.isEnabled,
        metadata: row.metadata,
      })),
    ),
  })
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUserFromRequest(req)
  if (!user) return NextResponse.json({ message: "unauthenticated" }, { status: 401 })
  if (user.role !== "ADMIN") return NextResponse.json({ message: "forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const rawSections: EditableSectionInput[] = Array.isArray(body?.sections) ? body.sections : []
  if (!rawSections.length) {
    return NextResponse.json({ message: "sections required" }, { status: 400 })
  }

  const now = new Date()
  const values = rawSections
    .filter(hasEditableSectionKey)
    .map((section) => {
      const fallback = defaultHomepageSections.find((item) => item.sectionKey === section.sectionKey)!
      return {
        area: "homepage",
        sectionKey: section.sectionKey as HomepageSectionKey,
        eyebrow: typeof section.eyebrow === "string" ? section.eyebrow.slice(0, 120) : fallback.eyebrow,
        title: typeof section.title === "string" && section.title.trim() ? section.title.slice(0, 180) : fallback.title,
        description:
          typeof section.description === "string" ? section.description.slice(0, 800) : fallback.description,
        position: Number.isFinite(Number(section.position)) ? Math.floor(Number(section.position)) : fallback.position,
        isEnabled: typeof section.isEnabled === "boolean" ? section.isEnabled : fallback.isEnabled,
        metadata: fallback.metadata ?? null,
        createdAt: now,
        updatedAt: now,
      }
    })

  if (!values.length) return NextResponse.json({ message: "valid sections required" }, { status: 400 })

  await db
    .insert(siteSections)
    .values(values)
    .onConflictDoUpdate({
      target: [siteSections.area, siteSections.sectionKey],
      set: {
        eyebrow: drizzleSql`excluded."eyebrow"`,
        title: drizzleSql`excluded."title"`,
        description: drizzleSql`excluded."description"`,
        position: drizzleSql`excluded."position"`,
        isEnabled: drizzleSql`excluded."isEnabled"`,
        metadata: drizzleSql`excluded."metadata"`,
        updatedAt: now,
      },
    })

  revalidateTag(HOMEPAGE_SECTIONS_TAG, "max")
  const response = await GET(req)
  return response
}
