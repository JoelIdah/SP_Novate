"use client";

import { useEffect, useState, type ReactNode } from "react";

import { getAccessToken, redirectToLoginForAuthentication } from "./authSession";

export function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      redirectToLoginForAuthentication();
      return;
    }

    const controller = new AbortController();
    fetch("/api/profile", {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (response.status === 401) {
          redirectToLoginForAuthentication();
          return;
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
