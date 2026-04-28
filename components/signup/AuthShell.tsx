import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="app-screen bg-brand-surface">
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-repeat opacity-90"
        style={{
          backgroundImage: "url('/images/hero-pattern.png')",
          backgroundSize: "clamp(760px, 130vw, 1860px)",
        }}
      />

      <button
        aria-label="Close sign up"
        className="absolute right-3 top-3 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1f6f6c] text-white shadow-[0_2px_8px_rgba(31,111,108,0.35)] hover:bg-[#185a57] sm:right-4 sm:top-4"
        type="button"
      >
        <svg aria-hidden className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3.2 3.2L10.8 10.8M10.8 3.2L3.2 10.8"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.9"
          />
        </svg>
      </button>

      <section className="app-content-wrap relative z-10">
        <div className="flex-1" />
        <div className="auth-panel">{children}</div>
        <div className="flex-1" />
        <footer className="mt-8 flex w-full flex-wrap items-center justify-between gap-y-3 text-[0.775rem] font-medium text-[#697188] sm:mt-10 sm:text-[0.8rem]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="#" className="transition-colors hover:text-[#1f2430]">
              SP Products
            </Link>
            <Link href="#" className="transition-colors hover:text-[#1f2430]">
              Pricing
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="#" className="transition-colors hover:text-[#1f2430]">
              About
            </Link>
            <Link href="#" className="transition-colors hover:text-[#1f2430]">
              Terms of use
            </Link>
            <Link href="#" className="transition-colors hover:text-[#1f2430]">
              Privacy policy
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
