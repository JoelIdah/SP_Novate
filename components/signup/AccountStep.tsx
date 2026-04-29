"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { getAppleAuthNotWiredMessage } from "./social/apple";
import { getFacebookAuthNotWiredMessage } from "./social/facebook";
import { startGoogleAuth } from "./social/google";
import { SocialAuthButtons } from "./social/SocialAuthButtons";

import { socialAuthApi } from "./social/socialAuthApi";
import type { SocialProvider } from "./social/types";

export function AccountStep({
  onContinue,
}: {
  onContinue: (payload: { email: string; firstName: string; lastName: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSocialProvider, setActiveSocialProvider] = useState<SocialProvider | null>(null);
  const [socialError, setSocialError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailInputRef = useRef<HTMLInputElement | null>(null);

  const focusEmail = () => {
    emailInputRef.current?.focus();
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
    setLastNameError("");
    setFirstNameError("");
    setSocialError("");
    setSuccessMessage("");

    try {
      const result = await socialAuthApi({ provider, token: cleanToken });

      if (result.kind === "error") {
        setSocialError(result.message);
        return;
      }

      handleAuthSuccess(result.message, result.token);
    } catch {
      setSocialError("Could not reach social auth service. Please try again.");
    } finally {
      setActiveSocialProvider(null);
    }
  };

  const handleGoogleClick = () => {
    setEmailError("");
    setLastNameError("");
    setFirstNameError("");
    setSocialError("");
    setSuccessMessage("");

    startGoogleAuth({
      onError: (message) => {
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
    setLastNameError("");
    setFirstNameError("");
    setSocialError(getFacebookAuthNotWiredMessage());
  };

  const handleAppleClick = () => {
    setSuccessMessage("");
    setEmailError("");
    setLastNameError("");
    setFirstNameError("");
    setSocialError(getAppleAuthNotWiredMessage());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;
    setEmailError("");
    setLastNameError("");
    setFirstNameError("");
    setSocialError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      hasError = true;
    }
    if (!lastName.trim()) {
      setLastNameError("Last name is required.");
      hasError = true;
    }
    if (!firstName.trim()) {
      setFirstNameError("First name is required.");
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
        } else if (message.toLowerCase().includes("first")) {
          setFirstNameError(message);
        } else if (message.toLowerCase().includes("last")) {
          setLastNameError(message);
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
          Last name
          <input
            className={`mt-1.5 h-8.5 w-full rounded-[0.45rem] border px-3 text-[0.74rem] font-semibold text-[#4f5980] outline-none ${
              lastNameError ? "border-[#d04b4b]" : "border-[#d8dde8] focus:border-[#b6c0d8]"
            }`}
            onChange={(e) => {
              setLastName(e.target.value);
              if (lastNameError) setLastNameError("");
            }}
            placeholder="Enter your last name"
            type="text"
            value={lastName}
          />
          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              lastNameError ? "mt-0.5 max-h-5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <span className="block text-[0.64rem] font-medium leading-tight text-[#d04b4b]">{lastNameError}</span>
          </div>
        </label>

        <label className="block text-[0.71rem] font-semibold text-[#6f778c]">
          First Name
          <input
            className={`mt-1.5 h-8.5 w-full rounded-[0.45rem] border px-3 text-[0.74rem] font-semibold text-[#4f5980] outline-none ${
              firstNameError ? "border-[#d04b4b]" : "border-[#d8dde8] focus:border-[#b6c0d8]"
            }`}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (firstNameError) setFirstNameError("");
            }}
            placeholder="Enter your first name"
            type="text"
            value={firstName}
          />
          <div
            className={`overflow-hidden transition-all duration-200 ease-out ${
              firstNameError ? "mt-0.5 max-h-5 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <span className="block text-[0.64rem] font-medium leading-tight text-[#d04b4b]">{firstNameError}</span>
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

