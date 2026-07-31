import "server-only"

import { unstable_cache } from "next/cache"
import { asc, eq } from "drizzle-orm"
import { db, siteSections } from "@/db"
import {
  defaultHomepageSections,
  normalizeHomepageSections,
  type HomepageSectionKey,
} from "@/lib/homepage-sections"

export const HOMEPAGE_SECTIONS_TAG = "homepage-sections"

const getCachedHomepageSections = unstable_cache(
  async () => {
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

    return sections.length ? sections : defaultHomepageSections
  },
  ["homepage-sections-v1"],
  {
    revalidate: 300,
    tags: [HOMEPAGE_SECTIONS_TAG],
  },
)

export async function getHomepageSections() {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_USE_LIVE_DATABASE !== "true"
  ) {
    return defaultHomepageSections
  }
  return getCachedHomepageSections().catch(() => defaultHomepageSections)
}
