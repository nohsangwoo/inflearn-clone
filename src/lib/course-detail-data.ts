import { cache } from "react"
import { and, asc, avg, count, countDistinct, eq, inArray } from "drizzle-orm"
import { db, curriculumSections, curriculums, enrollmentRequests, lectures, likes, purchases, reviews, users, videos } from "@/db"
import { getEnrollmentAvailability, type EnrollmentAvailabilityStatus } from "@/lib/enrollment-window"
import { findMockCourse } from "@/lib/mock-courses"

export type CourseDetail = {
  id: number
  title: string
  slug?: string | null
  shortDescription?: string | null
  description: string | null
  category?: string | null
  level?: string | null
  languageCode?: string | null
  tags?: string[]
  seoKeywords?: string[]
  targetAudience?: string | null
  requirements?: string | null
  learningOutcomes?: string[]
  metaTitle?: string | null
  metaDescription?: string | null
  ogImageUrl?: string | null
  canonicalUrl?: string | null
  price: number
  discountPrice?: number | null
  enrollmentOpen?: boolean
  enrollmentStartAt?: string | null
  enrollmentEndAt?: string | null
  enrollmentCapacity?: number | null
  enrollmentAppliedCount?: number | null
  enrollmentStatus?: EnrollmentAvailabilityStatus
  enrollmentAvailable?: boolean
  remainingSeats?: number | null
  imageUrl?: string | null
  createdAt: string
  instructor: {
    id: number
    email: string
    nickname?: string | null
    profileImageUrl?: string | null
  }
  purchaseCount: number
  reviewCount: number
  avgRating: number
  likeCount: number
  isMock?: boolean
  previewSectionId: number | null
  previewSectionTitle: string | null
  lastUpdatedAt?: string | null
  includedFeatures?: string[]
  relatedTopics?: string[]
  sections: {
    id: number
    moduleTitle?: string
    title: string
    description?: string | null
    active: boolean
    hasVideo: boolean
    hlsStatus?: string | null
    durationSeconds?: number | null
    isFreePreview?: boolean
    previewVideoUrl?: string | null
    resources?: string[]
  }[]
}

