import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-metadata";
import CourseDetailPageWrapper from "./page-wrapper";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;

  return generateSeoMetadata({
    title: `강의 상세`,
    description: "전문가가 직접 제작한 고품질 온라인 강의를 수강하세요. 커리큘럼, 리뷰, 가격 정보를 확인할 수 있습니다.",
    path: `/${locale}/course/${id}`,
  });
}

export default function CourseDetailPage() {
  return <CourseDetailPageWrapper />;
}
