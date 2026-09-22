"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Repeat2,
  Settings,
  X,
} from "lucide-react";
import { signOut, useSessionUser } from "../auth/authSession";
import type { TutorStatus } from "../auth/profile";

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
  items: Array<{ label: NavLabel; href: string; icon: typeof Home }>;
}>;

type TutorEntryStatus = TutorStatus | "unknown";

const tutorEntryConfig = {
  unknown: {
    label: "Become a tutor",
    mobileLabel: "Become a tutor",
    title: "Become a tutor?",
    text: "Set up your tutor profile and submit it for evaluation while keeping your student account.",
    href: "/tutor/onboarding",
    confirmLabel: "Start tutor setup",
  },
  not_started: {
    label: "Become a tutor",
    mobileLabel: "Become a tutor",
    title: "Become a tutor?",
    text: "Set up your tutor profile and submit it for evaluation while keeping your student account.",
    href: "/tutor/onboarding",
    confirmLabel: "Start tutor setup",
  },
  in_progress: {
    label: "Continue tutor setup",
    mobileLabel: "Continue tutor setup",
    title: "Continue tutor setup?",
    text: "Continue your tutor application from where you stopped.",
    href: "/tutor/onboarding",
    confirmLabel: "Continue setup",
  },
  pending: {
    label: "Tutor application pending",
    mobileLabel: "View pending application",
    title: "Tutor application pending",
    text: "Your tutor application is under review. You can view its current status.",
    href: "/tutor/onboarding",
    confirmLabel: "View application",
  },
  rejected: {
    label: "Review tutor application",
    mobileLabel: "Review tutor application",
    title: "Review tutor application?",
    text: "Review your tutor application, update the required information, and submit it again.",
    href: "/tutor/onboarding",
    confirmLabel: "Review application",
  },
  approved: {
    label: "Switch to tutor dashboard",
    mobileLabel: "Switch to tutor dashboard",
    title: "Switch to tutor dashboard?",
    text: "You are about to switch from student view to tutor view. Do you want to continue?",
    href: "/tutor/dashboard",
    confirmLabel: "Yes, switch",
  },
} satisfies Record<TutorEntryStatus, {
  label: string;
  mobileLabel: string;
  title: string;
  text: string;
  href: string;
  confirmLabel: string;
}>;

