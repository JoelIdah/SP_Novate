"use client";

import { getAccessToken, waitForAuthenticationRedirect } from "./authSession";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getAccessToken();
  if (!token) return waitForAuthenticationRedirect();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBaseUrl) throw new Error("The API base URL is not configured.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, { ...init, headers });
  if (response.status === 401) return waitForAuthenticationRedirect();
  return response;
}
