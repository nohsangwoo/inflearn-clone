import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminEarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">수익 확인</h1>
        <p className="text-sm text-muted-foreground mt-1">기간별 수익을 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>오늘 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">₩0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>이번 달 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">₩0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>누적 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">₩0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 정산</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>정산일</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2025-09-01</TableCell>
                <TableCell>₩0</TableCell>
                <TableCell>완료</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


