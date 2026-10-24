"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpenCheck, Boxes, CalendarClock, MessageCircleMore, PencilLine } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { DashboardActionCard, DashboardResourceCard, DashboardSectionHeader } from "../dashboard/DashboardPatterns";
import { DashboardShell } from "../layout/DashboardShell";
import { TutorNavbar } from "./TutorNavbar";
import { getTutorDashboard, type TutorDashboardStats } from "./tutorDashboard";
import { getTutorBookings, type TutorBooking, type TutorBookingStatus } from "./tutorBookings";

function EmptyState({ actionHref, actionLabel, children, icon }: { actionHref?: string; actionLabel?: string; children: string; icon?: ReactNode }) {
  return <div className="flex min-h-40 flex-col items-center justify-center px-5 py-6 text-center">{icon ? <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f1ff] text-[#5d59cf]">{icon}</span> : null}<p className={`${icon ? "mt-3" : ""} text-sm font-medium text-[#7b859c]`}>{children}</p>{actionHref && actionLabel ? <Link className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d6daeb] bg-white px-4 text-xs font-semibold text-[#5552bd] hover:border-[#b8b8e4] hover:bg-[#f7f7ff]" href={actionHref}>{actionLabel}<ArrowRight className="h-3.5 w-3.5" /></Link> : null}</div>;
}

function bookingStatusLabel(status: TutorBookingStatus) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function bookingStatusClasses(status: TutorBookingStatus) {
  if (status === "completed") return "bg-[#eaf8ef] text-[#20784d]";
  if (status === "ongoing") return "bg-[#f1eafe] text-[#7542b8]";
  if (status === "rejected") return "bg-[#fff0ee] text-[#a44343]";
  return "bg-[#fff7dc] text-[#8a6913]";
}

export default function TutorDashboardPage() {
  const [stats, setStats] = useState<TutorDashboardStats | null>(null);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<TutorBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getTutorDashboard(controller.signal)
      .then(setStats)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setError(reason instanceof Error ? reason.message : "Dashboard statistics could not be loaded.");
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getTutorBookings({ page: 1, pageSize: 3 }, controller.signal)
      .then((result) => setBookings(result.data))
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) {
          setBookingsError(reason instanceof Error ? reason.message : "Booking requests could not be loaded.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setBookingsLoading(false); });
    return () => controller.abort();
  }, []);

  const overview = [
    ["Total booking requests", stats?.total_booking_requests],
    ["Total subjects", stats?.total_subjects],
    ["Resources created", stats?.total_resources],
    ["Completion rate", stats ? `${stats.completion_rate.toLocaleString()}%` : undefined],
    ["Active students", stats?.active_students],
    ["Taught students", stats?.taught_students],
  ];

  return (
    <DashboardShell homeFit navbar={<TutorNavbar active="Home" />}>
      <div className="dashboard-stack !gap-6 py-3 2xl:!gap-7">
        <section>
          <DashboardSectionHeader title="Quick actions" />
          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardActionCard description="Go to your subjects and active tutor profile." href="/tutor/settings?tab=subjects" icon={<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dfc7fa] text-[#7540b4]"><BookOpenCheck className="h-5 w-5" /></span>} title="Set up subjects" toneClassName="border-[#c9a8ee] bg-[#f2e7ff]" />
            <DashboardActionCard description="Create and manage your learning resources." href="/tutor/resources" icon={<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c8e4fb] text-[#176fae]"><Boxes className="h-5 w-5" /></span>} title="Create a new resource" toneClassName="border-[#9fccef] bg-[#e8f5ff]" />
            <DashboardActionCard description="Keep your tutor profile fresh and complete." href="/tutor/settings" icon={<span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c6e9ea] text-[#147b82]"><PencilLine className="h-5 w-5" /></span>} title="Update profile" toneClassName="border-[#95d4d7] bg-[#e8f8f9]" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[#3f4860]">Overview</h2>
          {error ? <p className="mb-3 rounded-lg border border-[#f0d2ce] bg-[#fff7f5] px-3 py-2 text-sm text-brand-danger" role="alert">{error}</p> : null}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {overview.map(([label, value]) => (
              <article key={label} className="flex min-h-24 flex-col justify-center rounded-xl border border-[#e0e5ef] bg-white px-5 py-4 shadow-[0_5px_16px_rgba(31,40,74,0.04)]">
                <p className="text-sm text-[#68738d]">{label}</p>
                <p className="mt-2 text-[1.9rem] font-bold leading-none text-[#303755]">{value ?? "—"}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="grid h-full min-h-0 grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
            <section className="flex min-h-0 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#3f4860]">Booking Requests</h2>
                <Link className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-xs font-semibold text-[#5d5ab8] hover:text-[#4540b8]" href="/tutor/bookings">Go to managed bookings<ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="flex min-h-40 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
                {bookingsLoading ? <EmptyState>Loading booking requests...</EmptyState> : null}
                {!bookingsLoading && bookingsError ? <EmptyState>{bookingsError}</EmptyState> : null}
                {!bookingsLoading && !bookingsError && bookings.length === 0 ? <EmptyState actionHref="/tutor/settings?tab=subjects" actionLabel="Review subjects" icon={<CalendarClock className="h-5 w-5" />}>You do not have any booking requests yet.</EmptyState> : null}
                {!bookingsLoading && !bookingsError && bookings.length > 0 ? <div className="divide-y divide-[#edf0f6]">{bookings.map((booking) => <Link className="grid gap-2 px-4 py-3 transition hover:bg-[#fafbff] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" href={`/tutor/bookings/manage/${encodeURIComponent(booking.public_id)}`} key={booking.public_id}><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#3d455b]">{booking.subject}</p><p className="mt-0.5 truncate text-xs text-[#7a8297]">{booking.student_name} · {booking.department}</p><p className="mt-1 text-xs text-[#8a92a6]">{booking.date} · {booking.time} · {booking.duration}</p></div><span className={`w-fit rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${bookingStatusClasses(booking.status)}`}>{bookingStatusLabel(booking.status)}</span></Link>)}</div> : null}
              </div>
            </section>

            <section className="flex min-h-0 flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#3f4860]">Messages</h2>
              </div>
              <div className="flex min-h-40 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
                <EmptyState actionHref="/tutor/chat" actionLabel="Open chat" icon={<MessageCircleMore className="h-5 w-5" />}>Your recent conversations will appear here.</EmptyState>
              </div>
            </section>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-[#3f4860]">Resource &amp; Support</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardResourceCard description="Watch this intro video to learn how SP Novate works." title="Watch our demo video" toneClassName="border-[#c5dbed] bg-[#e5f2ff]" />
            <DashboardResourceCard description="Watch this intro video to learn more about our tutors." title="Learn about our tutors" toneClassName="border-[#e6decf] bg-[#f7f2e8]" />
            <DashboardResourceCard description="Watch this intro video to learn about our finder's fee." title="What is a finder's fee" toneClassName="border-[#dfe4ed] bg-[#eef2f7]" />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
