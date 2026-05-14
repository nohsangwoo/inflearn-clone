import { Metadata } from "next"
import { notFound } from "next/navigation"
import { brand } from "@/lib/brand"
import { getCourseDetail, type CourseDetail } from "@/lib/course-detail-data"
import { generateCourseJsonLd, generateSeoMetadata, siteConfig } from "@/lib/seo-metadata"
import CourseDetailPageWrapper from "./page-wrapper"

interface PageProps {
  params: Promise<{ locale: string; id: string }>
}

function unique(items: Array<string | null | undefined>) {
  return [...new Set(items.map((item) => item?.trim()).filter(Boolean) as string[])]
}

function buildCourseKeywords(course: CourseDetail) {
  return unique([
    course.title,
    course.category,
    course.level,
    ...(course.tags ?? []),
    ...(course.seoKeywords ?? []),
    "링구스트",
    "Lingoost",
    "주식회사 럿지",
    "온라인 강의",
    "강의 판매",
    "강의 판매 플랫폼",
    "강의 등록",
    "강의자 모집",
    "시즌제 강의",
    "수강 신청",
    "계좌입금 강의",
    "HLS 강의",
    "자막 강의",
  ])
}

function buildCourseDescription(course: CourseDetail) {
  const base = course.metaDescription || course.shortDescription || course.description || ""
  const suffix = "링구스트에서 시즌제 수강신청, 계좌입금 승인, HLS 영상 수강 흐름으로 제공되는 온라인 강의입니다."
  return unique([base.replace(/\s+/g, " ").slice(0, 110), suffix]).join(" ")
}

function getCourseId(id: string) {
  const lectureId = Number(id)
  return Number.isFinite(lectureId) ? lectureId : null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params
  const lectureId = getCourseId(id)
  const lecture = lectureId ? await getCourseDetail(lectureId) : null

  if (!lecture) {
    return generateSeoMetadata({
      title: "강의 상세",
      description: "링구스트에서 온라인 강의와 시즌제 수강 신청 정보를 확인하세요.",
      path: `/${locale}/course/${id}`,
      locale: locale as "ko" | "en" | "ja" | "zh",
    })
  }

  const keywords = buildCourseKeywords(lecture)
  const canonical = lecture.canonicalUrl || `${brand.url}/${locale}/course/${id}`
  const ogImage = lecture.ogImageUrl || lecture.imageUrl || undefined

  return generateSeoMetadata({
    title: lecture.metaTitle || `${lecture.title} | ${brand.name}`,
    description: buildCourseDescription(lecture),
    keywords: keywords.join(", "),
    ogImage,
    path: `/${locale}/course/${id}`,
    locale: locale as "ko" | "en" | "ja" | "zh",
    alternates: { canonical },
  })
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { locale, id } = await params
  const lectureId = getCourseId(id)
  if (!lectureId) notFound()

  const detail = await getCourseDetail(lectureId)
  if (!detail) notFound()

  const keywords = buildCourseKeywords(detail)
  const coursePath = `/course/${id}`
  const localizedCourseUrl = `/${locale}${coursePath}`
  const courseJsonLd = generateCourseJsonLd({
    name: detail.title,
    description: buildCourseDescription(detail),
    provider: detail.instructor.nickname || detail.instructor.email || brand.name,
    url: coursePath,
    image: detail.ogImageUrl || detail.imageUrl || siteConfig.ogImage,
    price: detail.discountPrice ?? detail.price,
    currency: "KRW",
    duration: detail.sections.length ? `PT${Math.max(1, Math.round(detail.sections.reduce((sum, section) => sum + Number(section.durationSeconds ?? 0), 0) / 60))}M` : undefined,
    level: detail.level ?? undefined,
    keywords,
  }, locale as "ko" | "en" | "ja" | "zh")

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: `${brand.url}/${locale}` },
      { "@type": "ListItem", position: 2, name: "시즌제 강의", item: `${brand.url}/${locale}` },
      { "@type": "ListItem", position: 3, name: detail.title, item: `${brand.url}${localizedCourseUrl}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([courseJsonLd, breadcrumbJsonLd]) }}
      />
      <CourseDetailPageWrapper initialDetail={detail} />
    </>
  )
}
