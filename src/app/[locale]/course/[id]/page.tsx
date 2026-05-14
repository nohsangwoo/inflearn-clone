import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-metadata";
import CourseDetailPageWrapper from "./page-wrapper";
import { eq } from "drizzle-orm";
import { db, lectures } from "@/db";
import { findMockCourse } from "@/lib/mock-courses";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const lectureId = Number(id);
  const mockLecture = Number.isFinite(lectureId) ? findMockCourse(lectureId) : null;
  const lecture =
    mockLecture ??
    (Number.isFinite(lectureId)
      ? await db.query.lectures
          .findFirst({
            where: eq(lectures.id, lectureId),
            columns: {
              title: true,
              shortDescription: true,
              description: true,
              metaTitle: true,
              metaDescription: true,
              seoKeywords: true,
              imageUrl: true,
              ogImageUrl: true,
              canonicalUrl: true,
            },
          })
          .catch(() => null)
      : null);

  return generateSeoMetadata({
    title: lecture?.metaTitle || lecture?.title || "강의 상세",
    description:
      lecture?.metaDescription ||
      lecture?.shortDescription ||
      lecture?.description ||
      "박살강의에서 결제 후 HLS 기반으로 수강할 수 있는 강의입니다.",
    keywords: lecture?.seoKeywords?.join(", "),
    ogImage: lecture?.ogImageUrl || lecture?.imageUrl || undefined,
    path: `/${locale}/course/${id}`,
    locale: locale as "ko" | "en" | "ja" | "zh",
    alternates: lecture?.canonicalUrl ? { canonical: lecture.canonicalUrl } : undefined,
  });
}

export default function CourseDetailPage() {
  return <CourseDetailPageWrapper />;
}
