"use client";

import { useSyncExternalStore } from "react";

export type ProfileSetupUser = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

const PROFILE_SETUP_USER_KEY = "sp_profile_setup_user";
const PROFILE_SETUP_ACTIVE_KEY = "sp_profile_setup_active";
const PROFILE_DETAILS_SUBMITTED_KEY = "sp_profile_details_submitted";
export const PROFILE_SETUP_SESSION_EVENT = "sp-profile-setup-user";
const emptyProfileSetupUser: ProfileSetupUser = {};
let cachedProfileSetupUserRaw: string | null = null;
let cachedProfileSetupUser: ProfileSetupUser = emptyProfileSetupUser;

export function subscribeProfileSetupSession(onStoreChange: () => void) {
  window.addEventListener(PROFILE_SETUP_SESSION_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(PROFILE_SETUP_SESSION_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readProfileSetupUser(): ProfileSetupUser {
  if (typeof window === "undefined") return emptyProfileSetupUser;

  try {
    const raw = window.sessionStorage.getItem(PROFILE_SETUP_USER_KEY);
    if (raw === cachedProfileSetupUserRaw) return cachedProfileSetupUser;

    cachedProfileSetupUserRaw = raw;
    if (!raw) return emptyProfileSetupUser;
    const parsed = JSON.parse(raw) as ProfileSetupUser;
    cachedProfileSetupUser = {
      email: parsed.email ?? "",
      firstName: parsed.firstName ?? "",
      lastName: parsed.lastName ?? "",
    };
    return cachedProfileSetupUser;
  } catch {
    cachedProfileSetupUserRaw = null;
    cachedProfileSetupUser = emptyProfileSetupUser;
    return emptyProfileSetupUser;
  }
}

export function saveProfileSetupUser(user?: ProfileSetupUser) {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(PROFILE_SETUP_ACTIVE_KEY, "true");
  window.sessionStorage.removeItem(PROFILE_DETAILS_SUBMITTED_KEY);
  if (!user) {
    window.dispatchEvent(new Event(PROFILE_SETUP_SESSION_EVENT));
    return;
  }

  window.sessionStorage.setItem(
    PROFILE_SETUP_USER_KEY,
    JSON.stringify({
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
    }),
  );
  window.dispatchEvent(new Event(PROFILE_SETUP_SESSION_EVENT));
}

export function markProfileDetailsSubmitted() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PROFILE_DETAILS_SUBMITTED_KEY, "true");
  window.dispatchEvent(new Event(PROFILE_SETUP_SESSION_EVENT));
}

export function areProfileDetailsSubmitted() {
  if (typeof window === "undefined") return false;
  return (
    window.sessionStorage.getItem(PROFILE_DETAILS_SUBMITTED_KEY) === "true"
  );
}

export function useProfileDetailsSubmitted() {
  return useSyncExternalStore(
    subscribeProfileSetupSession,
    areProfileDetailsSubmitted,
    () => false,
  );
}

export function isProfileSetupActive(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(PROFILE_SETUP_ACTIVE_KEY) === "true";
}

export function clearProfileSetupSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PROFILE_SETUP_ACTIVE_KEY);
  window.sessionStorage.removeItem(PROFILE_SETUP_USER_KEY);
  window.sessionStorage.removeItem(PROFILE_DETAILS_SUBMITTED_KEY);
  cachedProfileSetupUserRaw = null;
  cachedProfileSetupUser = emptyProfileSetupUser;
  window.dispatchEvent(new Event(PROFILE_SETUP_SESSION_EVENT));
}

export function useProfileSetupUser(): ProfileSetupUser {
  return useSyncExternalStore(
    subscribeProfileSetupSession,
    readProfileSetupUser,
    () => emptyProfileSetupUser,
  );
}
