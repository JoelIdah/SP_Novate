"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";

type VerifyOtpResponse = {
  message?: string;
  data?: {
    token?: string;
    user?: {
      public_id?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      role?: "student" | "tutor";
      profile_photo?: string;
    };
  };
};

type ResendOtpResponse = {
  message?: string;
};


export function OtpStep({
  email,
  onVerified,
}: {
  email: string;
  onVerified: (payload: {
    token?: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: "student" | "tutor";
    profilePhoto?: string;
    publicId?: string;
  }) => void;
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = useMemo(() => digits.join(""), [digits]);

  const handleVerify = async () => {
    if (!email.trim() || code.length !== 6) return;

    setIsVerifying(true);
    setErrorMessage("");
    setResendMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          token: code,
        }),
      });

      const raw = await response.text();
      let data: VerifyOtpResponse | null = null;

      if (raw) {
        try {
          data = JSON.parse(raw) as VerifyOtpResponse;
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        setErrorMessage(data?.message ?? "Invalid or expired OTP.");
        return;
      }

      const user = data?.data?.user;
      onVerified({
        token: data?.data?.token,
        email: user?.email ?? email.trim(),
        firstName: user?.first_name ?? "",
        lastName: user?.last_name ?? "",
        role: user?.role,
        profilePhoto: user?.profile_photo,
        publicId: user?.public_id,
      });
    } catch {
      setErrorMessage("Could not verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setErrorMessage("Please return to signup and enter your email again.");
      return;
    }

    setIsResending(true);
    setErrorMessage("");
    setResendMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const raw = await response.text();
      let data: ResendOtpResponse | null = null;

      if (raw) {
        try {
          data = JSON.parse(raw) as ResendOtpResponse;
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        setErrorMessage(data?.message ?? "Could not resend OTP right now.");
        return;
      }

      setResendMessage(data?.message ?? "OTP resent successfully.");
    } catch {
      setErrorMessage("Could not resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto mt-[0.9em] w-full max-w-[22.5em]">
      <div className="mb-[1.1em] flex justify-center">
        <div className="overflow-hidden rounded-[0.7em] shadow-[0_9px_20px_rgba(53,49,177,0.25)]">
          <Image alt="SP Novate" className="h-[2.8em] w-auto" height={48} src="/logo/logo.png" width={48} />
        </div>
      </div>
      <h2 className="text-center text-[1.25em] font-bold tracking-[-0.02em] text-[#1d2230]">Enter verification code</h2>
      <p className="mt-[0.4em] text-center text-[0.82em] text-[#9aa1b2]">Code sent to {email || "your email"}</p>

      <div className="mt-[1.35em] grid grid-cols-6 gap-[0.55em]">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            autoFocus={idx === 0}
            className="h-[3.1em] w-full rounded-[0.55em] border border-[#d8dde8] text-center text-[1.02em] font-semibold text-[#4f5980] outline-none focus:border-[#b6c0d8]"
            inputMode="numeric"
            maxLength={1}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[idx] && idx > 0) {
                inputRefs.current[idx - 1]?.focus();
              }
            }}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 1);
              setDigits((prev) => {
                const next = [...prev];
                next[idx] = value;
                return next;
              });
              if (value && idx < 5) {
                inputRefs.current[idx + 1]?.focus();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
              if (!pasted) return;
              setDigits((prev) => {
                const next = [...prev];
                for (let i = 0; i < 6; i += 1) next[i] = pasted[i] ?? "";
                return next;
              });
              const focusIndex = Math.min(pasted.length, 5);
              inputRefs.current[focusIndex]?.focus();
            }}
            ref={(node) => {
              inputRefs.current[idx] = node;
            }}
            type="text"
            value={digit}
          />
        ))}
      </div>

      <button
        className="mt-[1.35em] h-[3.1em] w-full rounded-full bg-[#231d71] text-[0.88em] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        disabled={code.length !== 6 || isVerifying}
        onClick={handleVerify}
        type="button"
      >
        {isVerifying ? "Verifying..." : "Verify code"}
      </button>

      <p className="mt-[0.8em] text-center text-[0.8em] text-[#8d95a8]">
        Didn&apos;t get a code?{" "}
        <button
          className="font-semibold text-[#2187d3] disabled:opacity-70"
          disabled={isResending}
          onClick={handleResend}
          type="button"
        >
          {isResending ? "Resending..." : "Resend"}
        </button>
      </p>

      <p className="mt-[0.8em] min-h-[1em] text-center text-[0.76em] font-medium text-[#d04b4b]">{errorMessage || "\u00A0"}</p>
      <p className="min-h-[1em] text-center text-[0.76em] font-medium text-[#247f57]">{resendMessage || "\u00A0"}</p>
    </div>
  );
}




