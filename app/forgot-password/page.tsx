"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthCardHeader } from "../../components/signup/AuthCardHeader";
import {
  AuthCard,
  AuthFieldError,
  AuthForm,
  AuthPasswordInput,
  AuthPasswordShell,
  AuthPrimaryButton,
  AuthTextInput,
  EyeIcon,
} from "../../components/signup/AuthPrimitives";
import { AuthShell } from "../../components/signup/AuthShell";

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
      <AuthCard>
        <AuthCardHeader
          promptLinkHref="/login"
          promptLinkLabel="Log In"
          promptText="Remember your password?"
          title={token ? "Set new password" : "Forgot password"}
        />

        {token ? (
          <AuthForm onSubmit={handleReset}>
            <div className="mt-[1.1em] space-y-[0.6em]">
              <label className="block text-[0.78em] font-semibold text-[#6f778c]">
                New password
                <AuthPasswordShell invalid={Boolean(passwordError)}>
                  <AuthPasswordInput onChange={(e) => setPassword(e.target.value)} placeholder="Enter your new password" type={showPassword ? "text" : "password"} value={password} />
                  <button aria-label={showPassword ? "Hide password" : "Show password"} className="text-[#7b84a0] hover:text-[#2187d3]" onClick={() => setShowPassword((v) => !v)} type="button"><EyeIcon open={showPassword} /></button>
                </AuthPasswordShell>
                <AuthFieldError message={passwordError} />
              </label>

              <label className="block text-[0.78em] font-semibold text-[#6f778c]">
                Confirm password
                <AuthPasswordShell invalid={Boolean(confirmPasswordError)}>
                  <AuthPasswordInput onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your new password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} />
                  <button aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} className="text-[#7b84a0] hover:text-[#2187d3]" onClick={() => setShowConfirmPassword((v) => !v)} type="button"><EyeIcon open={showConfirmPassword} /></button>
                </AuthPasswordShell>
                <AuthFieldError message={confirmPasswordError} />
              </label>
            </div>

            <AuthPrimaryButton className="mt-[0.95em]" disabled={isResetting} type="submit">{isResetting ? "Resetting..." : "Reset password"}</AuthPrimaryButton>
            <div className={`overflow-hidden text-center transition-all duration-200 ease-out ${successMessage ? "mt-[0.7em] max-h-[1.6em] opacity-100" : "max-h-0 opacity-0"}`}><p className="text-[0.68em] font-medium text-[#247f57]">{successMessage}</p></div>
          </AuthForm>
        ) : (
          <AuthForm onSubmit={handleSend}>
            <div className="mt-[1.1em] space-y-[0.6em]">
              <label className="block text-[0.78em] font-semibold text-[#6f778c]">
                Email
                <AuthTextInput invalid={Boolean(emailError)} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" type="email" value={email} />
                <AuthFieldError message={emailError} />
              </label>
            </div>

            <AuthPrimaryButton className="mt-[0.95em]" disabled={isSending} type="submit">{isSending ? "Sending..." : "Send reset link"}</AuthPrimaryButton>
          </AuthForm>
        )}
      </AuthCard>
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




