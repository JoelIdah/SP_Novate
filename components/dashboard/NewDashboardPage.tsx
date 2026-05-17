
"use client";

import Link from "next/link";
import Image from "next/image";
import { DashboardNavbar } from "./DashboardNavbar";
import { useEffect, useState } from "react";
import {
  Home,
  CalendarDays,
  CreditCard,
  MessageCircle,
  Menu,
  X,
  Search,
  ChevronRight,
  MoreVertical,
  PlayCircle,
} from "lucide-react";

const stats = [
  {
    label: "Sessions booked",
    value: 8,
  },
  {
    label: "Sessions completed",
    value: 2,
  },
  {
    label: "Sessions ongoing",
    value: 4,
  },
  {
    label: "Sessions pending",
    value: 2,
  },
];

const bookings = [
  {
    tutor: "Mr. Akin-akintaylor",
    subject: "Entrance Exams",
    status: "Completed",
    color: "#22C55E",
  },
  {
    tutor: "Mr. Oluyinka Alabi",
    subject: "Entrance Exams",
    status: "Completed",
    color: "#22C55E",
  },
  {
    tutor: "Mr. Oluyinka Alabi",
    subject: "Entrance Exams",
    status: "Completed",
    color: "#22C55E",
  },
  {
    tutor: "Mr. Oluyinka Alabi",
    subject: "Entrance Exams",
    status: "Ongoing",
    color: "#A855F7",
  },
  {
    tutor: "Mr. Oluyinka Alabi",
    subject: "Entrance Exams",
    status: "Awaiting approval",
    color: "#3B82F6",
  },
];

