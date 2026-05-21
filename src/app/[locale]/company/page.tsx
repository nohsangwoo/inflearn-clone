import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, CheckCircle2, Code2, Mail, MapPin, MonitorPlay, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { brand } from "@/lib/brand"
import { generateSeoMetadata } from "@/lib/seo-metadata"

type Props = {
  params: Promise<{ locale: string }>
}

const serviceAreas = [
  "강의 플랫폼 제작",
  "LMS 개발",
  "홈페이지 제작",
  "웹사이트 제작",
  "업무 자동화",
  "AI 시스템 구축",
  "HLS 영상 강의 시스템",
  "SEO 최적화",
]

const capabilities = [
  {
    icon: MonitorPlay,
    title: "교육 플랫폼",
    body: "강의 목록, 상세 페이지, 수강신청, 판매자 대시보드, 최고관리자 승인/정산 흐름을 실제 운영 기준으로 설계합니다.",
  },
  {
    icon: Code2,
    title: "웹/앱 개발",
    body: "Next.js, React Native, Flutter, Firebase, Neon DB, S3 같은 실무 스택으로 빠르게 검증 가능한 제품을 만듭니다.",
  },
  {
    icon: CheckCircle2,
    title: "운영형 SEO",
    body: "검색어를 억지로 채우기보다 서비스 구조, sitemap, 메타데이터, 상세 콘텐츠가 함께 검색 신호를 만들도록 정리합니다.",
  },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return generateSeoMetadata({
    title: "주식회사 럿지 회사 소개",
    description:
      "주식회사 럿지는 링구스트를 운영하는 개발사입니다. LMS 제작, 강의 플랫폼 제작, 홈페이지 제작, 웹사이트 제작, HLS 영상 강의 시스템, SEO 최적화 구축 문의를 받습니다.",
    keywords:
      "주식회사 럿지, 주식회사럿지, 럿지, LUDGI, 링구스트, Lingoost, LMS 제작, LMS 개발, 강의 플랫폼 제작, 강의 플랫폼 개발, 홈페이지 제작, 홈페이지제작, 웹사이트 제작, 온라인 교육 플랫폼 제작, 에듀테크 개발, HLS 영상 강의, SEO 최적화",
    path: `/${locale}/company`,
    locale: locale as "ko" | "en" | "ja" | "zh",
  })
}

export default function CompanyPage() {
  const contactHref = `mailto:${brand.supportEmail}?subject=${encodeURIComponent("럿지 / 링구스트 제작 문의")}`

  return (
    <main className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-6 md:py-20">
          <div>
            <p className="text-[14px] font-semibold text-primary">LUDGI Inc.</p>
            <h1 className="mt-3 text-[32px] font-bold leading-[1.18] md:text-[44px]">
              링구스트를 만든 개발사, 주식회사 럿지입니다.
            </h1>
            <p className="mt-5 text-[16px] leading-7 text-muted-foreground">
              럿지는 스타트업, 병원, 교육, 공공기관, 브랜드 웹사이트와 업무 시스템을 만들며 쌓은 경험을
              바탕으로 링구스트라는 강의 플랫폼 레퍼런스를 운영합니다. LMS 제작, 강의 플랫폼 제작,
              홈페이지 제작 문의를 실제 작동하는 화면으로 상담할 수 있게 하는 것이 이 페이지의 목적입니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-5">
                <Link href={contactHref}>
                  제작 문의하기
                  <Mail className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link href={brand.companyUrl} target="_blank" rel="noreferrer">
                  공식 회사 소개
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-secondary p-6 md:p-8">
            <h2 className="text-[18px] font-semibold">회사 정보</h2>
            <dl className="mt-6 grid gap-4 text-[14px]">
              {[
                ["법인명", brand.legalName],
                ["대표", brand.ceo],
                ["사업자등록번호", brand.businessRegistrationNumber],
                ["D-U-N-S", brand.dunsNumber],
                ["설립", `${brand.founded}년`],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[112px_1fr] gap-4 border-b border-border pb-3 last:border-b-0">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 space-y-3 text-[14px] text-muted-foreground">
              <p className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{brand.address}</span>
              </p>
              <p className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-foreground" />
                <Link className="hover:text-primary" href={`mailto:${brand.supportEmail}`}>
                  {brand.supportEmail}
                </Link>
              </p>
              <p className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-foreground" />
                <Link className="hover:text-primary" href={`tel:${brand.phone.replaceAll("-", "")}`}>
                  {brand.phone}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="rounded-[14px] border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-5 text-[18px] font-semibold">{item.title}</h2>
                <p className="mt-3 text-[14px] leading-6 text-muted-foreground">{item.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-border bg-secondary">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-[0.82fr_1.18fr] md:px-6">
          <div>
            <p className="text-[14px] font-semibold text-muted-foreground">Search intent coverage</p>
            <h2 className="mt-3 text-[26px] font-semibold leading-[1.2]">
              럿지는 제품을 만들고, 검색될 문장까지 함께 설계합니다.
            </h2>
          </div>
          <div>
            <p className="text-[15px] leading-7 text-muted-foreground">
              강의 플랫폼 제작, LMS 제작, 홈페이지 제작, 온라인 교육 플랫폼 개발, HLS 영상 강의,
              SEO 최적화 같은 검색어는 따로 떨어진 키워드가 아닙니다. 실제 기능, 운영 정책, 콘텐츠 구조,
              회사 정보가 한 페이지 안에서 자연스럽게 연결될 때 문의 전환 가능성이 올라갑니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {serviceAreas.map((keyword) => (
                <span key={keyword} className="rounded-full border border-border bg-background px-3 py-2 text-[13px] font-medium">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="rounded-[24px] border border-border bg-background p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary">
                <Building2 className="size-4" />
                Build with LUDGI
              </p>
              <h2 className="mt-3 text-[24px] font-semibold leading-[1.2]">
                링구스트 같은 강의 플랫폼을 귀사 도메인과 브랜드로 만들고 싶다면 연락주세요.
              </h2>
              <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                처음 상담에서는 강의 판매 방식, 결제/입금 방식, 영상 저장 비용, 관리자 승인 정책,
                검색 노출 전략을 함께 정리합니다.
              </p>
            </div>
            <Button asChild className="h-12 rounded-full px-6">
              <Link href={contactHref}>
                {brand.supportEmail}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
