import { BookOpenCheck, MessageCircleMore, ReceiptText } from "lucide-react";
import Link from "next/link";

import { DashboardActionCard, DashboardResourceCard, DashboardSectionHeader } from "./DashboardPatterns";
import type { StudentDashboardStats } from "./studentDashboardApi";
import type { BookingListItem, BookingStatus } from "../bookings/bookingApi";

function DashboardEmptyState({ children }: { children: string }) {
  return <div className="flex min-h-48 items-center justify-center px-5 py-8 text-center text-sm font-medium text-[#8a93a7]">{children}</div>;
}

export function StudentDashboardActionsSection() {
  return (
    <div>
      <DashboardSectionHeader title="Actions" />
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardActionCard description="Find a tutor and schedule your session." href="/students/bookings" icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#d8ebfa] text-[#2f8fd6]"><BookOpenCheck className="h-[1.125rem] w-[1.125rem]" /></span>} title="Book a session" toneClassName="border-[#b9dcf8] bg-[#f3f9ff]" />
        <DashboardActionCard description="Go to your conversations with tutors." href="/students/chat" icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#daf3f1] text-[#43b8b2]"><MessageCircleMore className="h-[1.125rem] w-[1.125rem]" /></span>} title="Start a conversation" toneClassName="border-[#b4e5e4] bg-[#f4fcfc]" />
        <DashboardActionCard description="Review your account activity." href="/students/transactions" icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f6ead0] text-[#d8aa2c]"><ReceiptText className="h-[1.125rem] w-[1.125rem]" /></span>} title="Check transactions" toneClassName="border-[#ecd8b2] bg-[#fcf8ef]" />
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
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-[0.875rem] font-semibold text-[#616a82]">Learning Overview</h2>
        {error ? <p className="text-xs text-brand-danger">{error}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article key={label} className="flex min-h-16 flex-col justify-center rounded-[0.65rem] border border-[#e4e8f1] bg-white px-3.5 py-2.5">
            <p className="text-[0.75rem] text-[#747d94]">{label}</p>
            <p aria-label={value === undefined ? "Loading" : undefined} className="mt-1 text-[1.75rem] font-bold leading-none text-[#4b5268]">{value ?? "—"}</p>
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
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <h2 className="text-[0.9rem] font-semibold text-[#616a82]">Managed Bookings</h2>
        <Link className="max-w-[48vw] truncate text-right text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9] sm:max-w-none" href="/students/bookings?view=manage">Go to managed bookings &gt;</Link>
      </div>
      <div className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
        {loading ? <DashboardEmptyState>Loading your bookings…</DashboardEmptyState> : null}
        {!loading && error ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-5 py-8 text-center" role="alert">
            <p className="text-sm font-medium text-[#a44343]">{error}</p>
            <button className="min-h-10 rounded-full bg-[#232066] px-5 text-xs font-semibold text-white" onClick={onRetry} type="button">Try again</button>
          </div>
        ) : null}
        {!loading && !error && bookings.length === 0 ? <DashboardEmptyState>You do not have any bookings yet.</DashboardEmptyState> : null}
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
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[0.9rem] font-semibold text-[#616a82]">Messages</h2>
        <Link className="max-w-[48vw] truncate text-right text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9] sm:max-w-none" href="/students/chat">Go to chat &gt;</Link>
      </div>
      <div className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
        <DashboardEmptyState>Your recent conversations will appear here when messaging data is available.</DashboardEmptyState>
      </div>
    </section>
  );
}

export function StudentDashboardResourcesSection() {
  return (
    <div>
      <h2 className="mb-2 text-[0.875rem] font-semibold text-[#616a82]">Resource &amp; Support</h2>
      <div className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr]">
        <DashboardResourceCard description="Watch this intro video to learn how SP Novate works." markerClassName="bg-[#f3c53d]" title="Watch our demo video" toneClassName="border-[#c5dbed] bg-[#e5f2ff]" />
        <DashboardResourceCard description="Watch this intro video to learn more about our tutors." markerClassName="bg-[#caa33a]" title="Learn about our tutors" toneClassName="border-[#e6decf] bg-[#f7f2e8]" />
        <DashboardResourceCard description="Watch this intro video to learn about our finder's fee." markerClassName="bg-[#9aa3b6]" title="What is a finder's fee" toneClassName="border-[#dfe4ed] bg-[#eef2f7]" />
      </div>
    </div>
  );
}
