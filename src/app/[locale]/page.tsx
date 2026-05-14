import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-metadata";
import HomePageWrapper from "../page-wrapper";

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return generateSeoMetadata({
    title: "링구스트",
    description: "링구스트는 주식회사 럿지가 운영하는 온라인 강의 플랫폼입니다. 강의 판매자와 수강생을 연결하고 시즌제 강의 모집, 강의 등록, 계좌입금 수강신청, HLS 수강, 자막, 더빙, 정산 관리를 지원합니다.",
    keywords: "링구스트, Lingoost, 럿지, 주식회사 럿지, 온라인 강의, 강의 플랫폼, 강의 판매, 강의 판매 플랫폼, 강의 등록, 강사 모집, 강의자 모집, 시즌제 강의, 수강 신청, 계좌입금 강의, HLS 강의, 강의 SEO, 인프런 대안",
    path: `/${locale}`,
    locale: locale as "ko" | "en" | "ja" | "zh",
  });
}

export default function HomePage() {
  return <HomePageWrapper />;
}
