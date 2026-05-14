import { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { eq } from "drizzle-orm";
import { cookies as nextCookies } from "next/headers";
import { db, users } from "@/db";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { FIREBASE_AUTH_COOKIE } from "@/lib/firebase/session";

export type DbUser = {
  id: number;
  email: string;
  firebaseUid: string;
  role: "ADMIN" | "STUDENT" | "TEACHER";
};

const masterAdminEmails = new Set(
  (process.env.MASTER_ADMIN_EMAILS ?? "nsgr12@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

function getSyncedRole(
  email: string,
  isVerified: boolean,
  currentRole: DbUser["role"] = "STUDENT",
): DbUser["role"] {
  if (isVerified && masterAdminEmails.has(email.toLowerCase())) return "ADMIN";
  if (currentRole === "ADMIN") return "STUDENT";
  return currentRole;
}

async function readFirebaseToken(request?: NextRequest) {
  const authorization = request?.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  if (request) {
    return request.cookies.get(FIREBASE_AUTH_COOKIE)?.value ?? null;
  }

  const cookieStore = await nextCookies();
  return cookieStore.get(FIREBASE_AUTH_COOKIE)?.value ?? null;
}

/**
 * 현재 로그인한 유저의 DB User 레코드를 반환합니다.
 * 클라이언트는 Firebase ID 토큰을 Authorization 헤더 또는 lingoost_firebase_token 쿠키로 전달합니다.
 */
export async function getAuthUserFromRequest(request?: NextRequest): Promise<DbUser | null> {
  const token = await readFirebaseToken(request);
  if (!token) return null;

  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error("Firebase Admin env missing");
  }

  const decoded = await getAuth(app).verifyIdToken(token).catch(() => null);
  if (!decoded) return null;
  const firebaseUid = decoded.uid;
  const email = decoded.email || `${firebaseUid}@firebase.local`;
  const isVerified = decoded.email_verified ?? true;

  let dbUser = await db.query.users.findFirst({
    where: eq(users.firebaseUid, firebaseUid),
    columns: { id: true, email: true, firebaseUid: true, role: true },
  });

  if (!dbUser) {
    const existingByEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { id: true, email: true, firebaseUid: true, role: true },
    });

    if (existingByEmail) {
      const role = getSyncedRole(email, isVerified, existingByEmail.role as DbUser["role"]);
      const [updated] = await db
        .update(users)
        .set({ firebaseUid, isVerified, role })
        .where(eq(users.id, existingByEmail.id))
        .returning({
          id: users.id,
          email: users.email,
          firebaseUid: users.firebaseUid,
          role: users.role,
        });
      dbUser = updated ?? existingByEmail;
    }
  }

  if (!dbUser) {
    const [created] = await db
      .insert(users)
      .values({
        firebaseUid,
        email,
        isVerified,
        role: getSyncedRole(email, isVerified),
      })
      .returning({
        id: users.id,
        email: users.email,
        firebaseUid: users.firebaseUid,
        role: users.role,
      });
    dbUser = created ?? null;
  } else {
    const role = getSyncedRole(email, isVerified, dbUser.role as DbUser["role"]);
    if (!email || (dbUser.email === email && dbUser.firebaseUid === firebaseUid && dbUser.role === role)) {
      return dbUser as DbUser;
    }

    const [updated] = await db
      .update(users)
      .set({ email, firebaseUid, isVerified, role })
      .where(eq(users.id, dbUser.id))
      .returning({
        id: users.id,
        email: users.email,
        firebaseUid: users.firebaseUid,
        role: users.role,
      });
    dbUser = updated ?? dbUser;
  }

  return dbUser as DbUser | null;
}
