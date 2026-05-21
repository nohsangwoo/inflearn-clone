"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, ExternalLink, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"
import { brand, withLocalePath } from "@/lib/brand"

const publicHiddenSegments = ["/admin", "/master", "/me", "/course/lecture", "/login"]

const serviceKeywords = [
  "LMS 제작",
  "강의 플랫폼 제작",
  "온라인 강의 플랫폼",
  "홈페이지 제작",
  "HLS 영상 강의",
  "SEO 최적화",
]

const companyFacts = [
  ["법인명", brand.legalName],
  ["대표", brand.ceo],
  ["사업자등록번호", brand.businessRegistrationNumber],
  ["D-U-N-S", brand.dunsNumber],
]

function isHiddenPath(pathname: string) {
  return publicHiddenSegments.some((segment) => pathname.includes(segment))
}

export function SiteFooter() {
  const pathname = usePathname()

  if (isHiddenPath(pathname)) return null

  const contactHref = `mailto:${brand.supportEmail}?subject=${encodeURIComponent("링구스트 / 강의 플랫폼 제작 문의")}`

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.75fr_0.75fr_0.9fr]">
          <div className="max-w-md">
            <Link href={withLocalePath(pathname, "/")} className="font-brand text-[24px] font-black tracking-normal">
              {brand.name}
            </Link>
            <p className="mt-4 text-[14px] leading-6 text-muted-foreground">
              링구스트는 {brand.creator}가 직접 구축하고 운영하는 웹 우선 강의 플랫폼입니다. 강의 판매,
              시즌제 수강신청, 입금 확인, HLS 영상 수강, 자막/더빙, 판매자 정산, SEO 상세 페이지까지
              하나의 흐름으로 검증합니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {serviceKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-[12px] font-medium text-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-[16px] font-semibold">링구스트</h2>
            <ul className="mt-4 space-y-3 text-[14px] text-muted-foreground">
              <li>
                <Link className="transition-colors hover:text-primary" href={withLocalePath(pathname, "/")}>
                  시즌제 강의 둘러보기
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href={withLocalePath(pathname, "/admin")}>
                  강의 판매자 대시보드
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href={withLocalePath(pathname, "/me")}>
                  수강생 대시보드
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href={withLocalePath(pathname, "/privacy")}>
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-primary" href={withLocalePath(pathname, "/terms")}>
                  이용약관
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-[16px] font-semibold">제작 문의</h2>
            <ul className="mt-4 space-y-3 text-[14px] text-muted-foreground">
              <li>강의 플랫폼 제작</li>
              <li>LMS 개발 및 운영 자동화</li>
              <li>홈페이지 제작 및 SEO 설계</li>
              <li>영상 강의 / VOD / HLS 시스템</li>
              <li>강사 모집형 마켓플레이스</li>
            </ul>
            <Link
              href={contactHref}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-[#e00b41]"
            >
              프로젝트 문의
              <Mail className="size-4" />
            </Link>
          </div>

          <address className="not-italic">
            <h2 className="text-[16px] font-semibold">회사 정보</h2>
            <div className="mt-4 space-y-3 text-[14px] text-muted-foreground">
              <p className="flex gap-2">
                <Building2 className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{brand.legalName}</span>
              </p>
              <p className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-foreground" />
                <span>{brand.address}</span>
              </p>
              <p className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-foreground" />
                <Link className="transition-colors hover:text-primary" href={`mailto:${brand.supportEmail}`}>
                  {brand.supportEmail}
                </Link>
              </p>
              <p className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-foreground" />
                <Link className="transition-colors hover:text-primary" href={`tel:${brand.phone.replaceAll("-", "")}`}>
                  {brand.phone}
                </Link>
              </p>
            </div>
          </address>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <div className="grid gap-4 text-[13px] text-muted-foreground lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {companyFacts.map(([label, value]) => (
                <span key={label}>
                  <span className="text-foreground">{label}</span> {value}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={brand.companyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-primary"
              >
                럿지 회사 소개
                <ExternalLink className="size-3.5" />
              </Link>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-foreground" />
                © 2026 {brand.creator}. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
