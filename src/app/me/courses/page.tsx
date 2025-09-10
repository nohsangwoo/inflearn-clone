import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function MePurchasedCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">내 강의</h1>
        <p className="text-sm text-muted-foreground mt-1">구매한 강의를 확인하고 학습을 이어가세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>구매 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>강의명</TableHead>
                <TableHead>진행도</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Next.js 실전</TableCell>
                <TableCell>0%</TableCell>
                <TableCell className="text-right">이어보기</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


