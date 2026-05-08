"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { startAppleAuth } from "./social/apple";
import { startFacebookAuth } from "./social/facebook";
import { startGoogleAuth } from "./social/google";
import { SocialAuthButtons } from "./social/SocialAuthButtons";

import { socialAuthApi } from "./social/socialAuthApi";
import type { SocialProvider } from "./social/types";

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

export function AccountStep({
  onContinue,
}: {
  onContinue: (payload: { email: string; fullName: string; firstName: string; lastName: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);
  const [socialError, setSocialError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const focusEmail = () => {
    emailInputRef.current?.focus();
  };

  const isIgnorableSocialError = (message: string) => {
    const lower = message.toLowerCase();
    return lower.includes("timeout") || lower.includes("timed out");
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
    setFullNameError("");
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
      }
      router.push("/dashboard");
    } catch {
      setSocialError("Could not reach social auth service. Please try again.");
    } finally {
      setActiveSocialProvider(null);
    }
  };

  const handleGoogleClick = () => {
    setEmailError("");
    setFullNameError("");
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
    setFullNameError("");
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

  const handleAppleClick = () => {
    setSuccessMessage("");
    setEmailError("");
    setFullNameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setSocialError("");
    startAppleAuth({
      onError: (message) => {
        if (isIgnorableSocialError(message)) return;
        setSocialError(message);
        setSuccessMessage("");
      },
      onToken: (token) => {
        void handleSocialAuth("apple", token);
      },
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;
    setEmailError("");
    setFullNameError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setSocialError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      hasError = true;
    }
    if (!fullName.trim()) {
      setFullNameError("Full name is required.");
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
          full_name: fullName.trim(),
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

        if (message.toLowerCase().includes("email")) {
          setEmailError(message);
          focusEmail();
        } else if (message.toLowerCase().includes("confirm")) {
          setConfirmPasswordError(message);
        } else if (message.toLowerCase().includes("password")) {
          setPasswordError(message);
        } else if (message.toLowerCase().includes("name")) {
          setFullNameError(message);
        } else {
          setFullNameError(message);
        }
        return;
      }

      handleAuthSuccess(data?.message ?? "Verification email sent.");
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] ?? "";
      const lastName = parts.slice(1).join(" ");
      onContinue({ email: email.trim(), fullName: fullName.trim(), firstName, lastName });
    } catch {
      setFullNameError("Could not reach signup service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mx-auto mt-3.5 w-full max-w-[21.3rem]" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="block text-[0.71rem] font-semibold text-[#6f778c]">
          Email
          <input
            className={`mt-1.5 h-8.5 w-full rounded-[0.45rem] border px-3 text-[0.74rem] font-semibold text-[#4f5980] outline-none ${
              emailError ? "border-[#d04b4b]" : "border-[#d8dde8] focus:border-[#b6c0d8]"
            }`}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            placeholder="Enter your email"
            ref={emailInputRef}
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
          Full name
          <input
            className={`mt-1.5 h-8.5 w-full rounded-[0.45rem] border px-3 text-[0.74rem] font-semibold text-[#4f5980] outline-none ${
              fullNameError ? "border-[#d04b4b]" : "border-[#d8dde8] focus:border-[#b6c0d8]"
            }`}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fullNameError) setFullNameError("");
            }}
            placeholder="Enter your full name"
            type="text"
            value={fullName}
          />
          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              fullNameError ? "mt-0.5 max-h-5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <span className="block text-[0.64rem] font-medium leading-tight text-[#d04b4b]">{fullNameError}</span>
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
              className="min-w-0 flex-1 bg-transparent text-[0.74rem] font-semibold text-[#4f5980] outline-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
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
          </div>
          <div className={`overflow-hidden transition-all duration-200 ease-out ${passwordError ? "mt-0.5 max-h-5 opacity-100" : "max-h-0 opacity-0"}`}>
            <span className="block text-[0.64rem] font-medium leading-tight text-[#d04b4b]">{passwordError}</span>
          </div>
        </label>

        <label className="block text-[0.71rem] font-semibold text-[#6f778c]">
          Confirm password
          <div
            className={`mt-1.5 flex h-8.5 items-center rounded-[0.45rem] border px-3 ${
              confirmPasswordError ? "border-[#d04b4b]" : "border-[#d8dde8] focus-within:border-[#b6c0d8]"
            }`}
          >
            <input
              className="min-w-0 flex-1 bg-transparent text-[0.74rem] font-semibold text-[#4f5980] outline-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
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
          </div>
          <div className={`overflow-hidden transition-all duration-200 ease-out ${confirmPasswordError ? "mt-0.5 max-h-5 opacity-100" : "max-h-0 opacity-0"}`}>
            <span className="block text-[0.64rem] font-medium leading-tight text-[#d04b4b]">{confirmPasswordError}</span>
          </div>
        </label>
      </div>

      {successMessage ? <p className="mt-2 text-[0.68rem] font-medium text-[#247f57]">{successMessage}</p> : null}

      <button
        className="mt-3 h-9.5 w-full rounded-full bg-[#231d71] text-[0.8rem] font-semibold text-white hover:bg-[#1c175f] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating account..." : "Create an account"}
      </button>

      <div className="my-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#d9deea]" />
        <span className="text-[0.64rem] font-semibold uppercase text-[#9ba2b4]">or</span>
        <span className="h-px flex-1 bg-[#d9deea]" />
      </div>

      <SocialAuthButtons
        activeSocialProvider={activeSocialProvider}
        onAppleClick={handleAppleClick}
        onFacebookClick={handleFacebookClick}
        onGoogleClick={handleGoogleClick}
      />
      <div
        className={`overflow-hidden transition-all duration-200 ease-out ${
          socialError ? "mt-1.5 max-h-5 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[0.66rem] font-medium text-[#d04b4b]">{socialError}</p>
      </div>

      <p className="mx-auto mt-3 max-w-[17rem] text-center text-[0.66rem] font-medium leading-[1.35] text-[#8e95a8]">
        By continuing you accept the{" "}
        <Link href="#" className="underline">
          Term of Use
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline">
          Privacy Policy
        </Link>
      </p>
    </form>
  );
}

