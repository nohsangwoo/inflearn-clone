import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MeNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">알림</h1>
        <p className="text-sm text-muted-foreground mt-1">강의 업데이트와 소식을 확인하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 알림</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>새로운 공지사항이 있습니다.</li>
            <li>질문에 강사가 답변했습니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}


