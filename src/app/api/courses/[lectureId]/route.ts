import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lectureId: string }> },
) {
  const { lectureId } = await params
  const id = Number(lectureId)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: "invalid id" }, { status: 400 })
  }

  const lecture = await prisma.lecture.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      discountPrice: true,
      imageUrl: true,
      createdAt: true,
      instructor: { select: { id: true, email: true, nickname: true, profileImageUrl: true } },
      isActive: true,
      _count: { select: { purchases: true, Reviews: true, Likes: true } },
    },
  })

  if (!lecture || !lecture.isActive) {
    return NextResponse.json({ message: "not found" }, { status: 404 })
  }

  const [ratingAgg, previewSection] = await Promise.all([
    prisma.review.aggregate({
      where: { lectureId: id, isDeleted: false },
      _avg: { rating: true },
      _count: { _all: true },
    }),
    prisma.curriculumSection.findFirst({
      where: { Curriculum: { lectureId: id }, Videos: { some: {} } },
      orderBy: { id: "asc" },
      select: { id: true, title: true },
    }),
  ])

  // 간단 커리큘럼 요약 (최대 8개 섹션)
  const sections = await prisma.curriculumSection.findMany({
    where: { Curriculum: { lectureId: id } },
    orderBy: { id: "asc" },
    take: 8,
    select: { id: true, title: true, description: true, isActive: true, Videos: { select: { id: true } } },
  })

  const cdnBase = process.env.CDN_URL || process.env.NEXT_PUBLIC_CDN_URL || "https://storage.lingoost.com"
  const imageUrl = lecture.imageUrl ? `${cdnBase.replace(/\/$/, "")}/${lecture.imageUrl}` : null

  return NextResponse.json({
    id: lecture.id,
    title: lecture.title,
    description: lecture.description,
    price: lecture.price,
    discountPrice: lecture.discountPrice,
    imageUrl,
    createdAt: lecture.createdAt,
    instructor: lecture.instructor,
    purchaseCount: lecture._count.purchases,
    reviewCount: ratingAgg._count?._all ?? lecture._count.Reviews,
    avgRating: ratingAgg._avg.rating ?? 0,
    likeCount: lecture._count.Likes,
    previewSectionId: previewSection?.id ?? null,
    previewSectionTitle: previewSection?.title ?? null,
    sections: sections.map((s) => ({ id: s.id, title: s.title, active: s.isActive, hasVideo: s.Videos.length > 0 })),
  })
}


