"use client";

import { waitForAuthenticationRedirect } from "./authSession";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: number,
    readonly detail?: string,
  ) {
    super(message);
    this.name = "RequestError";
  }
}

export async function requestJson(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  if (!path.startsWith("/api/")) {
    throw new Error(`Browser requests must use an /api path: ${path}`);
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");

  const response = await fetch(path, { ...init, headers, cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as unknown;

  if (response.status === 401) return waitForAuthenticationRedirect();
  if (!response.ok) {
    throw new RequestError(
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "Something went wrong. Please try again.",
      response.status,
      isRecord(payload) && typeof payload.code === "number"
        ? payload.code
        : undefined,
      isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : undefined,
    );
  }

  return payload;
}
