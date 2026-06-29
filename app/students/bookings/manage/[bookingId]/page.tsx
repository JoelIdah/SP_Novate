"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, BookOpenCheck, Check, ChevronDown, ChevronLeft, CircleDot, HelpCircle, Hourglass, MapPin, Star, Target } from "lucide-react";

const timeline = [
  { title: "Pending Request", note: "request is awaiting tutor review", time: "May 6, 2024 · 12:04 PM", icon: Hourglass, done: true },
  { title: "Awaiting approval", note: "request approved by tutor", time: "May 7, 2024 · 12:04 PM", icon: BadgeCheck, done: true },
  { title: "Ongoing lesson", note: "request is awaiting tutor review", time: "May 8, 2024 · 12:04 PM", icon: BookOpenCheck, done: true },
  { title: "Completed today", note: "request is awaiting tutor review", time: "May 8, 2024 · 12:04 PM", icon: Target, done: true },
];

export default function BookingDetailsPage() {
  const [showRating, setShowRating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [clarity, setClarity] = useState("");
  const [onTime, setOnTime] = useState("");
  const [goals, setGoals] = useState("");
  const [recommend, setRecommend] = useState("");
  const [comment, setComment] = useState("");

  const canSubmit = rating > 0 && clarity && onTime && goals && recommend && comment.trim().length >= 10;

  return (
    <main className="min-h-dvh bg-white text-[#2f3547]">
      <header className="border-b border-[#e6e9f2] bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <Link className="inline-flex items-center gap-2 text-[0.75rem] font-medium text-[#6f7891]" href="/students/bookings">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#efeffa]">
              <ChevronLeft className="h-3.5 w-3.5 text-[#6d6bd6]" />
            </span>
            Bookings
          </Link>
          <button className="inline-flex items-center gap-1 rounded-full border border-[#e2e6ef] bg-[#f7f8fb] px-3 py-1.5 text-[0.76rem] font-semibold text-[#4f566c]" type="button">
            <HelpCircle className="h-3.5 w-3.5" />
            Need help
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1260px] space-y-4 px-5 py-4">
        <h1 className="text-[1.25rem] font-semibold text-[#2f3547]">Booking details</h1>

        <article className="rounded-xl border border-[#e3e8f2] bg-white p-4">
          <h2 className="mb-3 text-[0.92rem] font-semibold text-[#3c4359]">Booking summary</h2>
          <div className="grid gap-3 text-[0.76rem] text-[#687086] sm:grid-cols-2 xl:grid-cols-4">
            <SummaryItem label="Department type" value="Academics" />
            <SummaryItem label="Session" value="Online" />
            <SummaryItem label="Period" value="Evening" />
            <SummaryItem label="Number of weeks" value="2 weeks" />
            <SummaryItem label="Hours per day" value="1 hour" />
            <SummaryItem label="Payment option" value="Full payment" />
            <SummaryItem label="Availability" value="Mondays" />
            <SummaryItem label="Tutor's fee" value="N3,500" />
          </div>
        </article>

        <div className="grid gap-4 xl:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4">
            <article className="rounded-xl border border-[#e3e8f2] bg-white p-4">
              <h3 className="mb-3 text-[0.9rem] font-semibold text-[#3c4359]">Tutor details</h3>
              <div className="flex gap-3">
                <div className="relative h-16 w-16 rounded-xl bg-[linear-gradient(135deg,#b78d65_0%,#d7b58f_100%)]">
                  <span className="absolute -bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#1b1848] px-2 py-0.5 text-[0.62rem] font-semibold text-white">
                    <Star className="h-3 w-3 text-[#f7c845]" fill="currentColor" strokeWidth={1} />
                    4.5
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[2rem] leading-none font-semibold text-[#30364a]">Oluyinka Emmanuel</p>
                  <p className="text-[0.95rem] text-[#6f7689]">Software engineer • B.sc, M.sc</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Mathematics", "Physics", "Further mathematics"].map((tag) => (
                      <span key={tag} className="rounded-md bg-[#ecf0f5] px-2 py-0.5 text-[0.68rem] font-medium text-[#5e677b]">{tag}</span>
                    ))}
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1 text-[0.75rem] text-[#6c7488]">
                    <MapPin className="h-3.5 w-3.5 text-[#6366d7]" />
                    Oniru, Victoria Island • <span className="font-semibold">5km</span> from you
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-[#e3e8f2] bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[0.9rem] font-semibold text-[#3c4359]">Cost estimate</h3>
                <span className="rounded-full bg-[#eaf8ef] px-2 py-0.5 text-[0.68rem] font-semibold text-[#1f9a5f]">Paid</span>
              </div>
              <div className="space-y-1.5 text-[0.76rem] text-[#6b7389]">
                <CostRow label="Tutor's fee" value="N3,500" />
                <CostRow label="Weekly rate" value="N7,000" />
                <p className="text-[0.62rem] text-[#8e96aa]">Based on 2 sessions per week and 1 hour per session</p>
                <CostRow label="Finder's fee" value="N500" />
                <CostRow label="VAT (7.5%)" value="N37.50" />
                <CostRow label="Subtotal" value="N11,037.50" />
                <CostRow label="Applicable taxes" value="N0.00" />
                <div className="mt-2 border-t border-[#e0e5f0] pt-2">
                  <CostRow bold label="Total cost" value="N11,037.50" />
                </div>
              </div>
            </article>
          </div>

          <article className="rounded-xl border border-[#e3e8f2] bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[0.9rem] font-semibold text-[#3c4359]">Timeline</h3>
              <button className="rounded-full bg-[#232066] px-3 py-1 text-[0.7rem] font-semibold text-white" onClick={() => setShowRating(true)} type="button">
                Rate session
              </button>
            </div>
            <div className="space-y-5">
              {timeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="grid grid-cols-[1.5rem_1fr_auto] items-start gap-3">
                    <div className="relative mt-0.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d9def0] bg-white text-[#585ddb]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      {index !== timeline.length - 1 ? <span className="absolute left-1/2 top-6 h-[44px] w-px -translate-x-1/2 border-l border-dashed border-[#b7bced]" /> : null}
                    </div>
                    <div>
                      <p className="text-[0.95rem] font-semibold text-[#565ddb]">{step.title}</p>
                      <p className="text-[0.72rem] text-[#8a92a6]">{step.note}</p>
                    </div>
                    <p className="text-[0.78rem] text-[#7b8398]">{step.time}</p>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      {showRating ? (
        <div className="fixed inset-0 z-50 bg-[#101634]/45 p-4" onClick={() => setShowRating(false)}>
          <div className="mx-auto mt-[8vh] w-full max-w-[620px] rounded-2xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[2rem] font-semibold leading-none text-[#2f3547]">Rate your session</h3>
            <p className="mt-1 text-[0.72rem] text-[#8b93a8]">How was your session? Share your feedback about your tutor.</p>

            <div className="mt-3">
              <p className="mb-2 text-center text-[0.78rem] font-semibold text-[#5d657b]">How would you rate your session?</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className="p-1" onClick={() => setRating(n)} type="button">
                    <Star className={`h-5 w-5 ${rating >= n ? "text-[#f7c845]" : "text-[#d5dbeb]"}`} fill="currentColor" strokeWidth={1} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <QuestionSelect label="Did the tutor explain concepts clearly?" onChange={setClarity} value={clarity} />
              <QuestionSelect label="Was the tutor on time for the session?" onChange={setOnTime} value={onTime} />
              <QuestionSelect label="Did the session help you achieve your learning goals?" onChange={setGoals} value={goals} />
              <QuestionSelect label="Would you recommend this tutor to others?" onChange={setRecommend} value={recommend} />
              <label className="block text-[0.76rem] font-semibold text-[#3f4760]">
                Tell us more about your experience <span className="font-medium text-[#8b93a8]">(optional)</span>
                <textarea className="mt-1.5 h-24 w-full resize-none rounded-xl border border-[#d7dce8] px-3 py-2 text-[0.76rem] outline-none focus:border-[#5f64d8]" onChange={(e) => setComment(e.target.value)} placeholder="Share what you liked or what could be improved..." value={comment} />
                <span className="mt-1 block text-[0.62rem] text-[#8b93a8]">Bio must be at least 10 characters</span>
              </label>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button className="h-9 rounded-full bg-[#ececef] px-4 text-[0.78rem] font-semibold text-[#4e576d]" onClick={() => setShowRating(false)} type="button">Cancel</button>
              <button
                className="inline-flex h-9 items-center gap-1 rounded-full bg-[#232066] px-4 text-[0.78rem] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#a6a9c9]"
                disabled={!canSubmit}
                onClick={() => {
                  setShowRating(false);
                  setShowSuccess(true);
                }}
                type="button"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                Submit Review
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSuccess ? (
        <div className="fixed inset-0 z-50 bg-[#101634]/45 p-4" onClick={() => setShowSuccess(false)}>
          <div className="mx-auto mt-[20vh] w-full max-w-[520px] rounded-3xl bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff2ff]">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1f9ec7] text-white">
                <CircleDot className="h-6 w-6" />
              </span>
            </div>
            <h3 className="mt-5 text-[2rem] font-semibold leading-none text-[#2f3547]">You&apos;re good to go.</h3>
            <p className="mt-2 text-[0.95rem] text-[#6d758a]">Thank you for your feedback!</p>
            <Link className="mt-6 inline-flex rounded-full border border-[#d9dfeb] bg-white px-4 py-2 text-[0.82rem] font-semibold text-[#3e4a66]" href="/students/bookings">
              back to dashboard
            </Link>
          </div>
        </div>
      ) : null}
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

function CostRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <p className={`flex items-center justify-between ${bold ? "text-[0.92rem] font-semibold text-[#2f3547]" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </p>
  );
}

function QuestionSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-[0.76rem] font-semibold text-[#3f4760]">
      {label}
      <div className="relative mt-1.5">
        <select className="h-10 w-full appearance-none rounded-xl border border-[#d7dce8] bg-white px-3 pr-9 text-[0.76rem] outline-none focus:border-[#5f64d8]" onChange={(e) => onChange(e.target.value)} value={value}>
          <option value="">Select answer</option>
          <option value="yes">Yes</option>
          <option value="mostly">Mostly</option>
          <option value="no">No</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3abba]" />
      </div>
    </label>
  );
}
