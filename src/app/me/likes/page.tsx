import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function MeLikesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">좋아요</h1>
        <p className="text-sm text-muted-foreground mt-1">좋아요한 강의 목록</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>좋아요한 강의</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>강의명</TableHead>
                <TableHead>강사</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>타입스크립트 입문</TableCell>
                <TableCell>홍길동</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


