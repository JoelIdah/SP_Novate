"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, CheckCircle2, ChevronLeft, HelpCircle, Hourglass, MapPin, Star, X } from "lucide-react";

import {
  cancelBooking, getBookingDetails, rateBooking,
  type BookingDetails, type BookingStatus, type RatingInput,
} from "../../../../../components/bookings/bookings";
import { Avatar } from "../../../../../components/ui/Avatar";
import { SelectMenu } from "../../../../../components/ui/SelectMenu";

function titleCase(value: string) {
  return value.split(/[\s_-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
}

function amount(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function BookingDetailsPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError("");
      try {
        const result = await getBookingDetails(bookingId, controller.signal);
        if (controller.signal.aborted) return;
        setDetails(result);
        const queryStatus = new URLSearchParams(window.location.search).get("status");
        if (["pending", "awaiting_approval", "ongoing", "completed", "cancelled"].includes(queryStatus ?? "")) setStatus(queryStatus as BookingStatus);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Could not load booking details.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [bookingId]);

  const canCancel = status === "pending" || status === "awaiting_approval";
  const canRate = status === "completed";

  return <main className="min-h-dvh bg-white text-[#2f3547]">
    <header className="border-b border-[#e6e9f2] bg-white"><div className="mx-auto flex h-14 w-full max-w-[var(--app-max-width)] items-center justify-between px-[var(--app-gutter)]"><Link className="inline-flex items-center gap-2 text-[0.75rem] font-medium text-[#6f7891]" href="/students/bookings?view=manage"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#efeffa]"><ChevronLeft className="h-3.5 w-3.5 text-[#6d6bd6]" /></span>Bookings</Link><Link className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#e2e6ef] bg-[#f7f8fb] px-3 py-1.5 text-[0.76rem] font-semibold text-[#4f566c]" href="/students/chat"><HelpCircle className="h-3.5 w-3.5" />Need help</Link></div></header>
    <section className="mx-auto w-full max-w-[var(--app-max-width)] space-y-4 px-[var(--app-gutter)] py-4 sm:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-xl font-semibold text-ui-title sm:text-2xl">Booking details</h1><div className="flex gap-2">{canCancel ? <button className="min-h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#a34343]" onClick={() => setShowCancel(true)} type="button">Cancel booking</button> : null}{canRate ? <button className="min-h-10 rounded-full bg-[#232066] px-4 text-sm font-semibold text-white" onClick={() => setShowRating(true)} type="button">Rate session</button> : null}</div></div>
      {success ? <p className="rounded-xl border border-[#bde8d0] bg-[#effaf4] px-4 py-3 text-sm font-medium text-[#20784d]" role="status">{success}</p> : null}
      {loading ? <DetailsSkeleton /> : null}
      {!loading && error ? <p className="rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-4 py-4 text-sm font-medium text-[#8b5a20]" role="alert">{error}</p> : null}
      {!loading && details ? <BookingContent details={details} /> : null}
    </section>
    {showCancel ? <CancelModal bookingId={bookingId} onClose={() => setShowCancel(false)} onSuccess={() => { setShowCancel(false); setStatus("cancelled"); setSuccess("Booking cancelled successfully."); }} /> : null}
    {showRating ? <RatingModal bookingId={bookingId} onClose={() => setShowRating(false)} onSuccess={() => { setShowRating(false); setSuccess("Rating submitted successfully."); }} /> : null}
  </main>;
}

function BookingContent({ details }: { details: BookingDetails }) {
  return <>
    <article className="rounded-xl border border-[#e3e8f2] bg-white p-4"><h2 className="mb-3 text-[0.92rem] font-semibold text-[#3c4359]">Booking summary</h2><dl className="grid gap-3 text-[0.76rem] text-[#687086] sm:grid-cols-2 xl:grid-cols-4"><SummaryItem label="Department" value={details.summary.department} /><SummaryItem label="Session" value={titleCase(details.summary.session_type)} /><SummaryItem label="Period" value={titleCase(details.summary.period)} /><SummaryItem label="Number of weeks" value={String(details.summary.number_of_weeks)} /><SummaryItem label="Hours per day" value={String(details.summary.hours_per_day)} /><SummaryItem label="Payment option" value={titleCase(details.summary.payment_option)} /><SummaryItem label="Availability" value={details.summary.availability.map(titleCase).join(", ")} /><SummaryItem label="Tutor fee" value={amount(details.summary.tutor_fee)} /></dl></article>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"><div className="space-y-4"><article className="rounded-xl border border-[#e3e8f2] bg-white p-4"><h3 className="mb-3 text-[0.9rem] font-semibold text-[#3c4359]">Tutor details</h3><div className="flex gap-3"><Avatar alt={details.tutor.name} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#eef1f6]" initials={initials(details.tutor.name)} src={details.tutor.profile_photo || undefined} /><div className="flex-1"><p className="text-xl leading-tight font-semibold text-[#30364a]">{details.tutor.name}</p><p className="text-sm text-[#6f7689]">{[details.tutor.occupation, details.tutor.qualifications.join(", ")].filter(Boolean).join(" · ")}</p><p className="mt-1 inline-flex items-center gap-1 text-xs text-[#6c7488]"><Star className="h-3.5 w-3.5 text-[#f7c845]" fill="currentColor" />{details.tutor.rating.toFixed(1)}</p>{details.tutor.address || typeof details.tutor.distance_km === "number" ? <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-[#6c7488]"><MapPin className="h-3.5 w-3.5 text-[#6366d7]" />{details.tutor.address}{typeof details.tutor.distance_km === "number" ? ` · ${details.tutor.distance_km.toLocaleString()} km away` : ""}</p> : null}</div></div></article><article className="rounded-xl border border-[#e3e8f2] bg-white p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-[0.9rem] font-semibold text-[#3c4359]">Cost estimate</h3><span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${details.estimate.payment_status === "paid" ? "bg-[#eaf8ef] text-[#1f9a5f]" : "bg-[#fff6dd] text-[#9a7314]"}`}>{titleCase(details.estimate.payment_status)}</span></div><div className="space-y-1.5 text-[0.76rem] text-[#6b7389]"><CostRow label="Tutor fee" value={amount(details.estimate.tutor_fee)} /><CostRow label="Weekly rate" value={amount(details.estimate.weekly_rate)} /><CostRow label="Finder's fee" value={amount(details.estimate.finders_fee)} /><CostRow label={`VAT (${details.estimate.vat_percent}%)`} value={amount(details.estimate.vat)} /><CostRow label="Subtotal" value={amount(details.estimate.subtotal)} /><div className="mt-2 border-t border-[#e0e5f0] pt-2"><CostRow bold label="Total cost" value={amount(details.estimate.total)} /></div></div></article></div><article className="rounded-xl border border-[#e3e8f2] bg-white p-4"><h3 className="mb-4 text-[0.9rem] font-semibold text-[#3c4359]">Timeline</h3>{details.timeline.length ? <div className="space-y-5">{details.timeline.map((step, index) => { const Icon = step.reached ? CheckCircle2 : Hourglass; return <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]" key={`${step.label}-${step.date}-${step.time}`}><div className="relative mt-0.5"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${step.reached ? "border-[#bfe5cf] bg-[#effaf4] text-[#26945d]" : "border-[#d9def0] bg-white text-[#858ca0]"}`}><Icon className="h-3.5 w-3.5" /></span>{index !== details.timeline.length - 1 ? <span className="absolute left-1/2 top-6 h-[44px] w-px -translate-x-1/2 border-l border-dashed border-[#b7bced]" /> : null}</div><p className="text-[0.95rem] font-semibold text-[#565ddb]">{step.label}</p><p className="col-start-2 text-xs text-[#7b8398] sm:col-start-auto">{step.date} · {step.time}</p></div>; })}</div> : <p className="text-sm text-[#7a8298]">No timeline events yet.</p>}</article></div>
  </>;
}

function CancelModal({ bookingId, onClose, onSuccess }: { bookingId: string; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason] = useState(""); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState("");
  const submit = async () => { setSubmitting(true); setError(""); try { await cancelBooking(bookingId, reason); onSuccess(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not cancel booking."); setSubmitting(false); } };
  return <ModalShell onClose={submitting ? () => undefined : onClose} title="Cancel booking"><p className="text-sm text-[#747d91]">You can optionally tell the tutor why you are cancelling.</p><textarea className="mt-4 h-28 w-full resize-none rounded-xl border border-[#d7dce8] px-3 py-2 text-sm outline-none focus:border-[#5f64d8]" onChange={(event) => setReason(event.target.value)} placeholder="Reason (optional)" value={reason} />{error ? <ActionError message={error} /> : null}<div className="mt-5 flex justify-end gap-2"><button className="h-11 rounded-full border border-[#d8dde8] px-5 text-sm font-semibold" disabled={submitting} onClick={onClose} type="button">Back</button><button className="h-11 rounded-full bg-[#a34343] px-5 text-sm font-semibold text-white disabled:opacity-60" disabled={submitting} onClick={() => void submit()} type="button">{submitting ? "Cancelling..." : "Cancel booking"}</button></div></ModalShell>;
}

function RatingModal({ bookingId, onClose, onSuccess }: { bookingId: string; onClose: () => void; onSuccess: () => void }) {
  const [rating, setRating] = useState(0); const [clarity, setClarity] = useState(""); const [onTime, setOnTime] = useState(""); const [goal, setGoal] = useState(""); const [recommend, setRecommend] = useState(""); const [feedback, setFeedback] = useState(""); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState("");
  const complete = rating >= 1 && rating <= 5 && clarity && onTime && goal && recommend;
  const submit = async () => { if (!complete) return; setSubmitting(true); setError(""); try { const input: RatingInput = { rating, explained_clearly: clarity as RatingInput["explained_clearly"], was_on_time: onTime as RatingInput["was_on_time"], achieved_goal: goal as RatingInput["achieved_goal"], would_recommend: recommend as RatingInput["would_recommend"], ...(feedback.trim() ? { feedback: feedback.trim() } : {}) }; await rateBooking(bookingId, input); onSuccess(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not submit rating."); setSubmitting(false); } };
  return <ModalShell onClose={submitting ? () => undefined : onClose} title="Rate your session"><p className="text-sm text-[#747d91]">Share your experience with this tutor.</p><div className="mt-4 flex justify-center gap-1">{[1,2,3,4,5].map((value) => <button aria-label={`${value} stars`} className="inline-flex h-11 w-11 items-center justify-center" key={value} onClick={() => setRating(value)} type="button"><Star className={`h-6 w-6 ${rating >= value ? "text-[#f7c845]" : "text-[#d5dbeb]"}`} fill="currentColor" /></button>)}</div><div className="mt-4 space-y-3"><RatingSelect label="Did the tutor explain concepts clearly?" onChange={setClarity} options={[{label:"Very clearly",value:"very_clearly"},{label:"Somewhat",value:"somewhat"},{label:"Not really",value:"not_really"}]} value={clarity} /><RatingSelect label="Was the tutor on time?" onChange={setOnTime} options={[{label:"Yes",value:"yes"},{label:"No",value:"no"}]} value={onTime} /><RatingSelect label="Did you achieve your goal?" onChange={setGoal} options={[{label:"Yes",value:"yes"},{label:"Partially",value:"partially"},{label:"No",value:"no"}]} value={goal} /><RatingSelect label="Would you recommend this tutor?" onChange={setRecommend} options={[{label:"Yes",value:"yes"},{label:"No",value:"no"}]} value={recommend} /><label className="block text-xs font-semibold text-[#3f4760]">Feedback (optional)<textarea className="mt-1.5 h-24 w-full resize-none rounded-xl border border-[#d7dce8] px-3 py-2 text-sm outline-none focus:border-[#5f64d8]" maxLength={500} onChange={(event) => setFeedback(event.target.value)} value={feedback} /><span className="mt-1 block text-right font-normal text-[#8b93a8]">{feedback.length}/500</span></label></div>{error ? <ActionError message={error} /> : null}<div className="mt-5 flex justify-end gap-2"><button className="h-11 rounded-full border border-[#d8dde8] px-5 text-sm font-semibold" disabled={submitting} onClick={onClose} type="button">Cancel</button><button className="inline-flex h-11 items-center gap-1 rounded-full bg-[#232066] px-5 text-sm font-semibold text-white disabled:bg-[#a6a9c9]" disabled={!complete || submitting} onClick={() => void submit()} type="button"><Check className="h-4 w-4" />{submitting ? "Submitting..." : "Submit rating"}</button></div></ModalShell>;
}

function ModalShell({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) { return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101634]/45 p-4" onClick={onClose}><section aria-modal="true" className="mx-auto my-[5vh] w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog"><div className="flex items-center justify-between gap-3"><h2 className="text-2xl font-semibold text-[#2f3547]">{title}</h2><button aria-label="Close" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#70798e] hover:bg-[#f3f4f8]" onClick={onClose} type="button"><X className="h-4 w-4" /></button></div><div className="mt-3">{children}</div></section></div>; }
function RatingSelect({ label, onChange, options, value }: { label: string; onChange: (value: string) => void; options: Array<{label:string;value:string}>; value: string }) { return <label className="block text-xs font-semibold text-[#3f4760]">{label}<SelectMenu ariaLabel={label} className="mt-1.5" onChange={onChange} options={options} placeholder="Select answer" value={value} /></label>; }
function ActionError({ message }: { message: string }) { return <p className="mt-4 rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-sm font-medium text-[#8b5a20]" role="alert">{message}</p>; }
function SummaryItem({ label, value }: { label: string; value: string }) { return <div><dt className="text-[#8a92a6]">{label}</dt><dd className="mt-1 font-semibold text-[#3f4760]">{value}</dd></div>; }
function CostRow({ bold = false, label, value }: { bold?: boolean; label: string; value: string }) { return <p className={`flex items-center justify-between ${bold ? "text-[0.92rem] font-semibold text-[#2f3547]" : ""}`}><span>{label}</span><span>{value}</span></p>; }
function DetailsSkeleton() { return <div className="animate-pulse space-y-4"><div className="h-36 rounded-xl bg-[#eef1f6]" /><div className="grid gap-4 lg:grid-cols-2"><div className="h-72 rounded-xl bg-[#f3f5f8]" /><div className="h-72 rounded-xl bg-[#f3f5f8]" /></div></div>; }
