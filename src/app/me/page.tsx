import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MeDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">최근 활동과 학습 현황</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>진행 중인 강의</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>학습 시간(주)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">0h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>좋아요</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">0</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


