import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="mt-3 text-[28px] font-bold leading-[1.43]">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        주소가 바뀌었거나 아직 공개되지 않은 강의일 수 있습니다.
      </p>
      <Button asChild className="mt-6">
        <Link href="/ko">강의 둘러보기</Link>
      </Button>
    </div>
  )
}
