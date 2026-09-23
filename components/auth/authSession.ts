"use client";

import { useSyncExternalStore } from "react";
import type { TutorStatus } from "./profile";

export type SessionUser = {
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  publicId: string;
  role: "student" | "tutor" | "";
  tutorStatus: TutorStatus | "";
};

type SessionUserInput = {
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_photo?: string;
  public_id?: string;
  role?: "student" | "tutor";
  tutor_status?: TutorStatus;
};

const SESSION_USER_KEY = "sp_session_user";
const LEGACY_ACCESS_TOKEN_KEY = "sp_access_token";
const LEGACY_PROFILE_SETUP_TOKEN_KEY = "sp_profile_setup_token";
const SESSION_EVENT = "sp-auth-session";
const emptyUser: SessionUser | null = null;
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = emptyUser;

export function clearLegacyAuthTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_PROFILE_SETUP_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
  sessionStorage.removeItem(LEGACY_PROFILE_SETUP_TOKEN_KEY);
}

export function setAuthSession(user?: SessionUserInput) {
  if (typeof window === "undefined") return;
  clearLegacyAuthTokens();
  if (user) {
    sessionStorage.setItem(
      SESSION_USER_KEY,
      JSON.stringify({
        email: user.email?.trim() ?? "",
        firstName: user.first_name?.trim() ?? "",
        lastName: user.last_name?.trim() ?? "",
        profilePhoto: user.profile_photo?.trim() ?? "",
        publicId: user.public_id?.trim() ?? "",
        role: user.role ?? "",
        tutorStatus: user.tutor_status ?? "",
      } satisfies SessionUser),
    );
  } else {
    sessionStorage.removeItem(SESSION_USER_KEY);
    cachedUser = null;
  }
  cachedRaw = null;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  clearLegacyAuthTokens();
  sessionStorage.removeItem(SESSION_USER_KEY);
  cachedRaw = null;
  cachedUser = null;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export async function signOut() {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("Could not log out.");
  clearAuthSession();
  window.location.replace("/login");
}

export function redirectToLoginForAuthentication() {
  clearAuthSession();
  void fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
  if (typeof window === "undefined" || window.location.pathname === "/login") return;
  const next = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams({ next, notice: "session_expired" });
  window.location.replace(`/login?${params.toString()}`);
}

export function waitForAuthenticationRedirect(): Promise<never> {
  redirectToLoginForAuthentication();
  return new Promise<never>(() => undefined);
}

function readSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return emptyUser;
  const raw = sessionStorage.getItem(SESSION_USER_KEY);
  if (raw === cachedRaw) return cachedUser;

  cachedRaw = raw;
  if (!raw) {
    cachedUser = null;
    return cachedUser;
  }
  try {
    cachedUser = JSON.parse(raw) as SessionUser;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

export function subscribeAuthSession(onStoreChange: () => void) {
  window.addEventListener(SESSION_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(SESSION_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useSessionUser() {
  return useSyncExternalStore(
    subscribeAuthSession,
    readSessionUser,
    () => emptyUser,
  );
}
