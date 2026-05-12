import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-metadata";
import HomePageWrapper from "../page-wrapper";

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // TODO: Translate metadata based on locale
  return generateSeoMetadata({
    title: "박살강의",
    description: "결제, HLS 수강, 더빙, 자막, SEO와 판매자 정산까지 갖춘 웹 우선 강의 교환 플랫폼입니다.",
    keywords: "박살강의, 온라인 강의, 강의 판매, HLS 강의, 토스페이먼츠, 지식 공유, 강의 플랫폼",
    path: `/${locale}`,
  });
}

export default function HomePage() {
  return <HomePageWrapper />;
}
