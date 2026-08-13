"use client";

import { BookOpenCheck, Boxes, EllipsisVertical, PencilLine } from "lucide-react";
import { DashboardShell } from "../layout/DashboardShell";
import { DashboardActionCard, DashboardResourceCard, DashboardSectionHeader } from "../dashboard/DashboardPatterns";
import { StatusIndicator } from "../ui/StatusIndicator";
import { TutorNavbar } from "./TutorNavbar";

type BookingRequestRow = {
  tutor: string;
  subject: string;
  status: "Completed" | "Ongoing" | "Awaiting approval";
};

type MessageRow = {
  initials: string;
  name: string;
  preview: string;
  time: string;
};

const bookingRequests: BookingRequestRow[] = [
  { tutor: "Mr. Akin-akintaylor", subject: "Entrance Exams", status: "Completed" },
  { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Completed" },
  { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Completed" },
  { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Ongoing" },
  { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Awaiting approval" },
];

const messages: MessageRow[] = [
  { initials: "E", name: "Ekene Ezegbunam", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { initials: "A", name: "Akin-akintaylor Akinbowale", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { initials: "Q", name: "Quadri Ahmed", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
];

const bookingTone = { Completed: "success", Ongoing: "accent", "Awaiting approval": "info" } as const;

export default function TutorDashboardPage() {
  return (
    <DashboardShell homeFit navbar={<TutorNavbar active="Home" />}>
      <div className="dashboard-stack gap-3 py-3 2xl:gap-4">
              <section>
                <DashboardSectionHeader title="Actions" />
                <div className="grid gap-3 md:grid-cols-3">
                  <DashboardActionCard description="Go to your subjects and active tutor profile." icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e7d8fb] text-[#9a5cdf]"><BookOpenCheck className="h-[1.1rem] w-[1.1rem]" /></span>} title="Set up subjects" toneClassName="border-[#dcc7f7] bg-[#f7f0ff]" />
                  <DashboardActionCard description="See requests from prospective students." icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#d7ecff] text-[#2586d8]"><Boxes className="h-[1.1rem] w-[1.1rem]" /></span>} title="Create a new resource" toneClassName="border-[#bcdaf2] bg-[#f0f8ff]" />
                  <DashboardActionCard description="Keep your tutor profile fresh and complete." icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#d7f1f2] text-[#19929a]"><PencilLine className="h-[1.1rem] w-[1.1rem]" /></span>} title="Update profile" toneClassName="border-[#bde9ea] bg-[#f1fcfd]" />
                </div>
              </section>

              <section>
                <h2 className="mb-2 text-[0.875rem] font-semibold text-[#616a82]">Overview</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { label: "Total tutor request", value: 8 },
                    { label: "Total subjects", value: 4 },
                    { label: "Resources created", value: 2 },
                    { label: "Completion rate", value: "2%" },
                    { label: "Active Students", value: 8 },
                    { label: "Taught students", value: 4 },
                  ].map((item) => (
                    <article key={item.label} className="flex min-h-[3.5rem] flex-col justify-center rounded-[0.65rem] border border-[#e4e8f1] bg-white px-3.5 py-2.5">
                      <p className="text-[0.74rem] text-[#747d94]">{item.label}</p>
                      <p className="mt-1 text-[1.75rem] font-bold leading-none text-[#1f2537]">{item.value}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section>
                <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-[1.3fr_1fr]">
                  <section className="flex min-h-0 flex-col">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-[0.9rem] font-semibold text-[#616a82]">Bookings Requests</h2>
                      <button className="text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9]" type="button">Go to managed bookings &gt;</button>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
                      <div className="min-h-0 flex-1 overflow-auto">
                        <table className="w-full min-w-[32rem] text-left">
                          <thead className="bg-[#f7f9fc] text-[0.74rem] text-[#6f7892]">
                            <tr>
                              <th className="px-4 py-2.5 font-semibold">Tutor</th>
                              <th className="px-4 py-2.5 font-semibold">Subject</th>
                              <th className="px-4 py-2.5 font-semibold">Status</th>
                              <th className="px-4 py-2.5 font-semibold" />
                            </tr>
                          </thead>
                          <tbody>
                            {bookingRequests.map((row, idx) => (
                              <tr key={`${row.tutor}-${idx}`} className="border-t border-[#edf0f6] text-[0.78rem] text-[#4f576f]">
                                <td className="px-4 py-3">{row.tutor}</td>
                                <td className="px-4 py-3">{row.subject}</td>
                                <td className="px-4 py-3">
                                  <span className="inline-flex items-center gap-2">
                                    <StatusIndicator label={row.status} tone={bookingTone[row.status]} />
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <EllipsisVertical className="ml-auto h-3.5 w-3.5 text-[#6f768c]" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>

                  <section className="flex min-h-0 flex-col">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-[0.9rem] font-semibold text-[#616a82]">Messages</h2>
                      <button className="text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9]" type="button">Go to chat &gt;</button>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
                      <p className="border-b border-[#edf0f6] px-4 py-2 text-[1rem] font-medium text-[#9aa3b8]">Chat</p>
                      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hover">
                        {messages.map((message, idx) => (
                          <article key={`${message.name}-${idx}`} className="flex items-center gap-2 border-t border-[#edf0f6] px-4 py-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#276a63] text-[0.75rem] font-semibold text-white">
                              {message.initials}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[0.8rem] font-semibold text-[#2d3448]">{message.name}</p>
                              <p className="truncate text-[0.68rem] leading-[1.2] text-[#7c849a]">{message.preview}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[0.66rem] text-[#7c849a]">{message.time}</p>
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4a49c6] text-[0.62rem] text-white">1</span>
                            </div>
                          </article>
                        ))}
                      </div>
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
