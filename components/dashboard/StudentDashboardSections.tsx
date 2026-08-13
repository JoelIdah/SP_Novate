import { BookOpenCheck, MessageCircleMore, ReceiptText } from "lucide-react";
import { DashboardActionCard, DashboardResourceCard, DashboardSectionHeader } from "./DashboardPatterns";
import { StatusIndicator } from "../ui/StatusIndicator";

type BookingRow = {
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

const bookingRows: BookingRow[] = [
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

export function StudentDashboardActionsSection() {
  return (
    <div>
      <DashboardSectionHeader title="Actions" />
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardActionCard description="Find a tutor and schedule your session." icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#d8ebfa] text-[#2f8fd6]"><BookOpenCheck className="h-[1.125rem] w-[1.125rem]" /></span>} title="Book a session" toneClassName="border-[#b9dcf8] bg-[#f3f9ff]" />
        <DashboardActionCard description="Go to your chat with the tutors" icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#daf3f1] text-[#43b8b2]"><MessageCircleMore className="h-[1.125rem] w-[1.125rem]" /></span>} title="Start a conversation" toneClassName="border-[#b4e5e4] bg-[#f4fcfc]" />
        <DashboardActionCard description="Add money to your main balance." icon={<span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f6ead0] text-[#d8aa2c]"><ReceiptText className="h-[1.125rem] w-[1.125rem]" /></span>} title="Check transactions" toneClassName="border-[#ecd8b2] bg-[#fcf8ef]" />
      </div>
    </div>
  );
}

export function StudentDashboardLearningOverviewSection() {
  return (
    <div>
      <h2 className="mb-2 text-[0.875rem] font-semibold text-[#616a82]">Learning Overview</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Sessions booked", value: 8 },
          { label: "Sessions completed", value: 2 },
          { label: "Sessions ongoing", value: 4 },
          { label: "Sessions pending", value: 2 },
        ].map((item) => (
          <article key={item.label} className="flex min-h-16 flex-col justify-center rounded-[0.65rem] border border-[#e4e8f1] bg-white px-3.5 py-2.5">
            <p className="text-[0.75rem] text-[#747d94]">{item.label}</p>
            <p className="mt-1 text-[1.75rem] font-bold leading-none text-[#1f2537]">{item.value}</p>
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
        <button className="max-w-[48vw] truncate text-right text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9] sm:max-w-none" type="button">Go to managed bookings &gt;</button>
      </div>
      <div className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
        <div className="md:hidden">
          {bookingRows.map((row, idx) => (
            <article
              key={`${row.tutor}-${idx}`}
              className="flex items-start justify-between gap-3 border-t border-[#edf0f6] px-4 py-3 first:border-t-0"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8rem] font-semibold text-[#2f3547]">{row.tutor}</p>
                <p className="truncate text-[0.74rem] text-[#6b748b]">{row.subject}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[0.74rem] text-[#4f576f]">
                <StatusIndicator label={row.status} tone={bookingTone[row.status]} />
              </span>
            </article>
          ))}
        </div>

        <div className="hidden min-h-0 flex-1 overflow-y-auto scrollbar-hover md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left">
              <thead className="bg-[#f7f9fc] text-[0.74rem] text-[#6f7892]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Tutor</th>
                  <th className="px-4 py-2.5 font-semibold">Subject</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {bookingRows.map((row, idx) => (
                  <tr
                    key={`${row.tutor}-${idx}`}
                    className="border-t border-[#edf0f6] text-[0.78rem] text-[#4f576f]"
                  >
                    <td className="px-4 py-3">
                      <span className="block max-w-[14rem] truncate">{row.tutor}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-[12rem] truncate">{row.subject}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <StatusIndicator label={row.status} tone={bookingTone[row.status]} />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        aria-label={`More actions for ${row.tutor}`}
                        className="text-[1.1em] leading-none text-[#8088a0]"
                        type="button"
                      >
                        &hellip;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudentDashboardMessagesSection() {
  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[0.9rem] font-semibold text-[#616a82]">Messages</h2>
        <button className="max-w-[48vw] truncate text-right text-[0.75rem] font-semibold text-[#6f74a7] hover:text-[#5954c9] sm:max-w-none" type="button">Go to chat &gt;</button>
      </div>
      <div className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-[#e4e8f1] bg-white">
        <p className="border-b border-[#edf0f6] px-4 py-2 text-[1rem] font-medium text-[#9aa3b8]">Chat</p>
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hover">
          {messages.map((message, idx) => (
            <article
              key={`${message.name}-${message.time}-${idx}`}
              className="flex items-center gap-2 border-t border-[#edf0f6] px-4 py-3"
            >
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

