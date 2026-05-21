import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="app-screen bg-brand-surface">
      <div
        aria-hidden
        className="auth-pattern absolute inset-0 bg-center bg-repeat opacity-90"
        style={{
          backgroundImage: "url('/images/hero-pattern.png')",
          backgroundSize: "clamp(760px, 80vw, 4000px)",
        }}
      />
      <section className="app-content-wrap relative z-10">
        <div className="auth-panel">{children}</div>

        <footer className="mt-[1.3em] flex w-full flex-wrap items-center justify-between gap-y-[0.5em] text-[0.78em] font-medium text-[#697188]">
          <div className="flex flex-wrap items-center gap-x-[1.4em] gap-y-[0.5em]">
            <Link href="#" className="transition-colors hover:text-[#1f2430]">
              SP Products
            </Link>
            <Link href="#" className="transition-colors hover:text-[#1f2430]">
              Pricing
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-[1.4em] gap-y-[0.5em]">
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



