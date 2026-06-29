 "use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, CreditCard, Home, Menu, MessageCircle, X } from "lucide-react";

type NavLabel = "Home" | "Bookings" | "Transactions" | "Chat";

const navItems: Array<{
  label: NavLabel;
  href: string;
  icon: typeof Home;
}> = [
  { label: "Home", href: "/students/dashboard", icon: Home },
  { label: "Bookings", href: "/students/bookings", icon: CalendarDays },
  { label: "Transactions", href: "/students/transactions", icon: CreditCard },
  { label: "Chat", href: "/students/chat", icon: MessageCircle },
];

export function StudentDashboardNavbar({ active = "Home" }: { active?: NavLabel }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);

  const openMenu = () => {
    setIsMenuMounted(true);
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      return;
    }

    document.body.style.overflow = "";
    const timeout = setTimeout(() => setIsMenuMounted(false), 220);
    return () => clearTimeout(timeout);
  }, [isMenuOpen]);

  return (
    <header className="dashboard-header z-50 border-b border-[#ECEFF5] bg-white shadow-[0_1px_8px_rgba(31,40,74,0.05)]">
      <div className="grid min-h-[var(--topbar-h)] w-full grid-cols-[auto_1fr_auto] items-center gap-[0.9em] px-[1em] py-0">
        <div className="flex items-center">
          <Link href="/students/dashboard">
            <Image alt="SP Novate" className="h-[2em] w-auto" height={34} src="/logo/logo.png" width={34} />
          </Link>
        </div>

        <nav className="navbar-scroll hidden self-stretch overflow-x-auto overflow-y-visible px-[0.3em] xl:flex xl:items-center xl:justify-center xl:gap-[1.1em]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === active;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex h-full min-w-[4.5em] flex-col items-center justify-center gap-[0.1em] px-[0.56em] pb-[0.3em] pt-[0.24em] text-[0.92em] leading-[1.18] transition-colors ${
                  isActive ? "font-semibold text-[#4A46D6]" : "font-medium text-[#5F6678] hover:text-[#434B5F]"
                }`}
              >
                <Icon
                  strokeWidth={1.75}
                  className={`h-[0.82em] w-[0.82em] ${isActive ? "text-[#7073EA]" : "text-[#AEB5C4]"}`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-[0.1em] w-[3.7em] -translate-x-1/2 rounded-full bg-[#4B49D8]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-[0.52em]">
          <button
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="-mr-[0.72em] inline-flex h-[2.2em] w-[2.2em] items-center justify-center rounded-[0.35em] text-[#2e3448] xl:hidden"
            onClick={isMenuOpen ? closeMenu : openMenu}
            type="button"
          >
            {isMenuOpen ? <X className="h-[1.15em] w-[1.15em]" /> : <Menu className="h-[1.15em] w-[1.15em]" />}
          </button>

          <button
            className="hidden rounded-full border border-[#E6E8EF] bg-[#F2F3F7] px-[0.88em] py-[0.28em] text-[0.77em] font-medium text-[#454B5D] transition hover:bg-[#EBEDF3] xl:inline-flex"
            onClick={() => setIsTutorModalOpen(true)}
            type="button"
          >
            Become a tutor
          </button>

          <button className="hidden items-center gap-[0.22em] rounded-full bg-[#F1F2F6] px-[0.26em] py-[0.26em] xl:flex">
            <div className="flex h-[1.64em] w-[1.64em] items-center justify-center rounded-full bg-[#221D71] text-[0.78em] font-semibold text-white">
              O
            </div>
            <ChevronDown className="h-[0.72em] w-[0.72em] text-[#8E93A1]" />
          </button>
        </div>
      </div>

      {isMenuMounted ? (
        <div className="fixed inset-0 z-[70] xl:hidden">
          <button
            aria-label="Close menu backdrop"
            className={`absolute inset-0 transition-opacity duration-200 ${isMenuOpen ? "bg-[#0f1530]/35 opacity-100" : "bg-[#0f1530]/0 opacity-0"}`}
            onClick={closeMenu}
            type="button"
          />
          <div className={`absolute right-0 top-0 h-full w-[min(82vw,21em)] border-l border-[#e6eaf3] bg-white p-[1em] shadow-2xl transition-transform duration-200 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="mb-[1em] flex items-center justify-between">
              <p className="text-[0.9em] font-semibold text-[#4a5166]">Navigate</p>
              <button
                aria-label="Close navigation menu"
                className="inline-flex h-[2em] w-[2em] items-center justify-center rounded-[0.35em] text-[#2e3448]"
                onClick={closeMenu}
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
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

          </div>
        </div>
      ) : null}

      {isTutorModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f1530]/35 px-4">
          <div className="w-full max-w-[27rem] rounded-2xl border border-[#e6eaf3] bg-white p-5 shadow-2xl">
            <h3 className="text-[1rem] font-semibold text-[#2f3547]">Switch to tutor dashboard?</h3>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-[#69728b]">
              You are about to switch from student view to tutor view. Do you want to continue?
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="rounded-full border border-[#dbe1ee] bg-white px-4 py-1.5 text-[0.78rem] font-semibold text-[#5b6378]"
                onClick={() => setIsTutorModalOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-[#262563] px-4 py-1.5 text-[0.78rem] font-semibold text-white"
                onClick={() => {
                  setIsTutorModalOpen(false);
                  router.push("/tutor/dashboard");
                }}
                type="button"
              >
                Yes, switch
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

