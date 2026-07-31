import { NextRequest, NextResponse } from "next/server"
import { and, eq, inArray } from "drizzle-orm"
import { db, likes } from "@/db"
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user"
import {
  getEmptyPublicCourseCatalog,
  getDevelopmentPublicCourseCatalog,
  getPublicCourseCatalog,
  type PublicCourseCatalogInput,
} from "@/lib/course-catalog-data"
import { FIREBASE_AUTH_COOKIE } from "@/lib/firebase/session"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const input: PublicCourseCatalogInput = {
    page: Number(searchParams.get("page") || 1),
    pageSize: Number(searchParams.get("pageSize") || 12),
    sort: searchParams.get("sort") || "latest",
    q: searchParams.get("q"),
    category: searchParams.get("category"),
  }

  try {
    const [catalog, authUser] = await Promise.all([
      getPublicCourseCatalog(input),
      getAuthUserFromRequest(req).catch(() => null),
    ])

    const lectureIds = catalog.items.map((item) => item.id)
    const likedRows =
      authUser && lectureIds.length
        ? await db
            .select({ lectureId: likes.lectureId })
            .from(likes)
            .where(and(eq(likes.userId, authUser.id), inArray(likes.lectureId, lectureIds)))
        : []
    const likedLectureIds = new Set(
      likedRows
        .map((row) => row.lectureId)
        .filter((lectureId): lectureId is number => typeof lectureId === "number"),
    )

    const response = NextResponse.json({
      ...catalog,
      items: catalog.items.map((item) => ({
        ...item,
        liked: likedLectureIds.has(item.id),
      })),
    })
    const hasAuthCredential =
      req.headers.has("authorization") ||
      req.cookies.has(FIREBASE_AUTH_COOKIE)
    response.headers.set(
      "Cache-Control",
      hasAuthCredential
        ? "private, no-store"
        : "public, s-maxage=60, stale-while-revalidate=300",
    )
    return response
  } catch (error) {
    console.error("[courses] Failed to load public catalog", error)
    return NextResponse.json({
      ...(process.env.NODE_ENV === "production"
        ? getEmptyPublicCourseCatalog(input)
        : getDevelopmentPublicCourseCatalog(input)),
      degraded: true,
    })
  }
}
