"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CourseCard, type CourseItem } from "@/components/course-card"
import { ChevronDown } from "lucide-react"

type Props = {
  title: string
  items: CourseItem[]
  availableTags?: string[]
}

export function CourseListSection({ title, items, availableTags = [] }: Props) {
  const [keyword, setKeyword] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sort] = useState<"popular" | "recent" | "priceAsc" | "priceDesc">("popular")

  const filtered = useMemo(() => {
    const lower = keyword.toLowerCase()
    const r = items.filter((c) =>
      (!selectedTag || c.tags?.includes(selectedTag)) &&
      (c.title.toLowerCase().includes(lower) || c.summary.toLowerCase().includes(lower))
    )
    if (sort === "recent") return r
    if (sort === "priceAsc") return r
    if (sort === "priceDesc") return r
    return r
  }, [items, keyword, selectedTag, sort])

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full">
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="태그/키워드로 검색"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
              <Button
                key="all"
                variant={selectedTag ? "outline" : "secondary"}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >전체</Button>
              {availableTags.map((t) => (
                <Button
                  key={t}
                  variant={selectedTag === t ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(t)}
                >{t}</Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              정렬 <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다</CardContent>
        </Card>
      )}
    </section>
  )
}

export default CourseListSection


