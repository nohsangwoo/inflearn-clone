import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function AdminQuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">강의 질문 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">미답변 질문을 빠르게 처리하세요</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>미답변 질문</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>질문</TableHead>
                <TableHead>강의</TableHead>
                <TableHead>작성자</TableHead>
                <TableHead className="text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>섹션 2에서 오류가 발생합니다</TableCell>
                <TableCell>Next.js 실전</TableCell>
                <TableCell>alice@example.com</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost">답변하기</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


