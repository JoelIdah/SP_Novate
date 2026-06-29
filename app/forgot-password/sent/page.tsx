"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AuthCardHeader } from "../../../components/signup/AuthCardHeader";
import { AuthShell } from "../../../components/signup/AuthShell";

function ForgotPasswordSentContent() {
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim();

  return (
    <AuthShell>
      <div className="auth-card relative rounded-[1.35em] border-[0.08em] border-[#d9dde8] bg-white/95 px-[1.5em] pb-[1.35em] pt-[1.3em] shadow-[0_9px_26px_rgba(23,30,63,0.09)]">
        <AuthCardHeader
          promptLinkHref="/login"
          promptLinkLabel="Log In"
          promptText="Remember your password?"
          title="Check your email"
        />

        <div className="mx-auto mt-[1.1em] w-full max-w-[22.5em] text-center">
          <p className="text-[0.78em] text-[#8d95a8]">
            We sent a reset link to {email || "your email"}. Open it to set a new password.
          </p>

          <Link
            className="mt-[1.2em] inline-flex h-[3em] w-full items-center justify-center rounded-full bg-[#231d71] text-[0.84em] font-semibold text-white"
            href="/login"
          >
            Go back to login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default function ForgotPasswordSentPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordSentContent />
    </Suspense>
  );
}



