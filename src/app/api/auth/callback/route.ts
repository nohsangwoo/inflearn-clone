import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const currentUrl = new URL(request.url);
  const redirectTo = currentUrl.searchParams.get("redirect_to");
  return NextResponse.redirect(new URL(redirectTo || "/", request.url));
}
