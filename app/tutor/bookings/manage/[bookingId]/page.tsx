"use client";

import Link from "next/link";
import { Check, ChevronLeft, CircleHelp, Clock3, EllipsisVertical, Hourglass, MapPin, ShieldCheck, Star, Video } from "lucide-react";

import { Avatar } from "../../../../../components/ui/Avatar";

const timeline = [
  { title: "Pending Request", note: "request is awaiting tutor review", time: "May 6, 2024 - 12:04", icon: Hourglass, active: true },
  { title: "Accept request", note: "awaiting request acceptance by tutor", time: "-", icon: ShieldCheck, active: false },
  { title: "Session starts", note: "Booked session starts here", time: "-", icon: Video, active: false },
  { title: "Session completed", note: "Booked session is completed.", time: "-", icon: Clock3, active: false },
];

export default function TutorBookingDetailsPage() {
  return (
    <main className="min-h-dvh bg-white text-[#2f3547]">
      <header className="border-b border-[#e6e9f2] bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div>
            <Link className="inline-flex items-center gap-2 text-[0.72rem] font-medium text-[#6f7891]" href="/tutor/bookings">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#efeffa]">
                <ChevronLeft className="h-3.5 w-3.5 text-[#6d6bd6]" />
              </span>
              Bookings
            </Link>
            <h1 className="mt-1 text-[0.95rem] font-semibold text-[#1f2550]">Student Profile</h1>
          </div>
          <button className="inline-flex items-center gap-1 rounded-full border border-[#e2e6ef] bg-[#f7f8fb] px-3 py-1.5 text-[0.76rem] font-semibold text-[#4f566c]" type="button">
            <CircleHelp className="h-3.5 w-3.5" />
            Need help
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1260px] space-y-5 px-5 py-8">
        <article className="rounded-xl border border-[#e3e8f2] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[0.92rem] font-semibold text-[#3c4359]">Booking summary</h2>
            <div className="flex items-center gap-2">
              <button className="h-8 rounded-full border border-[#dfe4ef] bg-[#f7f8fb] px-5 text-[0.74rem] font-semibold text-[#4f566c]" type="button">Send message</button>
              <button className="inline-flex h-8 items-center gap-2 rounded-full bg-[#232066] px-5 text-[0.74rem] font-semibold text-white" type="button">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                Accept session
              </button>
              <button className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6f768c]" type="button">
                <EllipsisVertical className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#edf0f6] p-4">
            <div className="grid gap-x-8 gap-y-4 text-[0.76rem] text-[#687086] sm:grid-cols-2 xl:grid-cols-4">
              <SummaryItem label="Department type" value="Academics" />
              <SummaryItem label="Session" value="Online" />
              <SummaryItem label="Period" value="Evening" />
              <SummaryItem label="Number of weeks" value="2 weeks" />
              <SummaryItem label="Hours per day" value="1 hour" />
              <SummaryItem label="Payment option" value="Full payment" />
              <SummaryItem label="Availability" value="Mondays" />
              <SummaryItem label="Tutor's fee" value="N3,500" />
            </div>
          </div>
        </article>

        <div className="grid gap-5 xl:grid-cols-[0.82fr_1.18fr]">
          <article className="h-fit rounded-xl border border-[#e3e8f2] bg-white p-4">
            <h3 className="border-b border-[#eef1f6] pb-3 text-[0.82rem] font-semibold text-[#3c4359]">
              <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#eef0ff] text-[#4b49d8]">!</span>
              Important Guidelines
            </h3>
            <div className="mt-3 space-y-3 text-[0.74rem] leading-relaxed text-[#4f576d]">
              <Guideline text="Please wait for the student to start the session before you begin. Starting early may result in unpaid time." />
              <Guideline text="By choosing to start the session before the student, you acknowledge that this time may not be compensated." />
            </div>
          </article>

          <div className="space-y-5">
            <article className="rounded-xl border border-[#e3e8f2] bg-white p-4">
              <h3 className="text-[0.9rem] font-semibold text-[#3c4359]">Student details</h3>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative h-[5.25rem] w-[5.25rem] shrink-0">
                  <Avatar
                    alt="Oluyinka Emmanuel"
                    className="h-[5.25rem] w-[5.25rem] overflow-hidden rounded-[0.75rem]"
                    initials="OE"
                    randomImage
                    randomSeed="student-profile-oluyinka"
                  />
                  <span className="absolute -bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-[#1b1848] px-2 py-0.5 text-[0.62rem] font-semibold text-white">
                    <Star className="h-3 w-3 text-[#f7c845]" fill="currentColor" strokeWidth={1} />
                    4.5
                  </span>
                </div>
                <div>
                  <p className="text-[1.65rem] font-semibold leading-none text-[#30364a]">Oluyinka Emmanuel</p>
                  <p className="mt-2 inline-flex items-center gap-1 text-[0.75rem] text-[#6c7488]">
                    <MapPin className="h-3.5 w-3.5 text-[#6366d7]" />
                    Oniru, Victoria Island
                    <span className="text-[#a0a7b8]">-</span>
                    <span className="font-semibold text-[#4f566b]">5km</span> from you
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t border-[#eef1f6] pt-4">
                <h4 className="mb-3 text-[0.78rem] font-semibold text-[#60687d]">Student Bio</h4>
                <p className="text-[0.74rem] leading-relaxed text-[#3f4760]">
                  I am a motivated and curious student with a strong interest in learning and personal growth. I enjoy exploring new ideas, developing problem-solving skills, and working on projects that challenge my creativity. My interests include technology, design, and continuous self-improvement, and I am always eager to expand my knowledge and gain practical experience.
                </p>
              </div>
            </article>

            <article className="rounded-xl border border-[#e3e8f2] bg-white p-4">
              <h3 className="mb-5 text-[0.9rem] font-semibold text-[#3c4359]">Timeline</h3>
              <div className="space-y-7">
                {timeline.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="grid grid-cols-[1.7rem_1fr_auto] items-start gap-3">
                      <div className="relative mt-0.5">
                        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white ${step.active ? "border-[#dbdefb] text-[#4b49d8]" : "border-[#e0e5ef] text-[#4f566c]"}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {index !== timeline.length - 1 ? <span className="absolute left-1/2 top-7 h-[58px] w-px -translate-x-1/2 border-l border-dashed border-[#c7cbed]" /> : null}
                      </div>
                      <div>
                        <p className={`text-[0.86rem] font-semibold ${step.active ? "text-[#4b49d8]" : "text-[#4f566c]"}`}>{step.title}</p>
                        <p className="mt-0.5 text-[0.7rem] text-[#8a92a6]">{step.note}</p>
                      </div>
                      <p className="text-[0.76rem] text-[#7b8398]">{step.time}</p>
                    </div>
                  );
                })}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="block text-[#8a92a6]">{label}</span>
      <span className="font-semibold text-[#3f4760]">{value}</span>
    </p>
  );
}

function Guideline({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2">
      <span className="mt-1 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#6f768c] text-[0.52rem] font-bold text-white">i</span>
      <span>{text}</span>
    </p>
  );
}
