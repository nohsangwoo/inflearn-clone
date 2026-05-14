import { NextRequest, NextResponse } from "next/server"
import { and, avg, count, countDistinct, eq, asc, inArray } from "drizzle-orm"
import { db, curriculumSections, curriculums, enrollmentRequests, lectures, likes, purchases, reviews, users, videos } from "@/db"
import { getEnrollmentAvailability } from "@/lib/enrollment-window"
import { findMockCourse } from "@/lib/mock-courses"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "invalid id" }, { status: 400 })
  }

  const mockCourse = findMockCourse(id)
  if (mockCourse) {
    const previewSection = mockCourse.sections.find((section) => section.isFreePreview && section.previewVideoUrl)
    return NextResponse.json({
      ...mockCourse,
      isMock: true,
      previewSectionId: previewSection?.id ?? null,
      previewSectionTitle: previewSection?.title ?? null,
    })
  }

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

  if (!lecture || !lecture.isActive) {
    return NextResponse.json({ message: "not found" }, { status: 404 })
  }

  const [ratingAgg, countRow, enrollmentRow, previewSection] = await Promise.all([
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
  ])

  // 간단 커리큘럼 요약 (최대 8개 섹션)
  const sectionRows = await db
    .select({
      id: curriculumSections.id,
      title: curriculumSections.title,
      description: curriculumSections.description,
      isActive: curriculumSections.isActive,
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
    .orderBy(asc(curriculumSections.id))
    .limit(24)

  const cdnBase = process.env.CDN_URL || process.env.NEXT_PUBLIC_CDN_URL || "https://storage.lingoost.com"
  const imageUrl = lecture.imageUrl
    ? /^(https?:)?\/\//.test(lecture.imageUrl)
      ? lecture.imageUrl
      : `${cdnBase.replace(/\/$/, "")}/${lecture.imageUrl}`
    : null
  const toPublicMediaUrl = (value?: string | null) => {
    if (!value) return null
    if (/^(https?:)?\/\//.test(value) || value.startsWith("/")) return value
    return `${cdnBase.replace(/\/$/, "")}/${value.replace(/^\//, "")}`
  }
  const availability = getEnrollmentAvailability({
    enrollmentOpen: lecture.enrollmentOpen,
    enrollmentStartAt: lecture.enrollmentStartAt,
    enrollmentEndAt: lecture.enrollmentEndAt,
    enrollmentCapacity: lecture.enrollmentCapacity,
    enrollmentAppliedCount: Number(enrollmentRow?.enrollmentAppliedCount ?? 0),
  })

  return NextResponse.json({
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
    createdAt: lecture.createdAt,
    instructor: lecture.instructor,
    purchaseCount: countRow?.purchaseCount ?? 0,
    reviewCount: ratingAgg?.reviewCount ?? 0,
    avgRating: Number(ratingAgg?.avgRating ?? 0),
    likeCount: countRow?.likeCount ?? 0,
    previewSectionId: previewSection?.id ?? null,
    previewSectionTitle: previewSection?.title ?? null,
    includedFeatures: [
      `${Math.max(1, Math.round(sectionRows.reduce((sum, section) => sum + Number(section.duration ?? 0), 0) / 3600))}시간 주문형 영상`,
      "계좌입금 승인 후 수강",
      "모바일/데스크톱 수강",
      "자막 및 참고 자료 지원",
    ],
    relatedTopics: lecture.tags,
    lastUpdatedAt: lecture.createdAt,
    sections: sectionRows.map((s) => ({
      id: s.id,
      moduleTitle: "Curriculum",
      title: s.title,
      description: s.description,
      active: s.isActive,
      hasVideo: Boolean(s.videoId),
      hlsStatus: s.hlsStatus ?? null,
      durationSeconds: s.duration ?? 0,
      isFreePreview: Boolean(s.isFreePreview),
      previewVideoUrl: s.isFreePreview
        ? s.hlsStatus === "READY"
          ? toPublicMediaUrl(s.masterKey)
          : toPublicMediaUrl(s.videoUrl)
        : null,
    })),
  })
}
