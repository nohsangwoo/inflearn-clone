import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, LibraryBig, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "신호가 끊긴 강의 | 링구스트",
}

const frames = [
  "opacity-20",
  "opacity-80",
  "opacity-35",
  "opacity-55",
  "opacity-95",
  "opacity-25",
  "opacity-70",
  "opacity-45",
  "opacity-60",
  "opacity-30",
  "opacity-85",
  "opacity-40",
]

export default function NotFound() {
  return (
    <div className="not-found-page relative isolate min-h-[calc(100dvh-56px-64px)] overflow-hidden bg-background pb-10 md:pb-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border" />
      <div className="mx-auto grid min-h-[calc(100dvh-56px-64px)] max-w-7xl items-center gap-10 px-4 py-10 md:grid-cols-[0.92fr_1.08fr] md:px-6 md:py-16">
        <section className="relative z-10 max-w-xl">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/logo.png?v=lingoost-20260515"
              alt="링구스트 logo"
              width={40}
              height={40}
              className="size-10 rounded-[10px]"
              unoptimized
              priority
            />
            <span className="font-brand text-xl font-black text-primary">링구스트</span>
          </div>

          <p className="font-brand text-sm font-extrabold text-primary">404 · LOST FRAME</p>
          <h1 className="mt-4 text-[clamp(38px,7vw,84px)] font-black leading-[0.98] text-foreground">
            신호가 끊긴
            <br />
            강의입니다
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-muted-foreground">
            요청한 주소의 강의 스트림을 찾지 못했어요. 공개 전 강의이거나 링크가 바뀐 화면일 수 있습니다.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-full px-5">
              <Link href="/ko">
                <Search className="size-4" />
                강의 둘러보기
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-5">
              <Link href="/ko/me/courses">
                <LibraryBig className="size-4" />
                내 학습으로
              </Link>
            </Button>
          </div>

          <Link
            href="/ko"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            홈으로 돌아가기
          </Link>
        </section>

        <section aria-hidden="true" className="relative min-h-[360px] md:min-h-[620px]">
          <div className="not-found-art absolute inset-0">
            <div className="not-found-art__ticker font-brand">
              <span>HLS MANIFEST MISSING</span>
              <span>404</span>
              <span>CAPTION TRACK LOST</span>
              <span>LINGOOST</span>
            </div>

            <div className="not-found-art__wall">
              {frames.map((opacity, index) => (
                <div
                  key={index}
                  className={`not-found-art__frame ${opacity}`}
                  style={{ animationDelay: `${index * 0.18}s` }}
                >
                  <span />
                </div>
              ))}
            </div>

            <div className="not-found-art__number font-brand">404</div>
            <div className="not-found-art__scan" />
            <div className="not-found-art__wave">
              {Array.from({ length: 24 }).map((_, index) => (
                <span key={index} style={{ animationDelay: `${index * 0.06}s` }} />
              ))}
            </div>
            <div className="not-found-art__caption font-brand">NO LESSON SOURCE</div>
          </div>
        </section>
      </div>
    </div>
  )
}
