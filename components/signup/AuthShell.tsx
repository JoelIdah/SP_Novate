import Link from "next/link";
import type { ReactNode } from "react";

import { PRIVACY_POLICY_HREF, TERMS_OF_USE_HREF } from "../../config/legalLinks";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-screen bg-brand-surface">
      <div
        aria-hidden
        className="auth-pattern absolute inset-0 bg-center bg-repeat opacity-90"
        style={{
          backgroundImage: "url('/images/hero-pattern.png')",
          backgroundSize: "clamp(760px, 80vw, 4000px)",
        }}
      />
      <section className="auth-content-wrap relative z-10">
        <div className="auth-panel">{children}</div>

        <footer className="auth-footer mt-[1.3em] flex w-full flex-wrap items-center justify-center gap-x-[1.4em] gap-y-[0.5em] text-[0.78em] font-medium text-[#697188]">
          <Link
            href={TERMS_OF_USE_HREF}
            className="transition-colors hover:text-[#1f2430]"
            rel="noreferrer"
            target="_blank"
          >
            Terms of use
          </Link>
          <Link
            href={PRIVACY_POLICY_HREF}
            className="transition-colors hover:text-[#1f2430]"
            rel="noreferrer"
            target="_blank"
          >
            Privacy policy
          </Link>
        </footer>
      </section>
    </main>
  );
}



