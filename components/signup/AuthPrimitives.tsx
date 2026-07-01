"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  FormEventHandler,
  InputHTMLAttributes,
  ReactNode,
} from "react";

type ClassValue = string | false | null | undefined;

function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export function AuthCard({
  children,
  className,
  tone = "solid",
}: {
  children: ReactNode;
  className?: string;
  tone?: "solid" | "gradient";
}) {
  return (
    <div
      className={cx(
        "auth-card relative rounded-[1.35em] border-[0.08em] border-[#d9dde8] px-[1.5em] pb-[1.35em] pt-[1.3em]",
        tone === "gradient"
          ? "bg-gradient-to-b from-white to-[#fcfdff] shadow-[0_14px_34px_rgba(23,30,63,0.11)]"
          : "bg-white/95 shadow-[0_9px_26px_rgba(23,30,63,0.09)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AuthForm({
  children,
  className,
  onSubmit,
}: {
  children: ReactNode;
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}) {
  return (
    <form className={cx("auth-form mx-auto mt-[1.1em] w-full max-w-[22.5em]", className)} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export function AuthDivider({ className }: { className?: string }) {
  return (
    <div className={cx("auth-divider my-[0.8em] flex items-center gap-[0.9em]", className)}>
      <span className="h-px flex-1 bg-[#d9deea]" />
      <span className="text-[0.68em] font-semibold uppercase text-[#9ba2b4]">or</span>
      <span className="h-px flex-1 bg-[#d9deea]" />
    </div>
  );
}

export function AuthFieldError({ message }: { message?: string }) {
  return (
    <div
      className={cx(
        "overflow-hidden transition-all duration-200 ease-out",
        message ? "mt-[0.25em] max-h-[1.6em] opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <span className="block text-[0.64em] font-medium leading-tight text-[#d04b4b]">{message}</span>
    </div>
  );
}

export const AuthTextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function AuthTextInput({ className, invalid = false, ...props }, ref) {
  return (
    <input
      className={cx(
        "auth-text-input mt-[0.4em] h-[2.9em] w-full rounded-[0.5em] border px-[1em] text-[0.82em] font-semibold text-[#4f5980] outline-none",
        invalid ? "border-[#d04b4b]" : "border-[#d8dde8]",
        className
      )}
      data-invalid={invalid}
      ref={ref}
      {...props}
    />
  );
});

export function AuthPasswordShell({
  children,
  className,
  invalid = false,
}: {
  children: ReactNode;
  className?: string;
  invalid?: boolean;
}) {
  return (
    <div
      className={cx(
        "auth-input-shell mt-[0.4em] flex h-[2.9em] items-center rounded-[0.5em] border px-[1em]",
        invalid ? "border-[#d04b4b]" : "border-[#d8dde8]",
        className
      )}
      data-invalid={invalid}
    >
      {children}
    </div>
  );
}

export function AuthPasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cx(
        "min-w-0 flex-1 bg-transparent text-[0.82em] font-semibold text-[#4f5980] outline-none focus:outline-none focus-visible:!outline-none focus-visible:!outline-offset-0 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden",
        className
      )}
      {...props}
    />
  );
}

export function AuthPrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "auth-primary-action h-[3em] w-full rounded-full bg-[#231d71] text-[0.84em] font-semibold text-white hover:bg-[#1c175f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b88f5] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AuthPrimaryLink({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link
      className={cx(
        "auth-primary-action inline-flex h-[3em] w-full items-center justify-center rounded-full bg-[#231d71] text-[0.84em] font-semibold text-white hover:bg-[#1c175f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b88f5] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function EyeIcon({ open }: { open: boolean }) {
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
