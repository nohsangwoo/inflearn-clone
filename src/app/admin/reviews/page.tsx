import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">수강평 리스트</h1>
        <p className="text-sm text-muted-foreground mt-1">최근 수강평과 평점을 확인하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 수강평</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>강의</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead>평점</TableHead>
                <TableHead>내용</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>타입스크립트 입문</TableCell>
                <TableCell>user@example.com</TableCell>
                <TableCell>5</TableCell>
                <TableCell>아주 좋았어요!</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


