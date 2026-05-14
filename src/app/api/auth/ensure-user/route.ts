import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/get-auth-user";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        firebaseUid: user.firebaseUid,
        role: user.role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "auth_sync_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
