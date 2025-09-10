import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function AdminCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">강의관리</h1>
          <p className="text-sm text-muted-foreground mt-1">강의 목록과 상태를 확인하고 관리하세요</p>
        </div>
        <Button size="sm">새 강의 만들기</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>강의 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>강의명</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>가격</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>타입스크립트 입문</TableCell>
                <TableCell>공개</TableCell>
                <TableCell>₩0</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">수정</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Next.js 실전</TableCell>
                <TableCell>비공개</TableCell>
                <TableCell>₩0</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">수정</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


