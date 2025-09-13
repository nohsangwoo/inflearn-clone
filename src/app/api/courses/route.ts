import prisma from "@/lib/prismaClient"
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, Number(sp.get("page") || 1))
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") || 12)))
  const sort = (sp.get("sort") || "latest").toLowerCase()
  const q = sp.get("q")?.trim()
  const category = sp.get("category")?.toLowerCase() || undefined

  const orderBy: Prisma.LectureOrderByWithRelationInput[] = (() => {
    if (sort === "best") return [{ purchases: { _count: "desc" } }, { createdAt: "desc" }]
    if (sort === "priceasc") return [{ discountPrice: "asc" }, { price: "asc" }]
    if (sort === "pricedesc") return [{ discountPrice: "desc" }, { price: "desc" }]
    return [{ createdAt: "desc" }]
  })()

  const where: Prisma.LectureWhereInput = { isActive: true }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }
  // TODO: category 필터는 스키마 확장(카테고리/태그 필드) 후 활성화
  if (category && ["frontend", "backend", "ai"].includes(category)) {
    // 현재는 카테고리 컬럼이 없어 필터를 적용하지 않습니다.
  }

  const [total, items] = await Promise.all([
    prisma.lecture.count({ where }),
    prisma.lecture.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        discountPrice: true,
        imageUrl: true,
        createdAt: true,
        instructor: { select: { nickname: true, email: true } },
      },
    }),
  ])

  return NextResponse.json({ page, pageSize, total, items })
}


