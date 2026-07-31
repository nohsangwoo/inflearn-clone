import "server-only"

import { unstable_cache } from "next/cache"
import { and, asc, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm"
import { db, enrollmentRequests, lectures, likes, purchases, reviews, users } from "@/db"
import {
  getEnrollmentAvailability,
  type EnrollmentAvailabilityStatus,
} from "@/lib/enrollment-window"
import { getMockCoursesWithEnrollmentStatus } from "@/lib/mock-courses"

export const PUBLIC_COURSE_CATALOG_TAG = "public-course-catalog"

export type CourseCatalogSort = "latest" | "best" | "priceAsc" | "priceDesc"

export type PublicCourseCatalogItem = {
  id: number
  title: string
  slug: string | null
  shortDescription: string | null
  description: string | null
  category: string | null
  level: string | null
  tags: string[]
  price: number
  discountPrice: number | null
  imageUrl: string | null
  createdAt: string
  purchaseCount: number
  reviewCount: number
  avgRating: number
  likeCount: number
  enrollmentOpen: boolean
  enrollmentStartAt: string | null
  enrollmentEndAt: string | null
  enrollmentCapacity: number | null
  enrollmentAppliedCount: number
  enrollmentStatus: EnrollmentAvailabilityStatus
  enrollmentAvailable: boolean
  remainingSeats: number | null
  instructor: {
    nickname: string | null
    email: string | null
  }
}

export type PublicCourseCatalogResult = {
  page: number
  pageSize: number
  total: number
  items: PublicCourseCatalogItem[]
}

export type PublicCourseCatalogInput = {
  page?: number
  pageSize?: number
  sort?: string
  q?: string | null
  category?: string | null
}

type NormalizedCourseCatalogInput = {
  page: number
  pageSize: number
  sort: CourseCatalogSort
  q: string | null
  category: string | null
}

function normalizeCatalogInput(input: PublicCourseCatalogInput): NormalizedCourseCatalogInput {
  const rawSort = (input.sort ?? "latest").toLowerCase()
  const sort: CourseCatalogSort =
    rawSort === "best"
      ? "best"
      : rawSort === "priceasc"
        ? "priceAsc"
        : rawSort === "pricedesc"
          ? "priceDesc"
          : "latest"

  return {
    page: Math.max(1, Number(input.page ?? 1)),
    pageSize: Math.min(50, Math.max(1, Number(input.pageSize ?? 12))),
    sort,
    q: input.q?.trim() || null,
    category: input.category?.trim().toLowerCase() || null,
  }
}

async function queryPublicCourseCatalog(
  input: NormalizedCourseCatalogInput,
): Promise<PublicCourseCatalogResult> {
  const conditions = [eq(lectures.isActive, true)]

  if (input.q) {
    conditions.push(
      or(
        ilike(lectures.title, `%${input.q}%`),
        ilike(lectures.shortDescription, `%${input.q}%`),
        ilike(lectures.description, `%${input.q}%`),
        sql`${input.q} = ANY(${lectures.tags})`,
        sql`${input.q} = ANY(${lectures.seoKeywords})`,
      )!,
    )
  }

  if (input.category) {
    conditions.push(sql`lower(${lectures.category}) = ${input.category}`)
  }

  const where = and(...conditions)
  const purchaseCount = sql<number>`(
    select count(*)::int
    from ${purchases}
    where ${purchases.lectureId} = ${lectures.id}
  )`
  const reviewCount = sql<number>`(
    select count(*)::int
    from ${reviews}
    where ${reviews.lectureId} = ${lectures.id}
      and ${reviews.isDeleted} = false
      and ${isNull(reviews.parentId)}
  )`
  const avgRating = sql<number>`coalesce((
    select avg(${reviews.rating})::float8
    from ${reviews}
    where ${reviews.lectureId} = ${lectures.id}
      and ${reviews.isDeleted} = false
      and ${isNull(reviews.parentId)}
  ), 0)`
  const likeCount = sql<number>`(
    select count(*)::int
    from ${likes}
    where ${likes.lectureId} = ${lectures.id}
  )`
  const enrollmentAppliedCount = sql<number>`(
    select count(*)::int
    from ${enrollmentRequests}
    where ${enrollmentRequests.lectureId} = ${lectures.id}
      and ${enrollmentRequests.status} in ('AWAITING_PLATFORM_FEE', 'APPROVED')
  )`
  const effectivePrice = sql<number>`coalesce(${lectures.discountPrice}, ${lectures.price})`
  const orderBy = (() => {
    if (input.sort === "best") {
      return [desc(purchaseCount), desc(lectures.createdAt), desc(lectures.id)]
    }
    if (input.sort === "priceAsc") {
      return [asc(effectivePrice), asc(lectures.price), desc(lectures.id)]
    }
    if (input.sort === "priceDesc") {
      return [desc(effectivePrice), desc(lectures.price), desc(lectures.id)]
    }
    return [desc(lectures.createdAt), desc(lectures.id)]
  })()

  const [totalRows, rows] = await Promise.all([
    db.select({ total: count() }).from(lectures).where(where),
    db
      .select({
        id: lectures.id,
        title: lectures.title,
        slug: lectures.slug,
        shortDescription: lectures.shortDescription,
        description: lectures.description,
        category: lectures.category,
        level: lectures.level,
        tags: lectures.tags,
        price: lectures.price,
        discountPrice: lectures.discountPrice,
        enrollmentOpen: lectures.enrollmentOpen,
        enrollmentStartAt: lectures.enrollmentStartAt,
        enrollmentEndAt: lectures.enrollmentEndAt,
        enrollmentCapacity: lectures.enrollmentCapacity,
        isSeedData: lectures.isSeedData,
        enrollmentAppliedCount,
        imageUrl: lectures.imageUrl,
        createdAt: lectures.createdAt,
        instructorNickname: users.nickname,
        purchaseCount,
        reviewCount,
        avgRating,
        likeCount,
      })
      .from(lectures)
      .leftJoin(users, eq(lectures.instructorId, users.id))
      .where(where)
      .orderBy(...orderBy)
      .offset((input.page - 1) * input.pageSize)
      .limit(input.pageSize),
  ])

  return {
    page: input.page,
    pageSize: input.pageSize,
    total: Number(totalRows[0]?.total ?? 0),
    items: rows.map((row) => {
      const rawAvailability = getEnrollmentAvailability({
        ...row,
        enrollmentAppliedCount: Number(row.enrollmentAppliedCount ?? 0),
      })
      const availability =
        row.isSeedData &&
        rawAvailability.status === "CLOSED" &&
        typeof rawAvailability.capacity === "number"
          ? {
              ...rawAvailability,
              status: "FULL" as const,
              appliedCount: rawAvailability.capacity,
              remainingSeats: 0,
              isAvailable: false,
            }
          : rawAvailability

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        shortDescription: row.shortDescription,
        description: row.description,
        category: row.category,
        level: row.level,
        tags: row.tags,
        price: row.price,
        discountPrice: row.discountPrice,
        imageUrl: row.imageUrl,
        createdAt: row.createdAt.toISOString(),
        purchaseCount: Number(row.purchaseCount ?? 0),
        reviewCount: Number(row.reviewCount ?? 0),
        avgRating: Number(row.avgRating ?? 0),
        likeCount: Number(row.likeCount ?? 0),
        enrollmentOpen: row.enrollmentOpen,
        enrollmentStartAt: availability.startsAt,
        enrollmentEndAt: availability.endsAt,
        enrollmentCapacity: availability.capacity,
        enrollmentAppliedCount: availability.appliedCount,
        enrollmentStatus: availability.status,
        enrollmentAvailable: availability.isAvailable,
        remainingSeats: availability.remainingSeats,
        instructor: {
          nickname: row.instructorNickname,
          email: null,
        },
      }
    }),
  }
}

