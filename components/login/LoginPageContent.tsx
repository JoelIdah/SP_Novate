"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthCardHeader } from "../signup/AuthCardHeader";
import { SocialAuthButtons } from "../signup/social/SocialAuthButtons";
import { getAppleAuthNotWiredMessage } from "../signup/social/apple";
import { getFacebookAuthNotWiredMessage } from "../signup/social/facebook";
import { startGoogleAuth } from "../signup/social/google";

import { socialAuthApi } from "../signup/social/socialAuthApi";
import type { SocialProvider } from "../signup/social/types";
import { AuthShell } from "../signup/AuthShell";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3L21 21" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
        <path
          d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
        <path
          d="M9.88 5.09C10.56 4.94 11.27 4.86 12 4.86C16.14 4.86 19.63 7.35 21 11.99C20.57 13.44 19.87 14.68 18.96 15.69M14.12 18.91C13.44 19.06 12.73 19.14 12 19.14C7.86 19.14 4.37 16.65 3 12.01C3.58 10.07 4.67 8.5 6.04 7.31"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.7"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 12.01C4.37 7.35 7.86 4.86 12 4.86C16.14 4.86 19.63 7.35 21 12.01C19.63 16.65 16.14 19.14 12 19.14C7.86 19.14 4.37 16.65 3 12.01Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function LoginPageContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const getJwtPurpose = (token: string): string | null => {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as { purpose?: string };
      return payload.purpose ?? null;
    } catch {
      return null;
    }
  };

  const handleSocialAuth = async (provider: SocialProvider, token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setSocialError(`Missing ${provider} token. Authenticate with the ${provider} SDK first.`);
      return;
    }

    setActiveSocialProvider(provider);
    setSocialError("");

    try {
      const result = await socialAuthApi({ provider, token: cleanToken });

      if (result.kind === "error") {
        setSocialError(result.message);
        return;
      }

      if (result.token) {
        localStorage.setItem("sp_access_token", result.token);
      }
    } catch {
      setSocialError("Could not reach social auth service. Please try again.");
    } finally {
      setActiveSocialProvider(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;
    setEmailError("");
    setPasswordError("");
    setSocialError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      hasError = true;
    }
    if (hasError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const raw = await response.text();
      let data:
        | {
            message?: string;
            data?: {
              token?: string;
              user?: {
                role?: "student" | "tutor";
                email?: string;
                first_name?: string;
                last_name?: string;
              };
            };
          }
        | null = null;

      if (raw) {
        try {
          data = JSON.parse(raw) as { message?: string; token?: string };
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        const message = data?.message ?? "Login failed. Please try again.";
        const lower = message.toLowerCase();
        if (lower.includes("email")) {
          setEmailError(message);
        } else if (lower.includes("password")) {
          setPasswordError(message);
        } else {
          setPasswordError(message);
        }
        return;
      }

      const token = data?.data?.token;
      if (token) {
        localStorage.setItem("sp_access_token", token);
        const purpose = getJwtPurpose(token);

        if (purpose === "profile_setup") {
          const role = data?.data?.user?.role;
          const params = new URLSearchParams({
            view: "flow",
            stage: "setup",
            step: "personal",
            mode: "form",
          });
          if (role === "student" || role === "tutor") {
            params.set("role", role);
          }
          router.push(`/signup?${params.toString()}`);
          return;
        }
      }
    } catch {
      setPasswordError("Could not reach login service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-card relative rounded-[1.1rem] border border-[#d9dde8] bg-white/95 px-5 pb-6 pt-11 shadow-[0_9px_26px_rgba(23,30,63,0.09)] sm:px-7 sm:pb-7 sm:pt-12">
        <AuthCardHeader
          showPrompt={false}
          title="Log in to your account"
        />

        <form className="mx-auto mt-3.5 w-full max-w-[20rem]" onSubmit={handleSubmit}>
          <p className="text-center text-[0.71rem] font-medium text-[#8d95a8]">Welcome back! Please enter your details.</p>

          <div className="mt-3.5 space-y-2">
            <SocialAuthButtons
              activeSocialProvider={activeSocialProvider}
              onAppleClick={() => {
                setSocialError(getAppleAuthNotWiredMessage());
              }}
              onFacebookClick={() => {
                setSocialError(getFacebookAuthNotWiredMessage());
              }}
              onGoogleClick={() => {
                setSocialError("");
                startGoogleAuth({
                  onError: (message) => setSocialError(message),
                  onToken: (token) => {
                    void handleSocialAuth("google", token);
                  },
                });
              }}
            />
            <div
              className={`overflow-hidden transition-all duration-200 ease-out ${
                socialError ? "mt-0.5 max-h-5 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-[0.66rem] font-medium text-[#d04b4b]">{socialError}</p>
            </div>
          </div>

          <div className="my-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#d9deea]" />
            <span className="text-[0.64rem] font-semibold uppercase text-[#9ba2b4]">or</span>
            <span className="h-px flex-1 bg-[#d9deea]" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[0.71rem] font-semibold text-[#6f778c]">
              Email
              <input
                className={`mt-1.5 h-8.5 w-full rounded-[0.45rem] border px-3 text-[0.74rem] font-semibold text-[#4f5980] outline-none ${
                  emailError ? "border-[#d04b4b]" : "border-[#d8dde8] focus:border-[#b6c0d8]"
                }`}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                value={email}
              />
              <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  emailError ? "mt-0.5 max-h-5 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <span className="block text-[0.64rem] font-medium leading-tight text-[#d04b4b]">{emailError}</span>
              </div>
            </label>

            <label className="block text-[0.71rem] font-semibold text-[#6f778c]">
              Password
              <div
                className={`mt-1.5 flex h-8.5 items-center rounded-[0.45rem] border px-3 ${
                  passwordError ? "border-[#d04b4b]" : "border-[#d8dde8] focus-within:border-[#b6c0d8]"
                }`}
              >
                <input
                  className="min-w-0 flex-1 bg-transparent text-[0.74rem] font-semibold text-[#4f5980] outline-none"
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-[#7b84a0] hover:text-[#2187d3]"
                  onClick={() => setShowPassword((v) => !v)}
                  type="button"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                  passwordError ? "mt-0.5 max-h-5 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <span className="block text-[0.64rem] font-medium leading-tight text-[#d04b4b]">{passwordError}</span>
              </div>
            </label>

            <Link
              className="inline-block text-[0.68rem] font-semibold text-[#2187d3] hover:text-[#17679f]"
              href={email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : "/forgot-password"}
            >
              Forgot your password?
            </Link>
          </div>

          <button
            className="mt-3 h-9.5 w-full rounded-full bg-[#231d71] text-[0.8rem] font-semibold text-white hover:bg-[#1c175f] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Continuing..." : "Continue with email"}
          </button>

          <p className="mt-3 text-center text-[0.71rem] font-medium text-[#8d95a8]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#2187d3] transition-colors hover:text-[#17679f]">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </AuthShell>
  );
}

