import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronDown, CreditCard, Home, MessageCircle } from "lucide-react";

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
  return (
    <header className="dashboard-header z-50 border-b border-[#E8EAF1] bg-white shadow-[0_2px_10px_rgba(33,38,79,0.08)]">
      <div className="mx-auto grid h-[var(--topbar-h)] w-full max-w-[var(--dashboard-max-width)] grid-cols-[auto_1fr_auto] items-center gap-[clamp(0.75rem,1.4vw,1.6rem)] px-[var(--dashboard-gutter)]">
        <div className="flex items-center">
          <Link href="/dashboard">
            <Image alt="SP Novate" className="h-9 w-auto" height={36} src="/logo/logo.png" width={36} />
          </Link>
        </div>

        <nav className="flex h-full items-center justify-center gap-[clamp(0.7rem,1.5vw,2.2rem)] overflow-x-auto px-1 md:px-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === active;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex h-full min-w-[3.5rem] flex-col items-center justify-center gap-[2px] px-2 text-[clamp(0.9rem,0.78vw,1.02rem)] font-semibold leading-[150%] transition-colors ${
                  isActive ? "text-[#4A46D6]" : "text-[#5F6678] hover:text-[#434B5F]"
                }`}
              >
                <Icon
                  strokeWidth={1.9}
                  className={`h-[clamp(0.76rem,0.76vw,1.08rem)] w-[clamp(0.76rem,0.76vw,1.08rem)] ${isActive ? "text-[#7073EA]" : "text-[#A6ADBD]"}`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 h-[clamp(0.12rem,0.16vw,0.24rem)] w-[clamp(3.8rem,4vw,6rem)] rounded-full bg-[#4B49D8]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-[clamp(0.35rem,0.9vw,1.1rem)]">
          <button className="hidden rounded-full border border-[#E6E8EF] bg-[#F2F3F7] px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.35rem,0.55vw,0.6rem)] text-[clamp(0.9rem,0.75vw,1rem)] font-semibold text-[#454B5D] transition hover:bg-[#EBEDF3] md:inline-flex">
            Become a tutor
          </button>

          <button className="flex items-center gap-[clamp(0.25rem,0.45vw,0.55rem)] rounded-full bg-[#F1F2F6] px-[clamp(0.25rem,0.45vw,0.55rem)] py-[clamp(0.25rem,0.45vw,0.55rem)]">
            <div className="flex h-[clamp(1.6rem,2.1vw,2.35rem)] w-[clamp(1.6rem,2.1vw,2.35rem)] items-center justify-center rounded-full bg-[#221D71] text-[clamp(0.9rem,0.75vw,1rem)] font-semibold text-white">
              O
            </div>
            <ChevronDown className="h-[clamp(0.8rem,1vw,1.1rem)] w-[clamp(0.8rem,1vw,1.1rem)] text-[#8E93A1]" />
          </button>
        </div>
      </div>
    </header>
  );
}
