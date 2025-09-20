import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">핵심 지표와 최근 활동을 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>오늘의 판매</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">₩0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>이번달 수익</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">₩0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>신규 수강생</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">0명</div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>최근 주문</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead>강의</TableHead>
                <TableHead>구매자</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>#0001</TableCell>
                <TableCell>기초 타입스크립트</TableCell>
                <TableCell>alice@example.com</TableCell>
                <TableCell className="text-right">₩0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>#0002</TableCell>
                <TableCell>Next.js 심화</TableCell>
                <TableCell>bob@example.com</TableCell>
                <TableCell className="text-right">₩0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


