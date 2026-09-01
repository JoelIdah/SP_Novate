"use client";

import { waitForAuthenticationRedirect } from "./authSession";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const normalizedPath = path.replace(/^\/?v1\/?/, "");
  const response = await fetch(`/api/${normalizedPath}`, { ...init, headers });
  if (response.status === 401) return waitForAuthenticationRedirect();
  return response;
}
