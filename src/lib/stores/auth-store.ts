"use client";

import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendEmailVerification,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Unsubscribe,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirebaseClientAuth,
  getFirebaseCredential,
  getFirebaseOAuthProvider,
  isFirebaseClientConfigured,
} from "@/lib/firebase/client";
import {
  clearFirebaseAuthCookie,
  setFirebaseAuthCookie,
} from "@/lib/firebase/session";

type AuthUser = {
  id: string;
  email: string;
  name?: string;
} | null;

type SignInResult = {
  success: boolean;
  error?: string;
};

type AuthState = {
  user: AuthUser;
  isLoading: boolean;
  error: string | null;
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (
    email: string,
    password: string,
  ) => Promise<{ needsEmailVerification: boolean }>;
  loginWithOAuth: (provider: "google" | "apple") => Promise<SignInResult>;
  loginWithNativeToken: (
    provider: "google" | "apple",
    idToken: string,
    accessToken?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

let authUnsubscribe: Unsubscribe | null = null;
let firstAuthReady: Promise<void> | null = null;

const toAuthUser = (user: FirebaseUser): NonNullable<AuthUser> => ({
  id: user.uid,
  email: user.email ?? "",
  name: user.displayName ?? undefined,
});

const ensureUserOnServer = async (token: string) => {
  await fetch("/api/auth/ensure-user", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const syncFirebaseUser = async (
  firebaseUser: FirebaseUser | null,
  set: (state: Partial<AuthState>) => void,
) => {
  if (!firebaseUser) {
    clearFirebaseAuthCookie();
    set({ user: null, error: null });
    return;
  }

  const token = await firebaseUser.getIdToken();
  setFirebaseAuthCookie(token);
  set({ user: toAuthUser(firebaseUser), error: null });
  await ensureUserOnServer(token);
};

function getFirebaseSetupError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("NEXT_PUBLIC_FIREBASE")) return message;
  return message || "Firebase 인증을 초기화하지 못했습니다.";
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  initialize: async () => {
    if (!isFirebaseClientConfigured()) {
      clearFirebaseAuthCookie();
      set({
        user: null,
        isLoading: false,
        error:
          "Firebase 웹 앱 설정이 없습니다. NEXT_PUBLIC_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID를 추가해 주세요.",
      });
      return;
    }

    set({ isLoading: true });
    try {
      const auth = getFirebaseClientAuth();

      if (!authUnsubscribe) {
        firstAuthReady = new Promise<void>((resolve) => {
          let resolved = false;
          authUnsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
            try {
              await syncFirebaseUser(firebaseUser, set);
            } catch (error) {
              set({
                error:
                  error instanceof Error
                    ? error.message
                    : "Firebase 세션 동기화에 실패했습니다.",
              });
            } finally {
              set({ isLoading: false });
              if (!resolved) {
                resolved = true;
                resolve();
              }
            }
          });
        });
      }

      await firstAuthReady;
    } catch (error) {
      clearFirebaseAuthCookie();
      set({ user: null, error: getFirebaseSetupError(error) });
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithEmailPassword: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const auth = getFirebaseClientAuth();
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await syncFirebaseUser(credential.user, set);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw new Error(message || "로그인에 실패했습니다.");
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithOAuth: async (provider: "google" | "apple"): Promise<SignInResult> => {
    set({ isLoading: true, error: null });
    try {
      const auth = getFirebaseClientAuth();
      const credential = await signInWithPopup(auth, getFirebaseOAuthProvider(provider));
      await syncFirebaseUser(credential.user, set);
      return { success: true };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "소셜 로그인 중 오류가 발생했습니다.";
      set({ error: errorMsg });
      return { success: false, error: errorMsg };
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithNativeToken: async (
    provider: "google" | "apple",
    idToken: string,
    accessToken?: string,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const auth = getFirebaseClientAuth();
      const credential = getFirebaseCredential(provider, idToken, accessToken);
      const result = await signInWithCredential(auth, credential);
      await syncFirebaseUser(result.user, set);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw new Error(message || "네이티브 로그인 토큰 처리에 실패했습니다.");
    } finally {
      set({ isLoading: false });
    }
  },

  signUpWithEmailPassword: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const auth = getFirebaseClientAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(credential.user, {
        url:
          typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      });
      await syncFirebaseUser(credential.user, set);

      return { needsEmailVerification: !credential.user.emailVerified };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw new Error(message || "회원가입에 실패했습니다.");
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const auth = getFirebaseClientAuth();
      await signOut(auth);
      clearFirebaseAuthCookie();
      set({ user: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw new Error(message || "로그아웃에 실패했습니다.");
    } finally {
      set({ isLoading: false });
    }
  },
}));