const getCachedPublicCourseCatalog = unstable_cache(
  queryPublicCourseCatalog,
  ["public-course-catalog-v1"],
  {
    revalidate: 60,
    tags: [PUBLIC_COURSE_CATALOG_TAG],
  },
)

export function getPublicCourseCatalog(input: PublicCourseCatalogInput = {}) {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_USE_LIVE_DATABASE !== "true"
  ) {
    return Promise.resolve(getDevelopmentPublicCourseCatalog(input))
  }
  return getCachedPublicCourseCatalog(normalizeCatalogInput(input))
}

export function getEmptyPublicCourseCatalog(
  input: PublicCourseCatalogInput = {},
): PublicCourseCatalogResult {
  const normalized = normalizeCatalogInput(input)
  return {
    page: normalized.page,
    pageSize: normalized.pageSize,
    total: 0,
    items: [],
  }
}

export function getDevelopmentPublicCourseCatalog(
  input: PublicCourseCatalogInput = {},
): PublicCourseCatalogResult {
  if (process.env.NODE_ENV === "production") {
    return getEmptyPublicCourseCatalog(input)
  }

  const normalized = normalizeCatalogInput(input)
  const query = normalized.q?.toLowerCase()
  const filtered = getMockCoursesWithEnrollmentStatus().filter((course) => {
    const categoryMatches =
      !normalized.category ||
      course.category.toLowerCase() === normalized.category
    const queryMatches =
      !query ||
      [
        course.title,
        course.shortDescription,
        course.description,
        ...course.tags,
        ...course.seoKeywords,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    return categoryMatches && queryMatches
  })

  filtered.sort((left, right) => {
    const leftPrice = left.discountPrice ?? left.price
    const rightPrice = right.discountPrice ?? right.price
    if (normalized.sort === "best") {
      return right.purchaseCount - left.purchaseCount || right.id - left.id
    }
    if (normalized.sort === "priceAsc") {
      return leftPrice - rightPrice || right.id - left.id
    }
    if (normalized.sort === "priceDesc") {
      return rightPrice - leftPrice || right.id - left.id
    }
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      || right.id - left.id
  })

  const start = (normalized.page - 1) * normalized.pageSize
  return {
    page: normalized.page,
    pageSize: normalized.pageSize,
    total: filtered.length,
    items: filtered.slice(start, start + normalized.pageSize).map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      description: course.description,
      category: course.category,
      level: course.level,
      tags: course.tags,
      price: course.price,
      discountPrice: course.discountPrice,
      imageUrl: course.imageUrl,
      createdAt: course.createdAt,
      purchaseCount: course.purchaseCount,
      reviewCount: course.reviewCount,
      avgRating: course.avgRating,
      likeCount: course.likeCount,
      enrollmentOpen: course.enrollmentOpen,
      enrollmentStartAt: course.enrollmentStartAt,
      enrollmentEndAt: course.enrollmentEndAt,
      enrollmentCapacity: course.enrollmentCapacity,
      enrollmentAppliedCount: course.enrollmentAppliedCount,
      enrollmentStatus: course.enrollmentStatus ?? "PAUSED",
      enrollmentAvailable: Boolean(course.enrollmentAvailable),
      remainingSeats: course.remainingSeats ?? null,
      instructor: {
        nickname: course.instructor.nickname,
        email: null,
      },
    })),
  }
}
