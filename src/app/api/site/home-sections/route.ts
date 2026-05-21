import { asc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db, siteSections } from "@/db"
import { defaultHomepageSections, normalizeHomepageSections, type HomepageSectionKey } from "@/lib/homepage-sections"

export async function GET() {
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
    .catch(() => [])

  const sections = normalizeHomepageSections(
    rows.map((row) => ({
      sectionKey: row.sectionKey as HomepageSectionKey,
      eyebrow: row.eyebrow ?? "",
      title: row.title,
      description: row.description ?? "",
      position: row.position,
      isEnabled: row.isEnabled,
      metadata: row.metadata,
    })),
  )

  return NextResponse.json({ sections: sections.length ? sections : defaultHomepageSections })
}
