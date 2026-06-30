"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AuthCardHeader } from "../../../components/signup/AuthCardHeader";
import { AuthCard, AuthPrimaryLink } from "../../../components/signup/AuthPrimitives";
import { AuthShell } from "../../../components/signup/AuthShell";

function ForgotPasswordSentContent() {
  const searchParams = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim();

  return (
    <AuthShell>
      <AuthCard>
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

          <AuthPrimaryLink className="mt-[1.2em]" href="/login">
            Go back to login
          </AuthPrimaryLink>
        </div>
      </AuthCard>
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



