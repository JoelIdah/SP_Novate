 "use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, CreditCard, Home, Menu, MessageCircle, X } from "lucide-react";

type NavLabel = "Home" | "Bookings" | "Transactions" | "Chat";

const navItems: Array<{
  label: NavLabel;
  href: string;
  icon: typeof Home;
}> = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Transactions", href: "/transactions", icon: CreditCard },
  { label: "Chat", href: "/chat", icon: MessageCircle },
];

export function DashboardNavbar({ active = "Home" }: { active?: NavLabel }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuMounted(true);
      document.body.style.overflow = "hidden";
      return;
    }

    document.body.style.overflow = "";
    const timeout = setTimeout(() => setIsMenuMounted(false), 220);
    return () => clearTimeout(timeout);
  }, [isMenuOpen]);

  return (
    <header className="dashboard-header z-50 border-b border-[#E8EAF1] bg-white shadow-[0_0.14em_0.7em_rgba(33,38,79,0.08)]">
      <div className="relative flex h-[var(--topbar-h)] w-full items-center px-[0.9em]">
        <div className="z-10 flex items-center">
          <Link href="/dashboard">
            <Image alt="SP Novate" className="h-[2.1em] w-auto" height={36} src="/logo/logo.png" width={36} />
          </Link>
        </div>

        <nav className="absolute left-1/2 top-1/2 hidden h-full -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[1.2em] overflow-x-auto navbar-scroll px-[0.3em] lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === active;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex h-full min-w-[4em] flex-col items-center justify-center gap-[0.15em] px-[0.55em] text-[0.95em] font-semibold leading-[150%] transition-colors ${
                  isActive ? "text-[#4A46D6]" : "text-[#5F6678] hover:text-[#434B5F]"
                }`}
              >
                <Icon
                  strokeWidth={1.9}
                  className={`h-[0.95em] w-[0.95em] ${isActive ? "text-[#7073EA]" : "text-[#A6ADBD]"}`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 h-[0.14em] w-[4.4em] rounded-full bg-[#4B49D8]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="z-10 ml-auto flex items-center justify-end gap-[0.65em]">
          <button
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-[2.2em] w-[2.2em] items-center justify-center rounded-[0.35em] text-[#2e3448] lg:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            type="button"
          >
            {isMenuOpen ? <X className="h-[1.15em] w-[1.15em]" /> : <Menu className="h-[1.15em] w-[1.15em]" />}
          </button>

          <button className="hidden rounded-full border border-[#E6E8EF] bg-[#F2F3F7] px-[1em] py-[0.4em] text-[0.9em] font-semibold text-[#454B5D] transition hover:bg-[#EBEDF3] lg:inline-flex">
            Become a tutor
          </button>

          <button className="hidden items-center gap-[0.35em] rounded-full bg-[#F1F2F6] px-[0.35em] py-[0.35em] lg:flex">
            <div className="flex h-[2em] w-[2em] items-center justify-center rounded-full bg-[#221D71] text-[0.9em] font-semibold text-white">
              O
            </div>
            <ChevronDown className="h-[0.9em] w-[0.9em] text-[#8E93A1]" />
          </button>
        </div>
      </div>

      {isMenuMounted ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            aria-label="Close menu backdrop"
            className={`absolute inset-0 transition-opacity duration-200 ${isMenuOpen ? "bg-[#0f1530]/35 opacity-100" : "bg-[#0f1530]/0 opacity-0"}`}
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div className={`absolute right-0 top-0 h-full w-[min(82vw,21em)] border-l border-[#e6eaf3] bg-white p-[1em] shadow-2xl transition-transform duration-200 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="mb-[1em] flex items-center justify-between">
              <p className="text-[0.9em] font-semibold text-[#4a5166]">Navigate</p>
              <button
                aria-label="Close navigation menu"
                className="inline-flex h-[2em] w-[2em] items-center justify-center rounded-[0.35em] text-[#2e3448]"
                onClick={() => setIsMenuOpen(false)}
                type="button"
              >
                <X className="h-[1.15em] w-[1.15em]" />
              </button>
            </div>

            <nav className="grid grid-cols-1 gap-[0.5em]">
              {navItems.map((item) => {
                const isActive = item.label === active;

                return (
                  <Link
                    key={item.label}
                    className={`rounded-[0.55em] border px-[0.9em] py-[0.65em] text-[0.82em] font-semibold ${
                      isActive
                        ? "border-[#d8daf8] bg-[#eef0ff] text-[#4A46D6]"
                        : "border-[#e6eaf3] bg-white text-[#5F6678]"
                    }`}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

          </div>
        </div>
      ) : null}
    </header>
  );
}
