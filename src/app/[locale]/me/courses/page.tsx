"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toCdnUrl, withLocalePath } from "@/lib/brand"

type PurchasedCourse = {
  id: number
  progress: number
  lecture: {
    id: number
    title: string
    shortDescription?: string | null
    imageUrl?: string | null
    instructor?: { nickname?: string | null; email?: string } | null
  }
}

export default function MePurchasedCoursesPage() {
  const pathname = usePathname()
  const { data } = useQuery({
    queryKey: ["me-summary"],
    queryFn: async () => {
      const { data } = await axios.get("/api/me/summary")
      return data as { purchases: PurchasedCourse[] }
    },
  })

  const purchases = data?.purchases ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">내 강의</h1>
        <p className="mt-2 text-sm text-muted-foreground">구매한 강의를 확인하고 학습을 이어가세요.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>구매 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="rounded-md border bg-background p-8 text-center text-sm text-muted-foreground">
              구매한 강의가 없습니다.
            </div>
          ) : (
            <div className="divide-y rounded-md border">
              {purchases.map((purchase) => {
                const image = toCdnUrl(purchase.lecture.imageUrl)
                return (
                  <div key={purchase.id} className="grid gap-4 p-4 md:grid-cols-[112px_1fr_130px] md:items-center">
                    <div className="aspect-video overflow-hidden rounded-md bg-muted">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={purchase.lecture.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold">{purchase.lecture.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {purchase.lecture.shortDescription || purchase.lecture.instructor?.nickname || purchase.lecture.instructor?.email}
                      </div>
                      <div className="mt-3 h-2 rounded bg-muted">
                        <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, Math.max(0, purchase.progress))}%` }} />
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={withLocalePath(pathname, `/course/${purchase.lecture.id}`)}>
                        <PlayCircle className="size-4" />
                        이어보기
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
