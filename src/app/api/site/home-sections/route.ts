import { NextResponse } from "next/server"
import { getHomepageSections } from "@/lib/homepage-sections-data"

export async function GET() {
  const response = NextResponse.json({ sections: await getHomepageSections() })
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=3600",
  )
  return response
}