function toPublicMediaUrl(value?: string | null) {
  if (!value) return null
  if (/^(https?:)?\/\//.test(value) || value.startsWith("/")) return value
  const cdnBase = process.env.CDN_URL || process.env.NEXT_PUBLIC_CDN_URL || "https://storage.lingoost.com"
  return `${cdnBase.replace(/\/$/, "")}/${value.replace(/^\//, "")}`
}

export const getCourseDetail = cache(async (id: number): Promise<CourseDetail | null> => {
  if (!Number.isFinite(id)) return null
  const mockCourse = findMockCourse(id)

  const lecture = await db
    .select({
      id: lectures.id,
      title: lectures.title,
      slug: lectures.slug,
      shortDescription: lectures.shortDescription,
      description: lectures.description,
      category: lectures.category,
      level: lectures.level,
      languageCode: lectures.languageCode,
      tags: lectures.tags,
      seoKeywords: lectures.seoKeywords,
      targetAudience: lectures.targetAudience,
      requirements: lectures.requirements,
      learningOutcomes: lectures.learningOutcomes,
      metaTitle: lectures.metaTitle,
      metaDescription: lectures.metaDescription,
      ogImageUrl: lectures.ogImageUrl,
      canonicalUrl: lectures.canonicalUrl,
      price: lectures.price,
      discountPrice: lectures.discountPrice,
      enrollmentOpen: lectures.enrollmentOpen,
      enrollmentStartAt: lectures.enrollmentStartAt,
      enrollmentEndAt: lectures.enrollmentEndAt,
      enrollmentCapacity: lectures.enrollmentCapacity,
      imageUrl: lectures.imageUrl,
      createdAt: lectures.createdAt,
      updatedAt: lectures.updatedAt,
      isActive: lectures.isActive,
      instructor: {
        id: users.id,
        email: users.email,
        nickname: users.nickname,
        profileImageUrl: users.profileImageUrl,
      },
    })
    .from(lectures)
    .leftJoin(users, eq(lectures.instructorId, users.id))
    .where(eq(lectures.id, id))
    .limit(1)
    .then((rows) => rows[0])
    .catch(() => null)

  if (!lecture || !lecture.isActive) {
    if (!mockCourse) return null
    const previewSection = mockCourse.sections.find((section) => section.isFreePreview && section.previewVideoUrl)
    return {
      ...mockCourse,
      isMock: true,
      previewSectionId: previewSection?.id ?? null,
      previewSectionTitle: previewSection?.title ?? null,
    }
  }

  const [ratingAgg, countRow, enrollmentRow, previewSection, sectionRows] = await Promise.all([
    db
      .select({ avgRating: avg(reviews.rating), reviewCount: count(reviews.id) })
      .from(reviews)
      .where(and(eq(reviews.lectureId, id), eq(reviews.isDeleted, false)))
      .then((rows) => rows[0]),
    db
      .select({
        purchaseCount: countDistinct(purchases.id),
        likeCount: countDistinct(likes.id),
      })
      .from(lectures)
      .leftJoin(purchases, eq(purchases.lectureId, lectures.id))
      .leftJoin(likes, eq(likes.lectureId, lectures.id))
      .where(eq(lectures.id, id))
      .then((rows) => rows[0]),
    db
      .select({ enrollmentAppliedCount: count(enrollmentRequests.id) })
      .from(enrollmentRequests)
      .where(and(
        eq(enrollmentRequests.lectureId, id),
        inArray(enrollmentRequests.status, ["AWAITING_PLATFORM_FEE", "APPROVED"]),
      ))
      .then((rows) => rows[0]),
    db
      .select({ id: curriculumSections.id, title: curriculumSections.title })
      .from(curriculumSections)
      .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
      .innerJoin(videos, eq(videos.curriculumSectionId, curriculumSections.id))
      .where(and(eq(curriculums.lectureId, id), eq(videos.isFreePreview, true)))
      .orderBy(asc(curriculumSections.id))
      .limit(1)
      .then((rows) => rows[0]),
    db
      .select({
        id: curriculumSections.id,
        curriculumId: curriculums.id,
        moduleTitle: curriculumSections.moduleTitle,
        title: curriculumSections.title,
        description: curriculumSections.description,
        isActive: curriculumSections.isActive,
        position: curriculumSections.position,
        sectionDurationSeconds: curriculumSections.durationSeconds,
        resources: curriculumSections.resources,
        videoId: videos.id,
        videoTitle: videos.title,
        videoUrl: videos.videoUrl,
        masterKey: videos.masterKey,
        hlsStatus: videos.hlsStatus,
        duration: videos.duration,
        isFreePreview: videos.isFreePreview,
      })
      .from(curriculumSections)
      .innerJoin(curriculums, eq(curriculumSections.curriculumId, curriculums.id))
      .leftJoin(videos, eq(videos.curriculumSectionId, curriculumSections.id))
      .where(eq(curriculums.lectureId, id))
      .orderBy(asc(curriculums.id), asc(curriculumSections.position), asc(curriculumSections.id))
      .limit(240),
  ])

  const imageUrl = toPublicMediaUrl(lecture.imageUrl)
  const availability = getEnrollmentAvailability({
    enrollmentOpen: lecture.enrollmentOpen,
    enrollmentStartAt: lecture.enrollmentStartAt,
    enrollmentEndAt: lecture.enrollmentEndAt,
    enrollmentCapacity: lecture.enrollmentCapacity,
    enrollmentAppliedCount: Number(enrollmentRow?.enrollmentAppliedCount ?? 0),
  })

  return {
    id: lecture.id,
    title: lecture.title,
    slug: lecture.slug,
    shortDescription: lecture.shortDescription,
    description: lecture.description,
    category: lecture.category,
    level: lecture.level,
    languageCode: lecture.languageCode,
    tags: lecture.tags,
    seoKeywords: lecture.seoKeywords,
    targetAudience: lecture.targetAudience,
    requirements: lecture.requirements,
    learningOutcomes: lecture.learningOutcomes,
    metaTitle: lecture.metaTitle,
    metaDescription: lecture.metaDescription,
    ogImageUrl: lecture.ogImageUrl,
    canonicalUrl: lecture.canonicalUrl,
    price: lecture.price,
    discountPrice: lecture.discountPrice,
    enrollmentOpen: lecture.enrollmentOpen,
    enrollmentStartAt: availability.startsAt,
    enrollmentEndAt: availability.endsAt,
    enrollmentCapacity: availability.capacity,
    enrollmentAppliedCount: availability.appliedCount,
    enrollmentStatus: availability.status,
    enrollmentAvailable: availability.isAvailable,
    remainingSeats: availability.remainingSeats,
    imageUrl,
    createdAt: lecture.createdAt.toISOString(),
    instructor: {
      id: lecture.instructor?.id ?? 0,
      email: lecture.instructor?.email ?? "",
      nickname: lecture.instructor?.nickname,
      profileImageUrl: lecture.instructor?.profileImageUrl,
    },
    purchaseCount: countRow?.purchaseCount ?? 0,
    reviewCount: ratingAgg?.reviewCount ?? 0,
    avgRating: Number(ratingAgg?.avgRating ?? 0),
    likeCount: countRow?.likeCount ?? 0,
    previewSectionId: previewSection?.id ?? null,
    previewSectionTitle: previewSection?.title ?? null,
    includedFeatures: [
      `${Math.max(1, Math.round(sectionRows.reduce((sum, section) => sum + Number(section.duration ?? section.sectionDurationSeconds ?? 0), 0) / 3600))}시간 분량 커리큘럼`,
      `${sectionRows.length}개 수업`,
      "계좌입금 승인 후 수강",
      "모바일/데스크톱 수강",
      "자막 및 참고 자료 지원",
    ],
    relatedTopics: [...new Set([...(lecture.tags ?? []), ...(lecture.seoKeywords ?? [])])],
    lastUpdatedAt: (lecture.updatedAt ?? lecture.createdAt).toISOString(),
    sections: sectionRows.map((s) => ({
      id: s.id,
      moduleTitle: s.moduleTitle || "커리큘럼",
      title: s.title,
      description: s.description,
      active: s.isActive,
      hasVideo: Boolean(s.videoId),
      hlsStatus: s.hlsStatus ?? null,
      durationSeconds: s.duration ?? s.sectionDurationSeconds ?? 0,
      isFreePreview: Boolean(s.isFreePreview),
      previewVideoUrl: s.isFreePreview
        ? s.hlsStatus === "READY"
          ? toPublicMediaUrl(s.masterKey)
          : toPublicMediaUrl(s.videoUrl)
        : null,
      resources: s.resources,
    })),
  }
})
