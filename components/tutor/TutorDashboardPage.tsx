"use client";

import { BookOpenCheck, Boxes, EllipsisVertical, PencilLine } from "lucide-react";
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

function StatusDot({ status }: { status: BookingRequestRow["status"] }) {
  const color = status === "Completed" ? "bg-[#1ab26e]" : status === "Ongoing" ? "bg-[#9b57f6]" : "bg-[#2295ea]";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export default function TutorDashboardPage() {
  return (
    <div className="dashboard-screen dashboard-home-fit bg-white text-[#1E1E1E]">
      <div className="dashboard-shell">
        <TutorNavbar active="Home" />

        <main className="dashboard-main overflow-y-auto overflow-x-hidden scrollbar-hover">
          <div className="dashboard-content-frame px-[var(--dashboard-gutter)]">
            <div className="dashboard-stack gap-3 py-3 2xl:gap-4">
              <section>
                <h2 className="mb-2 text-[0.875rem] font-semibold text-[#616a82]">Actions</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  <article className="flex min-h-[4.75rem] items-center rounded-xl border border-[#dcc7f7] bg-[#f7f0ff] px-3.5 py-2.5">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e7d8fb] text-[#9a5cdf]">
                      <BookOpenCheck className="h-[1.1rem] w-[1.1rem]" />
                    </span>
                    <div className="ml-2">
                      <p className="text-[1rem] font-semibold text-[#2b3350]">Set up subjects</p>
                      <p className="mt-1 text-[0.75rem] leading-[1.25] text-[#6d758e]">Go to your subjects and active tutor profile.</p>
                    </div>
                  </article>
                  <article className="flex min-h-[4.75rem] items-center rounded-xl border border-[#bcdaf2] bg-[#f0f8ff] px-3.5 py-2.5">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#d7ecff] text-[#2586d8]">
                      <Boxes className="h-[1.1rem] w-[1.1rem]" />
                    </span>
                    <div className="ml-2">
                      <p className="text-[1rem] font-semibold text-[#2b3350]">Create a new resource</p>
                      <p className="mt-1 text-[0.75rem] leading-[1.25] text-[#6d758e]">See request from prospective students.</p>
                    </div>
                  </article>
                  <article className="flex min-h-[4.75rem] items-center rounded-xl border border-[#bde9ea] bg-[#f1fcfd] px-3.5 py-2.5">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#d7f1f2] text-[#19929a]">
                      <PencilLine className="h-[1.1rem] w-[1.1rem]" />
                    </span>
                    <div className="ml-2">
                      <p className="text-[1rem] font-semibold text-[#2b3350]">Update profile</p>
                      <p className="mt-1 text-[0.75rem] leading-[1.25] text-[#6d758e]">Keep your tutor profile fresh and complete.</p>
                    </div>
                  </article>
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
                                    <StatusDot status={row.status} />
                                    {row.status}
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
                  <article className="min-h-[7rem] rounded-xl border border-[#c5dbed] bg-[#e5f2ff] p-3.5">
                    <p className="text-[1rem] font-semibold text-[#2d3448]">Watch our demo video</p>
                    <p className="mt-1 max-w-[18rem] text-[0.8rem] text-[#5c6884]">Watch this intro video to learn how SP novate works.</p>
                    <button className="mt-2.5 rounded-full border border-[#54607b] bg-white px-4 py-1 text-[0.78rem] font-semibold text-[#2d3448]" type="button">
                      Watch video
                    </button>
                  </article>
                  <article className="min-h-[7rem] rounded-xl border border-[#e6decf] bg-[#f7f2e8] p-3.5">
                    <p className="text-[1rem] font-semibold text-[#2d3448]">Learn about our tutors</p>
                    <p className="mt-1 text-[0.8rem] text-[#5c6884]">Watch this intro video to learn more about our tutors</p>
                    <button className="mt-2.5 rounded-full border border-[#54607b] bg-white px-4 py-1 text-[0.78rem] font-semibold text-[#2d3448]" type="button">
                      Watch video
                    </button>
                  </article>
                  <article className="min-h-[7rem] rounded-xl border border-[#dfe4ed] bg-[#eef2f7] p-3.5">
                    <p className="text-[1rem] font-semibold text-[#2d3448]">What is a finder&apos;s fee</p>
                    <p className="mt-1 text-[0.8rem] text-[#5c6884]">Watch this intro video to learn about our finder&apos;s fee</p>
                    <button className="mt-2.5 rounded-full border border-[#54607b] bg-white px-4 py-1 text-[0.78rem] font-semibold text-[#2d3448]" type="button">
                      Watch video
                    </button>
                  </article>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
