"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { redirectToLoginForAuthentication, setAuthSession } from "./authSession";
import {
  isAuthenticatedProfile,
  type AuthenticatedProfile,
} from "./profile";

export function SignedInLayout({
  children,
  protectTutorArea = false,
}: {
  children: ReactNode;
  protectTutorArea?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [profile, setProfile] = useState<AuthenticatedProfile | null>(null);

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
        if (!response.ok) {
          setStatus("error");
          return;
        }
        const payload = await response.json().catch(() => null) as {
          data?: Parameters<typeof setAuthSession>[0];
        } | null;
        if (!isAuthenticatedProfile(payload?.data)) {
          setStatus("error");
          return;
        }
        setAuthSession(payload.data);
        setProfile(payload.data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt]);

  const redirectPath = profile
    ? protectTutorArea &&
      profile.tutor_status !== "approved" &&
      !pathname.startsWith("/tutor/onboarding")
      ? "/tutor/onboarding"
      : null
    : null;

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  if (status === "ready" && !redirectPath) return children;
  if (status === "loading") return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-surface px-6">
      <section className="max-w-md text-center" role="alert">
        <h1 className="text-xl font-semibold text-brand-ink">SP Novate is temporarily unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">
          We could not verify your session. Your account area has not been opened.
        </p>
        <button
          className="mt-5 rounded-lg bg-brand-ink px-5 py-2.5 text-sm font-semibold text-white"
          type="button"
          onClick={() => {
            setStatus("loading");
            setAttempt((current) => current + 1);
          }}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
