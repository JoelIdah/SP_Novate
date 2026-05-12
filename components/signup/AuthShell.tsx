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
          backgroundSize: "clamp(760px, 130vw, 1860px)",
        }}
      />
      <section className="app-content-wrap relative z-10">
        <div className="auth-panel">{children}</div>

        <footer className="mt-[clamp(0.7rem,0.8vw,1.1rem)] flex w-full flex-wrap items-center justify-between gap-y-2 text-[clamp(0.68rem,0.62vw,0.86rem)] font-medium text-[#697188]">
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


