"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AuthCardHeader } from "../../../components/signup/AuthCardHeader";
import { AuthShell } from "../../../components/signup/AuthShell";

export default function ForgotPasswordSentPage() {
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim();

  return (
    <AuthShell>
      <div className="auth-card relative rounded-[1.1rem] border border-[#d9dde8] bg-white/95 px-5 pb-6 pt-11 shadow-[0_9px_26px_rgba(23,30,63,0.09)] sm:px-7 sm:pb-7 sm:pt-12">
        <AuthCardHeader
          promptLinkHref="/login"
          promptLinkLabel="Log In"
          promptText="Remember your password?"
          title="Check your email"
        />

        <div className="mx-auto mt-3.5 w-full max-w-[20rem] text-center">
          <p className="text-[0.71rem] text-[#8d95a8]">
            We sent a reset link to {email || "your email"}. Open it to set a new password.
          </p>

          <Link
            className="mt-4 inline-flex h-9.5 w-full items-center justify-center rounded-full bg-[#231d71] text-[0.8rem] font-semibold text-white"
            href="/login"
          >
            Go back to login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
