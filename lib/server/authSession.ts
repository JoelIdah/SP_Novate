import type { NextResponse } from "next/server";

export const AUTH_TOKEN_COOKIE = "spnovate_auth_token";
export const PROFILE_SETUP_REQUIRED_COOKIE = "spnovate_profile_setup_required";

const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

function readJwtMaxAge(token: string): number {
  try {
    const payload = token.split(".")[1];
    if (!payload) return DEFAULT_SESSION_MAX_AGE_SECONDS;
    const decoded = JSON.parse(
      Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as { exp?: unknown };
    if (typeof decoded.exp !== "number") return DEFAULT_SESSION_MAX_AGE_SECONDS;
    return Math.max(1, Math.floor(decoded.exp - Date.now() / 1000));
  } catch {
    return DEFAULT_SESSION_MAX_AGE_SECONDS;
  }
}

export function readAuthToken(request: Request): string {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const prefix = `${AUTH_TOKEN_COOKIE}=`;
  const value = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);

  if (!value) return "";
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: readJwtMaxAge(token),
  });
}

export function readProfileSetupRequired(request: Request): boolean | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const prefix = `${PROFILE_SETUP_REQUIRED_COOKIE}=`;
  const value = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  return value === "1" ? true : value === "0" ? false : null;
}

export function setProfileSetupRequiredCookie(
  response: NextResponse,
  required: boolean,
) {
  response.cookies.set(PROFILE_SETUP_REQUIRED_COOKIE, required ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEFAULT_SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(PROFILE_SETUP_REQUIRED_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getBackendUrl(): string {
  return (process.env.API_BASE_URL?.trim() ?? "").replace(/\/$/, "");
}

export function isSameOriginMutation(request: Request): boolean {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return true;
  }
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}
