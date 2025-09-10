
import { Input } from "@/components/ui/input"
import RecommendationCarousel from "@/components/recommendation-carousel"
//
import CourseListSection from "@/components/course-list-section"
import type { CourseItem } from "@/components/course-card"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import CreatorsShowcase from "@/components/creators-showcase"

const mockCourses = Array.from({ length: 20 }).map((_, i) => ({
  id: `reco-${i + 1}`,
  title: `추천 강의 ${i + 1}`,
  thumbnail: "/window.svg",
  author: "홍길동",
  price: "₩0",
}))

const listCourses: CourseItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `list-${i + 1}`,
  title: `강의 ${i + 1}`,
  author: "강사",
  price: "₩0",
  thumbnail: "/window.svg",
  summary: "이 강의는 예시 설명 텍스트로 채워진 요약입니다. 핵심 학습 포인트 소개.",
  tags: ["신규", "베스트", "프론트엔드"],
}))

const creators = Array.from({ length: 12 }).map((_, i) => ({
  id: `creator-${i + 1}`,
  name: `지식공유자 ${i + 1}`,
  avatar: "/avatar.png",
}))

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = searchParams ? await searchParams : undefined
  const pageParam = Array.isArray(sp?.page) ? sp?.page?.[0] : sp?.page
  const currentPage = Number(pageParam || "1") || 1
  return (
    <div className="space-y-8">
      <section className="pt-4">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-2">
            <Input placeholder="강의, 강사, 키워드를 검색하세요" />
          </div>
        </div>
      </section>

      {currentPage === 1 && (
        <section>
          <div className="mx-auto max-w-6xl px-4">
            <RecommendationCarousel items={mockCourses} />
          </div>
        </section>
      )}

      <section>
        <div className="mx-auto max-w-6xl px-4">
          <CourseListSection title="인기 강의" items={listCourses} availableTags={["신규","베스트","프론트엔드","백엔드","AI"]} />
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4">
          <CreatorsShowcase creators={creators} />
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4">
          <CourseListSection title="추천 강의 더보기" items={listCourses} availableTags={["신규","베스트","프론트엔드","백엔드","AI"]} />
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href={`?page=${Math.max(1, currentPage - 1)}`} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="?page=1" isActive={currentPage === 1}>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="?page=2" isActive={currentPage === 2}>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="?page=3" isActive={currentPage === 3}>3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href={`?page=${Math.min(5, currentPage + 1)}`} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </section>
    </div>
  );
}
