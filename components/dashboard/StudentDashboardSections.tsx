import { ArrowRight, BookOpenCheck, CalendarPlus, MessageCircleMore, ReceiptText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardActionCard, DashboardResourceCard, DashboardSectionHeader } from "./DashboardPatterns";
import type { StudentDashboardStats } from "./studentDashboard";
import type { BookingListItem, BookingStatus } from "../bookings/bookings";

function DashboardEmptyState({ actionHref, actionLabel, children, icon }: { actionHref?: string; actionLabel?: string; children: string; icon?: ReactNode }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center px-5 py-6 text-center">
      {icon ? <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f1ff] text-[#5d59cf]">{icon}</span> : null}
      <p className={`${icon ? "mt-3" : ""} text-sm font-medium text-[#7b859c]`}>{children}</p>
      {actionHref && actionLabel ? <Link className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d6daeb] bg-white px-4 text-xs font-semibold text-[#5552bd] hover:border-[#b8b8e4] hover:bg-[#f7f7ff]" href={actionHref}>{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></Link> : null}
    </div>
  );
}

export function StudentDashboardActionsSection() {
  return (
    <div>
      <DashboardSectionHeader title="Quick actions" />
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardActionCard description="Find a tutor and schedule your session." href="/students/bookings" icon={<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c9e6fb] text-[#1679bd]"><BookOpenCheck className="h-5 w-5" /></span>} title="Book a session" toneClassName="border-[#9dcef2] bg-[#e9f6ff]" />
        <DashboardActionCard description="Go to your conversations with tutors." href="/students/chat" icon={<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c7ece9] text-[#16867f]"><MessageCircleMore className="h-5 w-5" /></span>} title="Start a conversation" toneClassName="border-[#93d8d4] bg-[#e9f9f8]" />
        <DashboardActionCard description="Review your account activity." href="/students/transactions" icon={<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4dfaa] text-[#9a7413]"><ReceiptText className="h-5 w-5" /></span>} title="Check transactions" toneClassName="border-[#dfc478] bg-[#fff7df]" />
      </div>
    </div>
  );
}

export function StudentDashboardLearningOverviewSection({ stats, error }: { stats: StudentDashboardStats | null; error?: string }) {
  const metrics = [
    ["Sessions booked", stats?.total_booked_sessions],
    ["Sessions completed", stats?.sessions_completed],
    ["Sessions ongoing", stats?.ongoing],
    ["Sessions pending", stats?.pending],
  ] as const;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#3f4860]">Learning Overview</h2>
        {error ? <p className="text-xs text-brand-danger">{error}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article key={label} className="flex min-h-24 flex-col justify-center rounded-xl border border-[#e0e5ef] bg-white px-5 py-4 shadow-[0_5px_16px_rgba(31,40,74,0.04)]">
            <p className="text-sm text-[#68738d]">{label}</p>
            <p aria-label={value === undefined ? "Loading" : undefined} className="mt-2 text-[1.9rem] font-bold leading-none text-[#37405b]">{value ?? "—"}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function bookingStatusLabel(status: BookingStatus) {
  return status.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function bookingStatusClasses(status: BookingStatus) {
  if (status === "completed") return "bg-[#eaf8ef] text-[#20784d]";
  if (status === "ongoing") return "bg-[#f1eafe] text-[#7542b8]";
  if (status === "cancelled") return "bg-[#fff0ee] text-[#a44343]";
  return "bg-[#fff7dc] text-[#8a6913]";
}

export function StudentDashboardBookingsSection({
  bookings,
  error,
  loading,
  onRetry,
}: {
  bookings: BookingListItem[];
  error?: string;
  loading: boolean;
  onRetry: () => void;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h2 className="text-base font-semibold text-[#3f4860]">Managed Bookings</h2>
        <Link className="inline-flex max-w-[48vw] items-center gap-1 truncate text-right text-xs font-semibold text-[#5d5ab8] hover:text-[#4540b8] sm:max-w-none" href="/students/bookings?view=manage">Go to managed bookings<ArrowRight className="h-3.5 w-3.5 shrink-0" /></Link>
      </div>
      <div className="flex min-h-40 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
        {loading ? <DashboardEmptyState>Loading your bookings…</DashboardEmptyState> : null}
        {!loading && error ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-5 py-8 text-center" role="alert">
            <p className="text-sm font-medium text-[#a44343]">{error}</p>
            <button className="min-h-10 rounded-full bg-[#232066] px-5 text-xs font-semibold text-white" onClick={onRetry} type="button">Try again</button>
          </div>
        ) : null}
        {!loading && !error && bookings.length === 0 ? <DashboardEmptyState actionHref="/students/bookings" actionLabel="Find a tutor" icon={<CalendarPlus className="h-5 w-5" />}>You do not have any bookings yet.</DashboardEmptyState> : null}
        {!loading && !error && bookings.length > 0 ? (
          <div className="divide-y divide-[#edf0f6]">
            {bookings.map((booking) => (
              <Link
                className="grid gap-2 px-4 py-3 transition hover:bg-[#fafbff] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                href={`/students/bookings/manage/${encodeURIComponent(booking.public_id)}?status=${booking.status}`}
                key={booking.public_id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#3d455b]">{booking.subject}</p>
                  <p className="mt-0.5 truncate text-xs text-[#7a8297]">{booking.tutor_name} · {booking.department}</p>
                  <p className="mt-1 text-xs text-[#8a92a6]">{booking.date} · {booking.time} · {booking.duration}</p>
                </div>
                <span className={`w-fit rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${bookingStatusClasses(booking.status)}`}>
                  {bookingStatusLabel(booking.status)}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function StudentDashboardMessagesSection() {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#3f4860]">Messages</h2>
      </div>
      <div className="flex min-h-40 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
        <DashboardEmptyState actionHref="/students/chat" actionLabel="Open chat" icon={<MessageCircleMore className="h-5 w-5" />}>Your recent conversations will appear here.</DashboardEmptyState>
      </div>
    </section>
  );
}

export function StudentDashboardResourcesSection() {
  return (
    <div>
      <h2 className="mb-3 text-base font-semibold text-[#3f4860]">Resource &amp; Support</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardResourceCard description="Watch this intro video to learn how SP Novate works." markerClassName="bg-[#f3c53d]" title="Watch our demo video" toneClassName="border-[#c5dbed] bg-[#e5f2ff]" />
        <DashboardResourceCard description="Watch this intro video to learn more about our tutors." markerClassName="bg-[#caa33a]" title="Learn about our tutors" toneClassName="border-[#e6decf] bg-[#f7f2e8]" />
        <DashboardResourceCard description="Watch this intro video to learn about our finder's fee." markerClassName="bg-[#9aa3b6]" title="What is a finder's fee" toneClassName="border-[#dfe4ed] bg-[#eef2f7]" />
      </div>
    </div>
  );
}
