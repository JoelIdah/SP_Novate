"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AuthCardHeader } from "../signup/AuthCardHeader";
import {
  AuthCard,
  AuthDivider,
  AuthFieldError,
  AuthForm,
  AuthPasswordInput,
  AuthPasswordShell,
  AuthPrimaryButton,
  AuthTextInput,
  EyeIcon,
} from "../signup/AuthPrimitives";
import { SocialAuthButtons } from "../signup/social/SocialAuthButtons";
import { startFacebookAuth } from "../signup/social/facebook";
import { startGoogleAuth } from "../signup/social/google";

import { socialAuthApi } from "../signup/social/socialAuthApi";
import type { SocialProvider } from "../signup/social/types";
import { AuthShell } from "../signup/AuthShell";
import { DIRECT_ONBOARDING_ENABLED } from "../../config/featureFlags";

export function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState((searchParams.get("email") ?? "").trim());
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [redirectError, setRedirectError] = useState("");
  const isDirectOnboardingDisabled = !DIRECT_ONBOARDING_ENABLED;
  const signupHref = searchParams.toString() ? `/signup?${searchParams.toString()}` : "/signup";
  const notice = searchParams.get("notice");
  const statusNotice =
    notice === "account_exists"
      ? "This account already exists. Sign in with your password to continue."
      : notice === "email_verified"
        ? "Email verified. Sign in with your password to continue."
        : "";
  const redirectToComingSoon = () => {
    router.push("/coming-soon");
  };

  const getAllowedReturnOrigins = (): string[] =>
    (process.env.NEXT_PUBLIC_SPMEET_ALLOWED_CALLBACK_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

  const resolveSafeReturnTo = (): string | null => {
    const candidate = searchParams.get("returnTo")?.trim();
    if (!candidate) return null;

    try {
      const parsed = new URL(candidate);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
      const allowedOrigins = getAllowedReturnOrigins();
      if (!allowedOrigins.includes(parsed.origin)) return null;
      return parsed.toString();
    } catch {
      return null;
    }
  };

  const resolveState = (): string | null => {
    const candidate = searchParams.get("state");
    if (!candidate) return null;
    const trimmed = candidate.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const resolveSafeNextPath = (): string => {
    const candidate = searchParams.get("next");
    if (!candidate) return "/";

    const trimmed = candidate.trim();
    if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
    if (trimmed.includes("://")) return "/";
    return trimmed;
  };

  const encodeBase64Url = (value: string): string => {
    const bytes = new TextEncoder().encode(value);
    let binary = "";

    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  };

  const redirectToReturnTarget = (
    token: string,
    user?: { role?: "student" | "tutor"; email?: string; first_name?: string; last_name?: string; profile_photo?: string; public_id?: string }
  ) => {
    const requestedReturnTo = searchParams.get("returnTo");
    const allowedOrigins = getAllowedReturnOrigins();
    const returnTo = resolveSafeReturnTo();
    const state = resolveState();

    if (requestedReturnTo && allowedOrigins.length === 0) {
      setRedirectError("SSO callback origins are not configured.");
      return false;
    }

    if (requestedReturnTo && !returnTo) {
      setRedirectError("Untrusted or invalid callback URL.");
      return false;
    }

    if (requestedReturnTo && !state) {
      setRedirectError("Missing SSO state. Please retry login from SPMeet.");
      return false;
    }

    if (!returnTo) return false;

    const nextPath = resolveSafeNextPath();
    const target = new URL(returnTo);
    target.searchParams.set("token", token);
    target.searchParams.set("next", nextPath);
    target.searchParams.set("state", state!);

    if (user) {
      const userPayload = {
        role: user.role ?? "",
        email: user.email ?? "",
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        profile_photo: user.profile_photo ?? "",
        public_id: user.public_id ?? "",
      };
      target.searchParams.set("user", encodeBase64Url(JSON.stringify(userPayload)));
    }

    window.location.href = target.toString();
    return true;
  };

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
    setRedirectError("");

    try {
      const result = await socialAuthApi({ provider, token: cleanToken });

      if (result.kind === "error") {
        setSocialError(result.message);
        return;
      }

      if (result.profileSetupRequired) {
        if (result.token && redirectToReturnTarget(result.token, result.user)) {
          return;
        }

        if (isDirectOnboardingDisabled) {
          redirectToComingSoon();
          return;
        }

        if (result.token) {
          localStorage.setItem("sp_profile_setup_token", result.token);
        }
        router.push("/signup?view=flow&stage=setup&step=personal&mode=form");
        return;
      }

      if (result.token) {
        localStorage.setItem("sp_access_token", result.token);
        if (redirectToReturnTarget(result.token, result.user)) {
          return;
        }

        if (isDirectOnboardingDisabled) {
          redirectToComingSoon();
          return;
        }
      } else if (isDirectOnboardingDisabled) {
        redirectToComingSoon();
        return;
      }
      router.push("/students/dashboard");
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
    setRedirectError("");

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
                profile_photo?: string;
                public_id?: string;
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
      const user = data?.data?.user;
      if (token) {
        localStorage.setItem("sp_access_token", token);
        const purpose = getJwtPurpose(token);

        if (purpose === "profile_setup") {
          if (redirectToReturnTarget(token, user)) {
            return;
          }

          if (isDirectOnboardingDisabled) {
            redirectToComingSoon();
            return;
          }

          const params = new URLSearchParams({
            view: "flow",
            stage: "setup",
            step: "personal",
            mode: "form",
          });
          router.push(`/signup?${params.toString()}`);
          return;
        }

        if (redirectToReturnTarget(token, user)) {
          return;
        }

        if (isDirectOnboardingDisabled) {
          redirectToComingSoon();
          return;
        }
      } else if (isDirectOnboardingDisabled) {
        redirectToComingSoon();
        return;
      }

      router.push("/students/dashboard");
    } catch {
      setPasswordError("Could not reach login service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard tone="gradient">
        <AuthCardHeader showPrompt={false} title="Log in to your account" />

        <AuthForm className="login-auth-form" onSubmit={handleSubmit}>
          <p className="text-center text-[0.78em] font-medium text-[#8d95a8]">Welcome back! Please enter your details.</p>
          {statusNotice ? (
            <p className="mt-[0.75em] rounded-[0.65em] border border-[#b9d8c8] bg-[#f1fbf6] px-[0.9em] py-[0.7em] text-center text-[0.72em] font-medium text-[#247f57]">
              {statusNotice}
            </p>
          ) : null}

          <div className="mt-[0.9em]">
            <SocialAuthButtons
              activeSocialProvider={activeSocialProvider}
              enableApple={false}
              onFacebookClick={() => {
                setSocialError("");
                startFacebookAuth({
                  onError: (message) => setSocialError(message),
                  onToken: (token) => {
                    void handleSocialAuth("facebook", token);
                  },
                });
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
                socialError ? "mt-[0.25em] max-h-[1.6em] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-[0.7em] font-medium text-[#d04b4b]">{socialError}</p>
            </div>
            <div
              className={`overflow-hidden transition-all duration-200 ease-out ${
                redirectError ? "mt-[0.25em] max-h-[2.4em] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-[0.7em] font-medium text-[#d04b4b]">{redirectError}</p>
            </div>
          </div>

          <AuthDivider />

          <div className="auth-field-stack space-y-[0.6em]">
            <label className="block text-[0.78em] font-semibold text-[#6f778c]">
              Email
              <AuthTextInput
                invalid={Boolean(emailError)}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                value={email}
              />
              <AuthFieldError message={emailError} />
            </label>

            <label className="block text-[0.78em] font-semibold text-[#6f778c]">
              Password
              <AuthPasswordShell invalid={Boolean(passwordError)}>
                <AuthPasswordInput
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
              </AuthPasswordShell>
              <AuthFieldError message={passwordError} />
            </label>

            <Link
              className="inline-block text-[0.72em] font-semibold text-[#6f8fb5] hover:text-[#17679f]"
              href={email.trim() ? `/forgot-password?email=${encodeURIComponent(email.trim())}` : "/forgot-password"}
            >
              Forgot your password?
            </Link>
          </div>

          <AuthPrimaryButton className="mt-[0.95em]" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Continuing..." : "Continue with email"}
          </AuthPrimaryButton>

          <p className="mt-[0.95em] text-center text-[0.78em] font-medium text-[#8d95a8]">
            Don&apos;t have an account?{" "}
            <Link href={signupHref} className="font-semibold text-[#2187d3] transition-colors hover:text-[#17679f]">
              Sign up
            </Link>
          </p>
        </AuthForm>
      </AuthCard>
    </AuthShell>
  );
}




