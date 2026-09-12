"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AuthCardHeader } from "../signup/AuthCardHeader";
import {
  AuthCard,
  AuthDivider,
  AuthFieldError,
  AuthFormError,
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

import { signInWithProvider } from "../signup/social/signInWithProvider";
import type { SocialProvider } from "../signup/social/types";
import { AuthShell } from "../signup/AuthShell";
import { saveProfileSetupUser } from "../signup/profileSetupSession";
import { setAuthSession } from "../auth/authSession";
import {
  fetchAuthenticatedProfile,
  type AuthenticatedProfile,
} from "../auth/profile";
import { getSsoReturnPath } from "../auth/ssoReturn";

type LoginResponse = {
  message?: string;
  data?: {
    profile_setup_required?: boolean;
    token?: string;
  };
};

export function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState((searchParams.get("email") ?? "").trim());
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialError, setSocialError] = useState("");
  const [activeSocialProvider, setActiveSocialProvider] =
    useState<SocialProvider | null>(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const signupHref = searchParams.toString()
    ? `/signup?${searchParams.toString()}`
    : "/signup";
  const notice = searchParams.get("notice");
  const statusNotice =
    notice === "account_exists"
      ? "This account already exists. Sign in with your password to continue."
      : notice === "email_verified"
        ? "Email verified. Sign in with your password to continue."
        : notice === "session_expired"
          ? "Your session expired. Sign in to continue."
        : "";
  const resolveSafeNextPath = (): string => {
    const candidate = searchParams.get("next");
    if (!candidate) return "/";

    const trimmed = candidate.trim();
    if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
    if (trimmed.includes("://")) return "/";
    return trimmed;
  };

  const returnToSpMeet = () => {
    const path = getSsoReturnPath(searchParams);
    if (!path) return false;
    window.location.assign(path);
    return true;
  };

  const buildProfileSetupHref = (): string => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    params.delete("stage");
    params.delete("step");
    params.delete("mode");
    params.delete("notice");
    params.delete("email");
    params.delete("firstName");
    params.delete("lastName");
    const query = params.toString();
    return query ? `/profile-setup?${query}` : "/profile-setup";
  };

  const storeProfileSetupSession = (user: AuthenticatedProfile) => {
    saveProfileSetupUser({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
    });
  };

  const handleSocialAuth = async (provider: SocialProvider, token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setSocialError(
        `Missing ${provider} token. Authenticate with the ${provider} SDK first.`,
      );
      return;
    }

    setActiveSocialProvider(provider);
    setSocialError("");

    try {
      const result = await signInWithProvider({ provider, token: cleanToken });

      if (result.kind === "error") {
        setSocialError(result.message);
        return;
      }

      const profile = await fetchAuthenticatedProfile();

      if (returnToSpMeet()) return;

      if (result.profileSetupRequired) {
        storeProfileSetupSession(profile);
        router.push(buildProfileSetupHref());
        return;
      }

      setAuthSession(profile);

      const nextPath = resolveSafeNextPath();
      if (nextPath !== "/") {
        router.push(nextPath);
        return;
      }

      router.push("/students/dashboard");
    } catch (error) {
      setSocialError(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setActiveSocialProvider(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;
    setEmailError("");
    setPasswordError("");
    setFormError("");
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
      let response: Response;

      try {
        response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.trim(),
              password,
            }),
          });
      } catch {
        setFormError("We couldn’t sign you in right now. Please try again.");
        return;
      }

      const raw = await response.text();
      let data: LoginResponse | null = null;

      if (raw) {
        try {
          data = JSON.parse(raw) as LoginResponse;
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
          setFormError(message);
        }
        return;
      }

      let profileSetupRequired: boolean;
      let profile: AuthenticatedProfile;
      try {
        if (typeof data?.data?.profile_setup_required !== "boolean") {
          throw new Error("We couldn’t finish signing you in. Please try again.");
        }
        profileSetupRequired = data.data.profile_setup_required;
        profile = await fetchAuthenticatedProfile();
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Could not complete login. Please try again.",
        );
        return;
      }

      if (returnToSpMeet()) return;

      if (profileSetupRequired) {
        storeProfileSetupSession(profile);
        router.push(buildProfileSetupHref());
        return;
      }

      setAuthSession(profile);

      const nextPath = resolveSafeNextPath();
      if (nextPath !== "/") {
        router.push(nextPath);
        return;
      }

      router.push("/students/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard tone="gradient">
        <AuthCardHeader showPrompt={false} title="Log in to your account" />

        <AuthForm className="login-auth-form" onSubmit={handleSubmit}>
          <p className="text-center text-[0.78em] font-medium text-[#8d95a8]">
            Welcome back! Please enter your details.
          </p>
          {statusNotice ? (
            <p className="mt-[0.75em] rounded-[0.65em] border border-[#b9d8c8] bg-[#f1fbf6] px-[0.9em] py-[0.7em] text-center text-[0.72em] font-medium text-[#247f57]">
              {statusNotice}
            </p>
          ) : null}

          <div className="mt-[0.9em]">
            <SocialAuthButtons
              activeSocialProvider={activeSocialProvider}
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
                socialError
                  ? "mt-[0.25em] max-h-[1.6em] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-[0.7em] font-medium text-[#d04b4b]">
                {socialError}
              </p>
            </div>
          </div>

          <AuthDivider />

          <div className="auth-field-stack space-y-[0.6em]">
            <label className="block text-[0.78em] font-semibold text-[#6f778c]">
              Email
              <AuthTextInput
                autoComplete="email"
                invalid={Boolean(emailError)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                  if (formError) setFormError("");
                }}
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
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                    if (formError) setFormError("");
                  }}
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

            <AuthFormError message={formError} />

            <Link
              className="inline-block text-[0.72em] font-semibold text-[#6f8fb5] hover:text-[#17679f]"
              href={
                email.trim()
                  ? `/forgot-password?email=${encodeURIComponent(email.trim())}`
                  : "/forgot-password"
              }
            >
              Forgot your password?
            </Link>
          </div>

          <AuthPrimaryButton
            className="mt-[0.95em]"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Continuing..." : "Continue with email"}
          </AuthPrimaryButton>

          <p className="mt-[0.95em] text-center text-[0.78em] font-medium text-[#8d95a8]">
            Don&apos;t have an account?{" "}
            <Link
              href={signupHref}
              className="font-semibold text-[#2187d3] transition-colors hover:text-[#17679f]"
            >
              Sign up
            </Link>
          </p>
        </AuthForm>
      </AuthCard>
    </AuthShell>
  );
}
