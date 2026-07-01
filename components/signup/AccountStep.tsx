"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import {
  AuthDivider,
  AuthFieldError,
  AuthForm,
  AuthPasswordInput,
  AuthPasswordShell,
  AuthPrimaryButton,
  AuthTextInput,
  EyeIcon,
} from "./AuthPrimitives";
import { startFacebookAuth } from "./social/facebook";
import { startGoogleAuth } from "./social/google";
import { SocialAuthButtons } from "./social/SocialAuthButtons";

import { socialAuthApi } from "./social/socialAuthApi";
import type { SocialProvider } from "./social/types";
import { DIRECT_ONBOARDING_ENABLED } from "../../config/featureFlags";

type SsoUser = {
  role?: "student" | "tutor";
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_photo?: string;
  public_id?: string;
};

export function AccountStep({
  onContinue,
}: {
  onContinue: (payload: { email: string; firstName: string; lastName: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);
  const [socialError, setSocialError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirectOnboardingDisabled = !DIRECT_ONBOARDING_ENABLED;

  const focusEmail = () => {
    emailInputRef.current?.focus();
  };

  const isIgnorableSocialError = (message: string) => {
    const lower = message.toLowerCase();
    return lower.includes("timeout") || lower.includes("timed out");
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

  const redirectToReturnTarget = (token: string, user?: SsoUser) => {
    const returnTo = resolveSafeReturnTo();
    const state = resolveState();

    if (!returnTo || !state) return false;

    const target = new URL(returnTo);
    target.searchParams.set("token", token);
    target.searchParams.set("next", resolveSafeNextPath());
    target.searchParams.set("state", state);

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

  const redirectToLoginForExistingAccount = (accountEmail: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("email", accountEmail.trim());
    params.set("notice", "account_exists");
    params.delete("view");
    params.delete("stage");
    params.delete("step");
    params.delete("mode");
    params.delete("role");
    router.push(`/login?${params.toString()}`);
  };

  const isExistingAccountError = (message: string, status: number) => {
    const lower = message.toLowerCase();
    return (
      status === 409 ||
      lower.includes("already exists") ||
      lower.includes("already registered") ||
      lower.includes("account exists")
    );
  };

  const handleAuthSuccess = (message: string, token?: string) => {
    if (token) {
      localStorage.setItem("sp_access_token", token);
    }
    setSuccessMessage(message);
  };

  const handleSocialAuth = async (provider: SocialProvider, token: string) => {
    const cleanToken = token.trim();
    if (!cleanToken) {
      setSuccessMessage("");
      setEmailError("");
      setSocialError(`Missing ${provider} token. Authenticate with the ${provider} SDK first.`);
      return;
    }

    setActiveSocialProvider(provider);
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setSocialError("");
    setSuccessMessage("");

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
          router.push("/coming-soon");
          return;
        }

        if (result.token) {
          localStorage.setItem("sp_profile_setup_token", result.token);
        }
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "flow");
        params.set("stage", "setup");
        params.set("step", "personal");
        params.set("mode", "form");
        router.push(`${pathname}?${params.toString()}`);
        return;
      }

      if (result.token) {
        localStorage.setItem("sp_access_token", result.token);
        if (redirectToReturnTarget(result.token, result.user)) {
          return;
        }
      }
      if (isDirectOnboardingDisabled) {
        router.push("/coming-soon");
        return;
      }
      router.push("/students/dashboard");
    } catch {
      setSocialError("Could not reach social auth service. Please try again.");
    } finally {
      setActiveSocialProvider(null);
    }
  };

  const handleGoogleClick = () => {
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setSocialError("");
    setSuccessMessage("");

    startGoogleAuth({
      onError: (message) => {
        if (isIgnorableSocialError(message)) return;
        setSocialError(message);
        setSuccessMessage("");
      },
      onToken: (token) => {
        void handleSocialAuth("google", token);
      },
    });
  };

  const handleFacebookClick = () => {
    setSuccessMessage("");
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setSocialError("");
    startFacebookAuth({
      onError: (message) => {
        if (isIgnorableSocialError(message)) return;
        setSocialError(message);
        setSuccessMessage("");
      },
      onToken: (token) => {
        void handleSocialAuth("facebook", token);
      },
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;
    setEmailError("");
    setFirstNameError("");
    setLastNameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setSocialError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      hasError = true;
    }
    if (!firstName.trim()) {
      setFirstNameError("First name is required.");
      hasError = true;
    }
    if (!lastName.trim()) {
      setLastNameError("Last name is required.");
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirm password is required.");
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      hasError = true;
    }

    if (hasError) {
      if (!email.trim()) focusEmail();
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password,
          confirm_password: confirmPassword,
        }),
      });

      const raw = await response.text();
      let data: { message?: string } | null = null;

      if (raw) {
        try {
          data = JSON.parse(raw) as { message?: string };
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        const message = data?.message ?? "Sign up failed. Please try again.";

        if (isExistingAccountError(message, response.status)) {
          redirectToLoginForExistingAccount(email.trim());
          return;
        }

        if (message.toLowerCase().includes("email")) {
          setEmailError(message);
          focusEmail();
        } else if (message.toLowerCase().includes("confirm")) {
          setConfirmPasswordError(message);
        } else if (message.toLowerCase().includes("password")) {
          setPasswordError(message);
        } else if (message.toLowerCase().includes("first")) {
          setFirstNameError(message);
        } else if (message.toLowerCase().includes("last")) {
          setLastNameError(message);
        } else if (message.toLowerCase().includes("name")) {
          setFirstNameError(message);
        } else {
          setFirstNameError(message);
        }
        return;
      }

      handleAuthSuccess(data?.message ?? "Verification email sent.");
      onContinue({ email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim() });
    } catch {
      setFirstNameError("Could not reach signup service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthForm className="signup-auth-form" onSubmit={handleSubmit}>
      <SocialAuthButtons
        activeSocialProvider={activeSocialProvider}
        enableApple={false}
        onFacebookClick={handleFacebookClick}
        onGoogleClick={handleGoogleClick}
      />
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          socialError ? "mt-[0.35em] max-h-[1.6em] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[0.7em] font-medium text-[#d04b4b]">{socialError}</p>
      </div>

      <AuthDivider />

      <div className="auth-field-stack space-y-[0.3em]">
        <label className="block text-[0.78em] font-semibold text-[#6f778c]">
          Email
          <AuthTextInput
            invalid={Boolean(emailError)}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            placeholder="Enter your email"
            ref={emailInputRef}
            type="email"
            value={email}
          />
          <AuthFieldError message={emailError} />
        </label>

        <div className="grid grid-cols-1 gap-[0.8em] sm:grid-cols-2">
          <label className="block text-[0.78em] font-semibold text-[#6f778c]">
            First name
            <AuthTextInput
              invalid={Boolean(firstNameError)}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (firstNameError) setFirstNameError("");
              }}
              placeholder="Enter your first name"
              type="text"
              value={firstName}
            />
            <AuthFieldError message={firstNameError} />
          </label>

          <label className="block text-[0.78em] font-semibold text-[#6f778c]">
            Last name
            <AuthTextInput
              invalid={Boolean(lastNameError)}
              onChange={(e) => {
                setLastName(e.target.value);
                if (lastNameError) setLastNameError("");
              }}
              placeholder="Enter your last name"
              type="text"
              value={lastName}
            />
            <AuthFieldError message={lastNameError} />
          </label>
        </div>

        <label className="block text-[0.78em] font-semibold text-[#6f778c]">
          Password
          <AuthPasswordShell invalid={Boolean(passwordError)}>
            <AuthPasswordInput
              onChange={(e) => {
                const nextPassword = e.target.value;
                setPassword(nextPassword);
                if (passwordError) setPasswordError("");
                if (confirmPassword.trim()) {
                  if (nextPassword !== confirmPassword) {
                    setConfirmPasswordError("Passwords do not match.");
                  } else if (confirmPasswordError) {
                    setConfirmPasswordError("");
                  }
                }
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

        <label className="block text-[0.78em] font-semibold text-[#6f778c]">
          Confirm password
          <AuthPasswordShell invalid={Boolean(confirmPasswordError)}>
            <AuthPasswordInput
              onChange={(e) => {
                const nextConfirmPassword = e.target.value;
                setConfirmPassword(nextConfirmPassword);
                if (!nextConfirmPassword.trim()) {
                  if (confirmPasswordError) setConfirmPasswordError("");
                  return;
                }
                if (password !== nextConfirmPassword) {
                  setConfirmPasswordError("Passwords do not match.");
                } else if (confirmPasswordError) {
                  setConfirmPasswordError("");
                }
              }}
              placeholder="Confirm your password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
            />
            <button
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="text-[#7b84a0] hover:text-[#2187d3]"
              onClick={() => setShowConfirmPassword((v) => !v)}
              type="button"
            >
              <EyeIcon open={showConfirmPassword} />
            </button>
          </AuthPasswordShell>
          <AuthFieldError message={confirmPasswordError} />
        </label>
      </div>

      {successMessage ? <p className="mt-[0.6em] text-[0.72em] font-medium text-[#247f57]">{successMessage}</p> : null}

      <AuthPrimaryButton className="mt-[0.9em]" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Create an account"}
      </AuthPrimaryButton>

      <p className="auth-legal mx-auto mt-[0.8em] w-full max-w-full text-center text-[0.72em] font-medium leading-[1.35] text-[#8e95a8] sm:whitespace-nowrap">
        By continuing you accept the{" "}
        <Link href="#" className="text-[#1d2230] underline decoration-[#aeb6c8] underline-offset-2">
          Term of Use
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-[#1d2230] underline decoration-[#aeb6c8] underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </AuthForm>
  );
}




