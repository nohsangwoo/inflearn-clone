export const FIREBASE_AUTH_COOKIE = "lingoost_firebase_token";
const LEGACY_FIREBASE_AUTH_COOKIE = "baksal_firebase_token";

const COOKIE_MAX_AGE_SECONDS = 55 * 60;

export function setFirebaseAuthCookie(token: string) {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${FIREBASE_AUTH_COOKIE}=${encodeURIComponent(
    token,
  )}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

export function clearFirebaseAuthCookie() {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${FIREBASE_AUTH_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
  document.cookie = `${LEGACY_FIREBASE_AUTH_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
}
