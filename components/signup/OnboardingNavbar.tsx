"use client";

import Image from "next/image";

type OnboardingNavbarProps = {
  email: string;
  name: string;
};

function getInitial(name: string, email: string) {
  return (name.trim() || email.trim() || "S").charAt(0).toUpperCase();
}

export function OnboardingNavbar({ email, name }: OnboardingNavbarProps) {
  const displayName = name.trim() || "Student";
  const displayEmail = email.trim() || "Complete your profile";

  return (
    <header className="dashboard-header z-50 shrink-0 border-b border-[#dfe4ee] bg-white shadow-[0_2px_12px_rgba(31,40,74,0.06)]">
      <div className="mx-auto grid min-h-[var(--topbar-h)] w-full max-w-[var(--dashboard-max-width)] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-[var(--dashboard-gutter)]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 shrink-0 items-center" aria-label="SP Novate">
            <Image alt="SP Novate" className="h-8 w-8 xl:h-10 xl:w-10" height={80} priority src="/logo/logo.png" width={80} />
          </div>
          <span aria-hidden className="hidden h-7 w-px bg-[#e1e5ed] sm:block" />
          <span className="hidden truncate text-sm font-semibold text-[#454d60] sm:block">Profile setup</span>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:border-l sm:border-[#e1e5ed] sm:pl-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
              {getInitial(displayName, displayEmail)}
            </span>
            <span className="hidden min-w-0 max-w-[11rem] text-left leading-tight md:block">
              <span className="block truncate text-xs font-semibold text-[#303755]">{displayName}</span>
              <span className="mt-0.5 block truncate text-[0.65rem] font-medium text-[#8a91a1]">{displayEmail}</span>
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
