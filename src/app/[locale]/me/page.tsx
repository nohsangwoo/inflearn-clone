"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePathname } from "next/navigation"
import { getTranslation, useLocale } from "@/lib/translations"

export default function MeDashboardPage() {
  const pathname = usePathname()
  const locale = useLocale(pathname)
  const t = getTranslation(locale).dashboard

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1> {/* "대시보드" */}
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p> {/* "최근 활동과 학습 현황" */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t.stats.coursesInProgress}</CardTitle> {/* "진행 중인 강의" */}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.stats.weeklyHours}</CardTitle> {/* "학습 시간(주)" */}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">0h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t.stats.likes}</CardTitle> {/* "좋아요" */}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}