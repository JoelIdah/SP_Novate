"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Home,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";

type DashboardRole = "student" | "tutor";
type NavLabel = "Home" | "Bookings" | "Transactions" | "Resources" | "Chat";

const roleConfig = {
  student: {
    homeHref: "/students/dashboard",
    menuLabel: "Navigate",
    switchLabel: "Become a tutor",
    switchMobileLabel: "Switch to tutor dashboard",
    switchTitle: "Switch to tutor dashboard?",
    switchText: "You are about to switch from student view to tutor view. Do you want to continue?",
    switchHref: "/tutor/dashboard",
    profileName: "",
    profileEmail: "",
    items: [
      { label: "Home", href: "/students/dashboard", icon: Home },
      { label: "Bookings", href: "/students/bookings", icon: CalendarDays },
      { label: "Transactions", href: "/students/transactions", icon: CreditCard },
      { label: "Chat", href: "/students/chat", icon: MessageCircle },
    ],
  },
  tutor: {
    homeHref: "/tutor/dashboard",
    menuLabel: "Tutor menu",
    switchLabel: "Switch to student",
    switchMobileLabel: "Switch to student dashboard",
    switchTitle: "Switch to student dashboard?",
    switchText: "You are about to switch from tutor view to student view. Do you want to continue?",
    switchHref: "/students/dashboard",
    profileName: "Oluyinka Alabi",
    profileEmail: "Oluyinka@gmail.com",
    items: [
      { label: "Home", href: "/tutor/dashboard", icon: Home },
      { label: "Bookings", href: "/tutor/bookings", icon: CalendarDays },
      { label: "Transactions", href: "/tutor/transactions", icon: CreditCard },
      { label: "Resources", href: "/tutor/resources", icon: BookOpen },
      { label: "Chat", href: "/tutor/chat", icon: MessageCircle },
    ],
  },
} satisfies Record<DashboardRole, {
  homeHref: string;
  menuLabel: string;
  switchLabel: string;
  switchMobileLabel: string;
  switchTitle: string;
  switchText: string;
  switchHref: string;
  profileName: string;
  profileEmail: string;
  items: Array<{ label: NavLabel; href: string; icon: typeof Home }>;
}>;

export function DashboardNavbar({ role, active = "Home" }: { role: DashboardRole; active?: NavLabel }) {
  const router = useRouter();
  const config = roleConfig[role];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

  const openMenu = () => {
    setIsMenuMounted(true);
    setIsMenuOpen(true);
  };

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (!isMenuMounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (!isMenuOpen) {
      const timeout = window.setTimeout(() => setIsMenuMounted(false), 220);
      return () => {
        window.clearTimeout(timeout);
        document.body.style.overflow = previousOverflow;
      };
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuMounted, isMenuOpen]);

  return (
    <header className="dashboard-header z-50 border-b border-brand-line bg-white shadow-[0_1px_8px_rgba(31,40,74,0.05)]">
      <div className="grid min-h-[var(--topbar-h)] w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-[var(--app-gutter)] py-0 xl:gap-5">
        <Link className="flex h-11 items-center" href={config.homeHref} aria-label="SP Novate dashboard">
          <Image alt="SP Novate" className="h-8 w-auto xl:h-10" height={40} priority src="/logo/logo.png" width={40} />
        </Link>

        <nav aria-label={`${role} navigation`} className="navbar-scroll hidden self-stretch overflow-x-auto overflow-y-visible xl:flex xl:items-center xl:justify-center xl:gap-4 2xl:gap-5">
          {config.items.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === active;
            return (
              <Link
                key={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-full min-w-24 flex-col items-center justify-center gap-1 px-3 pb-1 pt-1 text-[0.9375rem] leading-tight ${
                  isActive ? "font-semibold text-brand-accent" : "font-medium text-[#5f6678] hover:text-[#434b5f]"
                }`}
                href={item.href}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-[#7073ea]" : "text-[#aeb5c4]"}`} strokeWidth={1.75} />
                <span>{item.label}</span>
                {isActive ? <span className="absolute bottom-0 left-1/2 h-0.5 w-16 -translate-x-1/2 rounded-full bg-brand-accent" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <button
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#2e3448] hover:bg-[#f4f5f8] xl:hidden"
            onClick={isMenuOpen ? closeMenu : openMenu}
            type="button"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            className="hidden rounded-full border border-ui-border bg-[#f2f3f7] px-4 py-2 text-sm font-medium text-[#454b5d] hover:bg-[#ebedf3] xl:inline-flex"
            onClick={() => setIsSwitchModalOpen(true)}
            type="button"
          >
            {config.switchLabel}
          </button>

          <button className="hidden items-center gap-2 rounded-full border border-ui-border bg-[#f2f3f7] p-1.5 xl:flex" type="button">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">O</span>
            {role === "tutor" ? (
              <span className="pr-1 text-left leading-tight">
                <span className="block text-xs font-semibold text-[#303755]">{config.profileName}</span>
                <span className="block text-[0.65rem] text-[#7f879d]">{config.profileEmail}</span>
              </span>
            ) : null}
            <ChevronDown className="h-3.5 w-3.5 text-[#8e93a1]" />
          </button>
        </div>
      </div>

      {isMenuMounted ? (
        <div className="fixed inset-0 z-[70] xl:hidden">
          <button
            aria-label="Close menu backdrop"
            className={`absolute inset-0 bg-[#0f1530]/35 transition-opacity duration-200 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
            onClick={closeMenu}
            type="button"
          />
          <aside
            aria-label={config.menuLabel}
            className={`absolute right-0 top-0 h-full w-[min(88vw,22rem)] border-l border-brand-line bg-white p-4 shadow-2xl transition-transform duration-200 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#4a5166]">{config.menuLabel}</p>
              <button aria-label="Close navigation menu" className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#2e3448] hover:bg-[#f4f5f8]" onClick={closeMenu} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid gap-2">
              {config.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.label === active;
                return (
                  <Link
                    key={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm font-semibold ${
                      isActive ? "border-[#d8daf8] bg-brand-primary-soft text-brand-accent" : "border-brand-line bg-white text-[#5f6678]"
                    }`}
                    href={item.href}
                    onClick={closeMenu}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              className="mt-3 min-h-11 w-full rounded-lg border border-[#d8daf8] bg-brand-primary-soft px-3 text-left text-sm font-semibold text-brand-accent"
              onClick={() => {
                closeMenu();
                setIsSwitchModalOpen(true);
              }}
              type="button"
            >
              {config.switchMobileLabel}
            </button>
          </aside>
        </div>
      ) : null}

      {isSwitchModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f1530]/35 px-4" onClick={() => setIsSwitchModalOpen(false)}>
          <section aria-labelledby="switch-dashboard-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-brand-line bg-white p-5 shadow-[var(--ui-shadow-overlay)]" onClick={(event) => event.stopPropagation()} role="dialog">
            <h2 className="text-base font-semibold text-ui-title" id="switch-dashboard-title">{config.switchTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ui-body">{config.switchText}</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className="min-h-11 rounded-full border border-ui-border bg-white px-4 text-sm font-semibold text-ui-body" onClick={() => setIsSwitchModalOpen(false)} type="button">Cancel</button>
              <button className="min-h-11 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white" onClick={() => router.push(config.switchHref)} type="button">Yes, switch</button>
            </div>
          </section>
        </div>
      ) : null}
    </header>
  );
}