const messages = [
  {
    name: "Ekene Ezegbunam",
    message: "Hi Oluyinka, I would love to book a session.",
    time: "11:25",
    initials: "EE",
    avatarBg: "#D6B18A",
    avatarText: "#5E3B1E",
  },
  {
    name: "Akin-akintaylor Akinbowale",
    message: "Hi Oluyinka, I would love to book a session.",
    time: "11:25",
    initials: "A",
    avatarBg: "#166534",
    avatarText: "#FFFFFF",
  },
  {
    name: "Quadri Ahmed",
    message: "Hi Oluyinka, I would love to book a session.",
    time: "11:25",
    initials: "Q",
    avatarBg: "#14532D",
    avatarText: "#FFFFFF",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-screen bg-white text-[#1E1E1E]">
      <div className="xl:hidden">
        <MobileDashboardView />
      </div>
      <div className="hidden xl:block">
      <div className="dashboard-shell">
      <DashboardNavbar active="Home" />

      <main className="dashboard-main">
        <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
          <div className="dashboard-stack" data-dashboard-content>
            <section>
              <SectionTitle title="Actions" />

              <div className="grid grid-cols-1 gap-[var(--panel-gap)] md:grid-cols-3">
                <ActionCard
                  title="Book a session"
                  subtitle="Find a tutor and schedule your session."
                  iconBg="bg-[#DCEEFF]"
                  iconColor="text-[#3B82F6]"
                  border="border-[#BFDBFE]"
                  bg="bg-[#F7FBFF]"
                  icon={<CalendarDays className="h-[clamp(1rem,1vw,1.45rem)] w-[clamp(1rem,1vw,1.45rem)]" strokeWidth={2} />}
                />

                <ActionCard
                  title="Start a conversation"
                  subtitle="Go to your chat with the tutors"
                  iconBg="bg-[#DDF8F3]"
                  iconColor="text-[#14B8A6]"
                  border="border-[#B8F1E8]"
                  bg="bg-[#F4FFFD]"
                  icon={<MessageCircle className="h-[clamp(1rem,1vw,1.45rem)] w-[clamp(1rem,1vw,1.45rem)]" strokeWidth={2} />}
                />

                <ActionCard
                  title="Check transactions"
                  subtitle="Add money to your main balance."
                  iconBg="bg-[#FEF3C7]"
                  iconColor="text-[#D97706]"
                  border="border-[#FDE68A]"
                  bg="bg-[#FFFCF5]"
                  icon={<CreditCard className="h-[clamp(1rem,1vw,1.45rem)] w-[clamp(1rem,1vw,1.45rem)]" strokeWidth={2} />}
                />
              </div>
            </section>

            <section>
              <SectionTitle title="Learning Overview" />

              <div className="grid grid-cols-1 gap-[var(--panel-gap)] md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[clamp(0.58rem,0.66vw,0.95rem)] border border-[#E5E7EB] bg-white px-[clamp(0.9rem,1vw,1.5rem)] py-[clamp(0.85rem,1vw,1.35rem)]"
                  >
                    <p className="text-[clamp(0.85rem,0.7vw,0.98rem)] leading-[150%] text-[#9CA3AF]">{stat.label}</p>

                    <h3 className="mt-1 text-[clamp(1.2rem,1.1vw,1.6rem)] font-semibold leading-[120%] tracking-[-0.2px] text-[#111827]">
                      {stat.value}
                    </h3>
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-section-fill">
              <div className="dashboard-section-fill-grid grid grid-cols-1 gap-[var(--panel-gap)] lg:grid-cols-2">
                <div className="dashboard-section-fill-card overflow-x-auto rounded-2xl border border-[#E6E9F2] bg-white shadow-[0_8px_24px_rgba(27,35,74,0.04)]">
                  <CardHeader
                    title="Managed Bookings"
                    action="Go to managed bookings"
                  />

                  <table className="dashboard-section-fill-body min-w-[34rem] w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#F4F6FA] text-[clamp(0.9rem,0.75vw,1rem)] leading-[150%] text-[#848BA0]">
                        <th className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)] font-medium">Tutor</th>
                        <th className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)] font-medium">Subject</th>
                        <th className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)] font-medium">Status</th>
                        <th className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)]" />
                      </tr>
                    
                    </thead>

                    <tbody>
                      {bookings.map((booking, index) => (
                        <tr
                          key={index}
                          className={`border-t border-[#EEF1F6] text-[clamp(0.9rem,0.78vw,1.05rem)] leading-[150%] font-normal text-[#4F566A] ${index >= 3 ? "compact-hide" : index === 2 ? "ultra-compact-hide" : ""}`}
                        >
                          <td className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.46rem,0.56vw,0.8rem)]">{booking.tutor}</td>
                          <td className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.46rem,0.56vw,0.8rem)]">{booking.subject}</td>
                          <td className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.46rem,0.56vw,0.8rem)]">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-[clamp(0.34rem,0.34vw,0.5rem)] w-[clamp(0.34rem,0.34vw,0.5rem)] rounded-full"
                                style={{ backgroundColor: booking.color }}
                              />
                              {booking.status}
                            </div>
                          </td>
                          <td className="px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.46rem,0.56vw,0.8rem)] text-right">
                            <MoreVertical className="ml-auto h-[clamp(0.8rem,1vw,1.1rem)] w-[clamp(0.8rem,1vw,1.1rem)] text-[#9CA3AF]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="dashboard-section-fill-card overflow-hidden rounded-2xl border border-[#E6E9F2] bg-white shadow-[0_8px_24px_rgba(27,35,74,0.04)]">
                  <CardHeader title="Messages" action="Go to chat" />

                  <div className="border-b border-[#EEF1F6] px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.45rem,0.75vw,0.85rem)] text-[clamp(0.9rem,0.75vw,1rem)] font-medium leading-[150%] text-[#B1B7C6]">
                    Chat
                  </div>

                  <div className="dashboard-section-fill-body">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-[clamp(0.65rem,1vw,1.2rem)] border-b border-[#F0F2F7] px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.45rem,0.75vw,0.85rem)] last:border-b-0 hover:bg-[#FAFAFA] ${index === 2 ? "compact-hide" : index === 1 ? "ultra-compact-hide" : ""}`}
                      >
                        <div
                          className="flex h-[clamp(1.8rem,1.8vw,2.6rem)] w-[clamp(1.8rem,1.8vw,2.6rem)] items-center justify-center rounded-md text-[clamp(0.74rem,0.72vw,1rem)] font-semibold"
                          style={{
                            backgroundColor: message.avatarBg,
                            color: message.avatarText,
                          }}
                        >
                          {message.initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[clamp(0.98rem,0.85vw,1.15rem)] leading-[150%] font-semibold text-[#374151]">
                            {message.name}
                          </p>

                          <p className="truncate text-[clamp(0.88rem,0.72vw,0.98rem)] leading-[150%] text-[#9CA3AF]">
                            {message.message}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[clamp(0.88rem,0.72vw,0.98rem)] text-[#9CA3AF]">
                            {message.time}
                          </span>

                          <div className="flex h-[clamp(0.8rem,0.8vw,1.15rem)] w-[clamp(0.8rem,0.8vw,1.15rem)] items-center justify-center rounded-full bg-[#4338CA] text-[clamp(0.8rem,0.65vw,0.9rem)] text-white">
                            1
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <SectionTitle title="Resource & Support" />

              <div className="grid grid-cols-1 gap-[var(--panel-gap)] lg:grid-cols-[1.5fr_1fr_1fr]">
                <SupportCard
                  title="Watch our demo video"
                  description="Watch this intro video to learn how SP novate works."
                  bg="bg-[#EEF6FF]"
                  border="border-[#CFE4FF]"
                  large
                />

                <SupportCard
                  title="Learn about our tutors"
                  description="Watch this intro video to learn more about our tutors"
                  bg="bg-[#FFFBF2]"
                  border="border-[#F7E7B8]"
                />

                <SupportCard
                  title="What is a finder's fee"
                  description="Watch this intro video to learn about our finder's fee"
                  bg="bg-[#F5F7FB]"
                  border="border-[#E5E7EB]"
                />
              </div>
            </section>
          </div>
        </div>
      </main>
      </div>
      </div>
    </div>
  );
}

function MobileDashboardView() {
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
    <main className="min-h-dvh bg-[#f7f8fb] px-4 pb-6 pt-4 sm:px-5 md:px-6 md:pb-8">
      <div className="mb-5 flex items-center gap-3 md:mb-6">
        <Image alt="SP Novate" className="h-7 w-auto shrink-0" height={28} src="/logo/logo.png" width={28} />
        <div className="flex h-9 flex-1 items-center rounded-full border border-[#cdd5e5] bg-white px-3">
          <span className="truncate text-sm text-[#7a8195]">Search for any item here</span>
          <Search className="ml-auto h-4 w-4 text-[#6c7387]" />
        </div>
        <button className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#2e3448]" onClick={() => setIsMenuOpen((prev) => !prev)} type="button">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isMenuMounted ? (
        <div className="fixed inset-0 z-[70]">
          <button
            aria-label="Close menu backdrop"
            className={`absolute inset-0 transition-opacity duration-200 ${isMenuOpen ? "bg-[#0f1530]/35 opacity-100" : "bg-[#0f1530]/0 opacity-0"}`}
            onClick={() => setIsMenuOpen(false)}
            type="button"
          />
          <div className={`absolute right-0 top-0 h-full w-[min(82vw,21rem)] border-l border-[#e6eaf3] bg-white p-4 shadow-2xl transition-transform duration-200 ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[0.9rem] font-semibold text-[#4a5166]">Navigate</p>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#2e3448]" onClick={() => setIsMenuOpen(false)} type="button">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="grid grid-cols-1 gap-2">
              {[
                { label: "Home", href: "/dashboard", active: true },
                { label: "Bookings", href: "/bookings", active: false },
                { label: "Transactions", href: "/transactions", active: false },
                { label: "Chat", href: "/chat", active: false },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-lg border px-3 py-2 text-[0.82rem] font-semibold ${
                    item.active
                      ? "border-[#d8daf8] bg-[#eef0ff] text-[#4A46D6]"
                      : "border-[#e6eaf3] bg-white text-[#5F6678]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}

      <section className="mb-8 md:mb-9">
        <SectionTitle title="Actions" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <ActionCard title="Set up subjects" subtitle="Go to your chat with the tutors" iconBg="bg-[#e9dbff]" iconColor="text-[#7a38df]" border="border-[#eadbfd]" bg="bg-[#f6efff]" icon={<MessageCircle className="h-5 w-5" />} />
          </div>
          <ActionCard title="Create a new resource" subtitle="See request from prospective students" iconBg="bg-[#d7ecff]" iconColor="text-[#2584d6]" border="border-[#bfe2ff]" bg="bg-[#f3f9ff]" icon={<CreditCard className="h-5 w-5" />} />
          <ActionCard title="Update profile" subtitle="Go to your active students" iconBg="bg-[#d6f3f4]" iconColor="text-[#1f9ba5]" border="border-[#b9e8ea]" bg="bg-[#f2fcfd]" icon={<Home className="h-5 w-5" />} />
        </div>
      </section>

      <section className="mb-8 md:mb-9">
        <SectionTitle title="Overview" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { label: "Total tutor request", value: 8 },
            { label: "Total subjects", value: 4 },
            { label: "Resources created", value: 2 },
            { label: "Completion rate", value: "2%" },
            { label: "Active Students", value: 8 },
            { label: "Taught students", value: 4 },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#dfe3ec] bg-white px-5 py-6">
              <p className="text-[0.72rem] text-[#8a91a4]">{item.label}</p>
              <p className="mt-2 text-[2rem] font-semibold leading-none text-[#171d2c]">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 md:mb-9">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[1.1rem] font-semibold text-[#565d70]">Bookings Requests</h3>
          <button className="text-[1.05rem] font-semibold text-[#4c46d9]" type="button">Go to managed bookings</button>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#dfe3ec] bg-white">
          {bookings.map((booking, idx) => (
            <div key={idx} className="flex items-center gap-3 border-b border-[#edf0f6] px-4 py-4 last:border-b-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[1rem] font-semibold text-[#2f3547]">{booking.tutor}</p>
                <p className="text-[0.95rem] text-[#5f667b]">Information Technology</p>
              </div>
              <div className="inline-flex min-w-[7.5rem] items-center gap-2 text-[0.95rem] text-[#4c5368]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: booking.color }} />
                {booking.status}
              </div>
              <MoreVertical className="h-4 w-4 text-[#5f667b]" />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 md:mb-9">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[1.1rem] font-semibold text-[#565d70]">Messages</h3>
          <button className="text-[1.05rem] font-semibold text-[#4c46d9]" type="button">Go to chat</button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#dfe3ec] bg-white">
          <div className="border-b border-[#edf0f6] px-4 py-3 text-[1rem] text-[#a1a8b9]">Chat</div>
          {messages.map((message, idx) => (
            <div key={idx} className="flex items-center gap-3 border-b border-[#edf0f6] px-4 py-3 last:border-b-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold text-white" style={{ backgroundColor: idx === 0 ? "#c4862f" : "#165e57" }}>
                {message.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.96rem] font-semibold text-[#2f3547]">{message.name}</p>
                <p className="truncate text-[0.86rem] text-[#767e93]">{message.message}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.84rem] text-[#58607a]">{message.time}</p>
                <span className="ml-auto inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#4545c6] text-[0.65rem] text-white">1</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="Resource & Support" />
        <div className="space-y-5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          <SupportCard title="Watch our demo video" description="Watch this intro video to learn how SP novate works." bg="bg-[#e9f4ff]" border="border-[#cfe5ff]" />
          <SupportCard title="Learn about our tutors" description="Watch this intro video to learn more about our tutors" bg="bg-[#f7f3e9]" border="border-[#ebe0c8]" />
          <div className="md:col-span-2">
            <SupportCard title="What is a finder's fee" description="Watch this intro video to learn about our finder's fee" bg="bg-[#eef2f8]" border="border-[#dfe5ef]" />
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="mb-[clamp(0.5rem,0.8vw,0.95rem)] text-[clamp(0.95rem,0.82vw,1.1rem)] font-medium leading-[150%] text-[#9CA3AF]">{title}</p>
  );
}

function CardHeader({
  title,
  action,
}: {
  title: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.5rem,0.8vw,0.95rem)]">
      <h3 className="text-[clamp(0.98rem,0.85vw,1.15rem)] font-normal leading-[150%] text-[#4B5563]">{title}</h3>

      <button className="flex items-center gap-[clamp(0.25rem,0.45vw,0.55rem)] text-[clamp(0.9rem,0.75vw,1rem)] font-medium leading-[150%] text-[#4F46E5] hover:opacity-80">
        {action}
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  iconBg,
  iconColor,
  border,
  bg,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  border: string;
  bg: string;
}) {
  return (
    <div
      className={`${bg} ${border} flex items-center gap-[clamp(0.65rem,1vw,1.2rem)] rounded-[clamp(0.58rem,0.66vw,0.95rem)] border px-[clamp(0.9rem,1vw,1.5rem)] py-[clamp(0.9rem,1vw,1.5rem)] transition hover:shadow-sm`}
    >
      <div
        className={`${iconBg} ${iconColor} flex h-[clamp(2.3rem,2.6vw,3.1rem)] w-[clamp(2.3rem,2.6vw,3.1rem)] items-center justify-center rounded-full`}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-[clamp(0.98rem,0.85vw,1.15rem)] font-semibold leading-[150%] text-[#374151]">{title}</h3>

        <p className="mt-0.5 text-[clamp(0.9rem,0.75vw,1rem)] leading-[150%] text-[#9CA3AF]">{subtitle}</p>
      </div>
    </div>
  );
}

function SupportCard({
  title,
  description,
  bg,
  border,
  large,
}: {
  title: string;
  description: string;
  bg: string;
  border: string;
  large?: boolean;
}) {
  return (
    <div
      className={`${bg} ${border} relative overflow-hidden rounded-[clamp(0.72rem,0.78vw,1.12rem)] border p-[clamp(0.95rem,1.1vw,1.6rem)]`}
    >
      <h3 className="max-w-[clamp(13rem,14vw,20rem)] text-[clamp(0.98rem,0.9vw,1.2rem)] font-semibold leading-snug text-[#374151]">
        {title}
      </h3>

      <p className="mt-1.5 max-w-[clamp(13.5rem,15vw,21rem)] text-[clamp(0.9rem,0.75vw,1rem)] leading-[150%] text-[#6B7280]">
        {description}
      </p>

      <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white px-[clamp(0.85rem,1.1vw,1.4rem)] py-[clamp(0.35rem,0.55vw,0.6rem)] text-[clamp(0.9rem,0.75vw,1rem)] font-medium text-[#4B5563] transition hover:bg-[#FAFAFA]">
        <PlayCircle className="h-[clamp(0.85rem,1.1vw,1.15rem)] w-[clamp(0.85rem,1.1vw,1.15rem)]" />
        Watch video
      </button>

      {large && (
        <div className="absolute bottom-[clamp(0.6rem,1vw,1rem)] right-[clamp(0.8rem,1.2vw,1.4rem)]">
          <div className="relative flex h-[clamp(4.8rem,4.8vw,7rem)] w-[clamp(7rem,7vw,10rem)] items-center justify-center rounded-xl border border-[#D1D5DB] bg-white shadow-sm">
            <div className="flex h-[clamp(2.5rem,3vw,3.5rem)] w-[clamp(2.5rem,3vw,3.5rem)] items-center justify-center rounded-xl bg-[#FF5A5F] text-white shadow">
              <PlayCircle className="h-[clamp(1.25rem,1.6vw,1.75rem)] w-[clamp(1.25rem,1.6vw,1.75rem)] fill-white" />
            </div>

            <div className="absolute -left-5 top-0 h-10 w-10 rounded-full border-4 border-[#EAB308]" />
            <div className="absolute -right-2 top-2 h-3 w-3 rounded-full bg-[#FACC15]" />
            <div className="absolute -bottom-1 right-5 h-5 w-5 rounded-full border-4 border-[#EAB308]" />
          </div>
        </div>
      )}
    </div>
  );
}




