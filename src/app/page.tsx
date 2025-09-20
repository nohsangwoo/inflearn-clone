import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-metadata";
import HomePageWrapper from "./page-wrapper";

export function generateMetadata(): Metadata {
  return generateSeoMetadata({
    title: "온라인 강의 플랫폼",
    description: "프로그래밍, IT, 비즈니스부터 다양한 분야의 온라인 강의를 제공합니다. 전문가의 노하우를 배우고 성장하세요.",
    keywords: "온라인 강의, 프로그래밍, 코딩, IT 교육, 비즈니스, 디자인, 마케팅",
    path: "/",
  });
}

export default function HomePage() {
  return <HomePageWrapper />;
}
