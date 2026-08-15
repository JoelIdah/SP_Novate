import { BookOpenCheck, MessageCircleMore, ReceiptText } from "lucide-react";
import Link from "next/link";

import { DashboardActionCard, DashboardResourceCard, DashboardSectionHeader } from "./DashboardPatterns";

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

export function StudentDashboardLearningOverviewSection() {
  return (
    <div>
      <h2 className="mb-2 text-[0.875rem] font-semibold text-[#616a82]">Learning Overview</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {["Sessions booked", "Sessions completed", "Sessions ongoing", "Sessions pending"].map((label) => (
          <article key={label} className="flex min-h-16 flex-col justify-center rounded-[0.65rem] border border-[#e4e8f1] bg-white px-3.5 py-2.5">
            <p className="text-[0.75rem] text-[#747d94]">{label}</p>
            <p aria-label="Not available" className="mt-1 text-[1.75rem] font-bold leading-none text-[#a3aabc]">—</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function StudentDashboardBookingsSection() {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <h2 className="text-[0.9rem] font-semibold text-[#616a82]">Managed Bookings</h2>
        <Link className="max-w-[48vw] truncate text-right text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9] sm:max-w-none" href="/students/bookings?view=manage">Go to managed bookings &gt;</Link>
      </div>
      <div className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
        <DashboardEmptyState>Your managed bookings will appear here when booking data is available.</DashboardEmptyState>
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
