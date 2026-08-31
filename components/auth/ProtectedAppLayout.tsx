"use client";

import { useEffect, useState, type ReactNode } from "react";

import { redirectToLoginForAuthentication, setAuthSession } from "./authSession";

export function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/profile", {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.status === 401) {
          redirectToLoginForAuthentication();
          return;
        }
        if (response.ok) {
          const payload = await response.json().catch(() => null) as { data?: Parameters<typeof setAuthSession>[0] } | null;
          setAuthSession(payload?.data);
        }
        setReady(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setReady(true);
      });
    return () => controller.abort();
  }, []);

  return ready ? children : null;
}
