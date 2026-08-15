"use client";

import { useSyncExternalStore } from "react";

export type SessionUser = {
  email: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  publicId: string;
  role: "student" | "tutor" | "";
};

type ApiSessionUser = {
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_photo?: string;
  public_id?: string;
  role?: "student" | "tutor";
};

const ACCESS_TOKEN_KEY = "sp_access_token";
const SESSION_USER_KEY = "sp_session_user";
const SESSION_EVENT = "sp-auth-session";
const emptyUser: SessionUser | null = null;
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = emptyUser;

export function getAccessToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACCESS_TOKEN_KEY)?.trim() ?? "";
}

export function setAuthSession(token: string, user?: ApiSessionUser) {
  if (typeof window === "undefined") return;
  const cleanToken = token.trim();
  if (!cleanToken) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, cleanToken);
  localStorage.removeItem("sp_profile_setup_token");
  if (user) {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify({
      email: user.email?.trim() ?? "",
      firstName: user.first_name?.trim() ?? "",
      lastName: user.last_name?.trim() ?? "",
      profilePhoto: user.profile_photo?.trim() ?? "",
      publicId: user.public_id?.trim() ?? "",
      role: user.role ?? "",
    } satisfies SessionUser));
  } else {
    localStorage.removeItem(SESSION_USER_KEY);
    cachedUser = null;
  }
  cachedRaw = null;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem("sp_profile_setup_token");
  cachedRaw = null;
  cachedUser = null;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

function readSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return emptyUser;
  const raw = localStorage.getItem(SESSION_USER_KEY);
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

function subscribe(onStoreChange: () => void) {
  window.addEventListener(SESSION_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(SESSION_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function useSessionUser() {
  return useSyncExternalStore(subscribe, readSessionUser, () => emptyUser);
}
