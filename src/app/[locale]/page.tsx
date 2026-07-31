import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-metadata";
import HomePageWrapper from "../page-wrapper";
import {
  getEmptyPublicCourseCatalog,
  getDevelopmentPublicCourseCatalog,
  getPublicCourseCatalog,
} from "@/lib/course-catalog-data";
import { getHomepageSections } from "@/lib/homepage-sections-data";

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: "링구스트",
    description: "링구스트는 주식회사 럿지가 운영하는 온라인 강의 플랫폼이자 LMS 제작 레퍼런스입니다. 강의 판매자와 수강생을 연결하고 시즌제 강의 모집, 강의 등록, 계좌입금 수강신청, HLS 수강, 자막, 더빙, 정산 관리와 SEO 최적화 강의 상세 페이지를 지원합니다.",
    keywords: "링구스트, Lingoost, 럿지, 주식회사 럿지, 주식회사럿지, LUDGI, lms, LMS 제작, LMS 개발, lms 솔루션, 온라인 강의, 온라인 교육 플랫폼 제작, 강의 플랫폼, 강의 플랫폼 제작, 강의 플랫폼 개발, 강의 사이트 제작, 강의 판매 사이트 제작, 강의 판매, 강의 판매 플랫폼, 강의 등록, 강사 모집, 강의자 모집, 시즌제 강의, 코호트 강의, 수강 신청, 계좌입금 강의, 영상 강의 플랫폼, VOD 플랫폼, HLS 강의, HLS 스트리밍, 자막 강의, AI 더빙 강의, 강의 SEO, 홈페이지 제작, 홈페이지제작, 교육 홈페이지 제작, 웹사이트 제작, 에듀테크 개발, 인프런 대안",
    path: `/${locale}`,
    locale: locale as "ko" | "en" | "ja" | "zh",
  });
}

export default async function HomePage() {
  const initialCatalogInput = {
    page: 1,
    pageSize: 15,
    sort: "latest",
  };
  const [initialCatalog, initialHomepageSections] = await Promise.all([
    getPublicCourseCatalog(initialCatalogInput).catch(() =>
      process.env.NODE_ENV === "production"
        ? getEmptyPublicCourseCatalog(initialCatalogInput)
        : getDevelopmentPublicCourseCatalog(initialCatalogInput),
    ),
    getHomepageSections(),
  ]);

  return (
    <HomePageWrapper
      initialCatalog={initialCatalog}
      initialHomepageSections={initialHomepageSections}
    />
  );
}
