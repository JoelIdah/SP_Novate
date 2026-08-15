"use client";

import { BookOpenCheck, Boxes, PencilLine } from "lucide-react";
import Link from "next/link";

import { DashboardActionCard, DashboardResourceCard, DashboardSectionHeader } from "../dashboard/DashboardPatterns";
import { DashboardShell } from "../layout/DashboardShell";
import { TutorNavbar } from "./TutorNavbar";

function EmptyState({ children }: { children: string }) {
  return <div className="flex min-h-48 items-center justify-center px-5 py-8 text-center text-sm font-medium text-[#8a93a7]">{children}</div>;
}

export default function TutorDashboardPage() {
  return (
    <DashboardShell homeFit navbar={<TutorNavbar active="Home" />}>
      <div className="dashboard-stack gap-3 py-3 2xl:gap-4">
        <section>
          <DashboardSectionHeader title="Actions" />
          <div className="grid gap-3 md:grid-cols-3">
            <DashboardActionCard description="Go to your subjects and active tutor profile." icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e7d8fb] text-[#9a5cdf]"><BookOpenCheck className="h-[1.1rem] w-[1.1rem]" /></span>} title="Set up subjects" toneClassName="border-[#dcc7f7] bg-[#f7f0ff]" />
            <DashboardActionCard description="Create and manage your learning resources." href="/tutor/resources" icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#d7ecff] text-[#2586d8]"><Boxes className="h-[1.1rem] w-[1.1rem]" /></span>} title="Create a new resource" toneClassName="border-[#bcdaf2] bg-[#f0f8ff]" />
            <DashboardActionCard description="Keep your tutor profile fresh and complete." icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#d7f1f2] text-[#19929a]"><PencilLine className="h-[1.1rem] w-[1.1rem]" /></span>} title="Update profile" toneClassName="border-[#bde9ea] bg-[#f1fcfd]" />
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-[0.875rem] font-semibold text-[#616a82]">Overview</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {["Total tutor requests", "Total subjects", "Resources created", "Completion rate", "Active students", "Taught students"].map((label) => (
              <article key={label} className="flex min-h-[3.5rem] flex-col justify-center rounded-[0.65rem] border border-[#e4e8f1] bg-white px-3.5 py-2.5">
                <p className="text-[0.74rem] text-[#747d94]">{label}</p>
                <p aria-label="Not available" className="mt-1 text-[1.75rem] font-bold leading-none text-[#a3aabc]">—</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-[1.3fr_1fr]">
            <section className="flex min-h-0 flex-col">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[0.9rem] font-semibold text-[#616a82]">Booking Requests</h2>
                <Link className="rounded-md px-1 py-0.5 text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9]" href="/tutor/bookings">Go to managed bookings &gt;</Link>
              </div>
              <div className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
                <EmptyState>Your booking requests will appear here when booking data is available.</EmptyState>
              </div>
            </section>

            <section className="flex min-h-0 flex-col">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[0.9rem] font-semibold text-[#616a82]">Messages</h2>
                <Link className="rounded-md px-1 py-0.5 text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9]" href="/tutor/chat">Go to chat &gt;</Link>
              </div>
              <div className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
                <EmptyState>Your recent conversations will appear here when messaging data is available.</EmptyState>
              </div>
            </section>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-[0.875rem] font-semibold text-[#616a82]">Resource &amp; Support</h2>
          <div className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr]">
            <DashboardResourceCard description="Watch this intro video to learn how SP Novate works." title="Watch our demo video" toneClassName="border-[#c5dbed] bg-[#e5f2ff]" />
            <DashboardResourceCard description="Watch this intro video to learn more about our tutors." title="Learn about our tutors" toneClassName="border-[#e6decf] bg-[#f7f2e8]" />
            <DashboardResourceCard description="Watch this intro video to learn about our finder's fee." title="What is a finder's fee" toneClassName="border-[#dfe4ed] bg-[#eef2f7]" />
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
