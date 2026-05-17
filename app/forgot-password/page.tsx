"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthCardHeader } from "../../components/signup/AuthCardHeader";
import { AuthShell } from "../../components/signup/AuthShell";


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

function ForgotPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = (searchParams.get("token") ?? "").trim();

  const [email, setEmail] = useState((searchParams.get("email") ?? "").trim());
  const [emailError, setEmailError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), platform: "web" }),
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
        setEmailError(data?.message ?? "Could not send reset link.");
        return;
      }

      router.push(`/forgot-password/sent?email=${encodeURIComponent(email.trim())}`);
    } catch {
      setEmailError("Could not send reset link. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPasswordError("");
    setConfirmPasswordError("");
    setSuccessMessage("");

    let hasError = false;
    if (!token) {
      setPasswordError("Missing reset token. Use your email reset link.");
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      hasError = true;
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Confirm password is required.");
      hasError = true;
    }
    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      hasError = true;
    }
    if (hasError) return;

    setIsResetting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auth/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirm_password: confirmPassword }),
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
        const message = data?.message ?? "Could not reset password.";
        if (message.toLowerCase().includes("match")) {
          setConfirmPasswordError(message);
        } else {
          setPasswordError(message);
        }
        return;
      }

      setSuccessMessage(data?.message ?? "Password reset successful.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Could not reset password. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-card relative rounded-[1.35em] border-[0.08em] border-[#d9dde8] bg-white/95 px-[1.5em] pb-[1.35em] pt-[1.3em] shadow-[0_9px_26px_rgba(23,30,63,0.09)]">
        <AuthCardHeader
          promptLinkHref="/login"
          promptLinkLabel="Log In"
          promptText="Remember your password?"
          title={token ? "Set new password" : "Forgot password"}
        />

        {token ? (
          <form className="mx-auto mt-[1.1em] w-full max-w-[22.5em]" onSubmit={handleReset}>
            <div className="mt-[1.1em] space-y-[0.6em]">
              <label className="block text-[0.78em] font-semibold text-[#6f778c]">
                New password
                <div className={`mt-[0.4em] flex h-[2.9em] items-center rounded-[0.5em] border px-[1em] ${passwordError ? "border-[#d04b4b]" : "border-[#d8dde8] focus-within:border-[#b6c0d8]"}`}>
                  <input className="min-w-0 flex-1 bg-transparent text-[0.82em] font-semibold text-[#4f5980] outline-none" onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} value={password} />
                  <button aria-label={showPassword ? "Hide password" : "Show password"} className="text-[#7b84a0] hover:text-[#2187d3]" onClick={() => setShowPassword((v) => !v)} type="button"><EyeIcon open={showPassword} /></button>
                </div>
                <div className={`overflow-hidden transition-all duration-200 ease-out ${passwordError ? "mt-[0.25em] max-h-[1.6em] opacity-100" : "max-h-0 opacity-0"}`}><span className="block text-[0.64em] font-medium leading-tight text-[#d04b4b]">{passwordError}</span></div>
              </label>

              <label className="block text-[0.78em] font-semibold text-[#6f778c]">
                Confirm password
                <div className={`mt-[0.4em] flex h-[2.9em] items-center rounded-[0.5em] border px-[1em] ${confirmPasswordError ? "border-[#d04b4b]" : "border-[#d8dde8] focus-within:border-[#b6c0d8]"}`}>
                  <input className="min-w-0 flex-1 bg-transparent text-[0.82em] font-semibold text-[#4f5980] outline-none" onChange={(e) => setConfirmPassword(e.target.value)} type={showConfirmPassword ? "text" : "password"} value={confirmPassword} />
                  <button aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} className="text-[#7b84a0] hover:text-[#2187d3]" onClick={() => setShowConfirmPassword((v) => !v)} type="button"><EyeIcon open={showConfirmPassword} /></button>
                </div>
                <div className={`overflow-hidden transition-all duration-200 ease-out ${confirmPasswordError ? "mt-[0.25em] max-h-[1.6em] opacity-100" : "max-h-0 opacity-0"}`}><span className="block text-[0.64em] font-medium leading-tight text-[#d04b4b]">{confirmPasswordError}</span></div>
              </label>
            </div>

            <button className="mt-[0.95em] h-[3em] w-full rounded-full bg-[#231d71] text-[0.84em] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={isResetting} type="submit">{isResetting ? "Resetting..." : "Reset password"}</button>
            <div className={`overflow-hidden text-center transition-all duration-200 ease-out ${successMessage ? "mt-[0.7em] max-h-[1.6em] opacity-100" : "max-h-0 opacity-0"}`}><p className="text-[0.68em] font-medium text-[#247f57]">{successMessage}</p></div>
          </form>
        ) : (
          <form className="mx-auto mt-[1.1em] w-full max-w-[22.5em]" onSubmit={handleSend}>
            <div className="mt-[1.1em] space-y-[0.6em]">
              <label className="block text-[0.78em] font-semibold text-[#6f778c]">
                Email
                <input className={`mt-[0.4em] h-[2.9em] w-full rounded-[0.5em] border px-[1em] text-[0.82em] font-semibold text-[#4f5980] outline-none ${emailError ? "border-[#d04b4b]" : "border-[#d8dde8] focus:border-[#b6c0d8]"}`} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" type="email" value={email} />
                <div className={`overflow-hidden transition-all duration-200 ease-out ${emailError ? "mt-[0.25em] max-h-[1.6em] opacity-100" : "max-h-0 opacity-0"}`}><span className="block text-[0.64em] font-medium leading-tight text-[#d04b4b]">{emailError}</span></div>
              </label>
            </div>

            <button className="mt-[0.95em] h-[3em] w-full rounded-full bg-[#231d71] text-[0.84em] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70" disabled={isSending} type="submit">{isSending ? "Sending..." : "Send reset link"}</button>

            <p className="mt-[0.95em] text-center text-[0.78em] font-medium text-[#8d95a8]">
              Back to{" "}
              <Link href="/login" className="font-semibold text-[#2187d3] transition-colors hover:text-[#17679f]">Log In</Link>
            </p>
          </form>
        )}
      </div>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}