export function DashboardNavbar({ role, active = "Home" }: { role: DashboardRole; active?: NavLabel | "Settings" }) {
  const router = useRouter();
  const config = roleConfig[role];
  const sessionUser = useSessionUser();
  const profileName = [sessionUser?.firstName, sessionUser?.lastName].filter(Boolean).join(" ") || sessionUser?.email || "Student";
  const profileInitial = profileName.charAt(0).toUpperCase();
  const tutorEntry = tutorEntryConfig[sessionUser?.tutorStatus || "unknown"];
  const studentView = role === "student";
  const switchLabel = studentView ? tutorEntry.label : config.switchLabel;
  const switchMobileLabel = studentView ? tutorEntry.mobileLabel : config.switchMobileLabel;
  const switchTitle = studentView ? tutorEntry.title : config.switchTitle;
  const switchText = studentView ? tutorEntry.text : config.switchText;
  const switchHref = studentView ? tutorEntry.href : config.switchHref;
  const switchConfirmLabel = studentView ? tutorEntry.confirmLabel : "Yes, switch";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const logOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setSigningOut(false);
    }
  };

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

  useEffect(() => {
    if (!profileMenuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileMenuOpen]);

  return (
    <header className="dashboard-header sticky top-0 z-50 border-b border-[#dfe4ee] bg-white shadow-[0_2px_12px_rgba(31,40,74,0.06)]">
      <div className="mx-auto grid min-h-[var(--topbar-h)] w-full max-w-[var(--dashboard-max-width)] grid-cols-[auto_1fr_auto] items-center gap-3 px-[var(--dashboard-gutter)] xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-6">
        <Link className="col-start-1 flex h-11 w-fit items-center rounded-lg" href={config.homeHref} aria-label="SP Novate dashboard">
          <Image alt="SP Novate" className="h-8 w-8 xl:h-10 xl:w-10" height={80} priority src="/logo/logo.png" width={80} />
        </Link>

        <nav aria-label={`${role} navigation`} className="navbar-scroll col-start-2 hidden self-stretch xl:flex xl:items-center xl:justify-center xl:gap-1.5 2xl:gap-2.5">
          {config.items.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === active;
            return (
              <Link
                key={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`group relative my-2 flex h-[calc(100%-1rem)] min-w-[5.75rem] flex-col items-center justify-center gap-1 rounded-lg px-3 text-[0.9rem] leading-tight transition-colors ${
                  isActive ? "font-semibold text-brand-accent" : "font-medium text-[#555d70] hover:text-[#30384c]"
                }`}
                href={item.href}
              >
                <Icon className={`h-[1.125rem] w-[1.125rem] transition-colors ${isActive ? "text-[#6265e5]" : "text-[#9ca6b8] group-hover:text-[#737d91]"}`} strokeWidth={1.8} />
                <span className="relative">
                  {item.label}
                  {isActive ? <span className="absolute -bottom-[0.95rem] left-0 h-[3px] w-full rounded-full bg-brand-accent" /> : null}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="col-start-3 flex min-w-0 items-center justify-end gap-2.5">
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
            className="hidden min-h-10 items-center gap-2 rounded-lg border border-[#dde2ec] bg-white px-3.5 text-sm font-medium text-[#454d60] transition-colors hover:border-[#cfd5e1] hover:bg-[#f8f9fb] xl:inline-flex"
            onClick={() => setIsSwitchModalOpen(true)}
            type="button"
          >
            <Repeat2 className="h-4 w-4 text-[#70798c]" strokeWidth={1.8} />
            {switchLabel}
          </button>

          <div className="relative hidden xl:block" ref={profileMenuRef}>
            <button aria-expanded={profileMenuOpen} aria-label={`Open account menu for ${profileName}`} className={`flex min-h-10 max-w-[12rem] items-center gap-2 rounded-lg border-l border-[#e1e5ed] py-1 pl-3 pr-2 ${active === "Settings" ? "bg-brand-primary-soft" : "hover:bg-[#f7f8fb]"}`} onClick={() => setProfileMenuOpen((current) => !current)} type="button">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">{profileInitial}</span>
              <span className="min-w-0 text-left leading-tight"><span className="block truncate text-xs font-semibold text-[#303755]">{profileName}</span><span className="mt-0.5 block text-[0.65rem] font-medium text-[#8a91a1]">{role === "tutor" ? "Tutor account" : "Student account"}</span></span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[#7b8497] transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {profileMenuOpen ? <div className="absolute right-0 top-[calc(100%+0.45rem)] z-50 w-52 rounded-xl border border-ui-border bg-white p-2 shadow-[var(--ui-shadow-overlay)]">{role === "tutor" ? <Link className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ui-body hover:bg-[#f7f8fb]" href="/tutor/settings" onClick={() => setProfileMenuOpen(false)}><Settings className="h-4 w-4" />Account settings</Link> : null}<button className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-[#a44343] hover:bg-[#fff7f5] disabled:opacity-50" disabled={signingOut} onClick={() => void logOut()} type="button"><LogOut className="h-4 w-4" />{signingOut ? "Logging out..." : "Log out"}</button></div> : null}
          </div>
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
              {role === "tutor" ? <Link
                aria-current={active === "Settings" ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 text-sm font-semibold ${active === "Settings" ? "border-[#d8daf8] bg-brand-primary-soft text-brand-accent" : "border-brand-line bg-white text-[#5f6678]"}`}
                href="/tutor/settings"
                onClick={closeMenu}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link> : null}
            </nav>
            <button
              className="mt-3 min-h-11 w-full rounded-lg border border-[#d8daf8] bg-brand-primary-soft px-3 text-left text-sm font-semibold text-brand-accent"
              onClick={() => {
                closeMenu();
                setIsSwitchModalOpen(true);
              }}
              type="button"
            >
              {switchMobileLabel}
            </button>
            <button className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-lg border border-[#eadede] px-3 text-left text-sm font-semibold text-[#a44343] disabled:opacity-50" disabled={signingOut} onClick={() => void logOut()} type="button"><LogOut className="h-4 w-4" />{signingOut ? "Logging out..." : "Log out"}</button>
          </aside>
        </div>
      ) : null}

      {isSwitchModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f1530]/35 px-4" onClick={() => setIsSwitchModalOpen(false)}>
          <section aria-labelledby="switch-dashboard-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-brand-line bg-white p-5 shadow-[var(--ui-shadow-overlay)]" onClick={(event) => event.stopPropagation()} role="dialog">
            <h2 className="text-base font-semibold text-ui-title" id="switch-dashboard-title">{switchTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ui-body">{switchText}</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button className="min-h-11 rounded-full border border-ui-border bg-white px-4 text-sm font-semibold text-ui-body" onClick={() => setIsSwitchModalOpen(false)} type="button">Cancel</button>
              <button className="min-h-11 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white" onClick={() => router.push(switchHref)} type="button">{switchConfirmLabel}</button>
            </div>
          </section>
        </div>
      ) : null}
    </header>
  );
}
