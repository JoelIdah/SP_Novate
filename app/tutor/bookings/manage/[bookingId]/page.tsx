"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, CheckCircle2, ChevronLeft, CircleHelp, Hourglass, MapPin, Star } from "lucide-react";

import { acceptTutorBooking, declineTutorBooking, getTutorBooking, type TutorBookingDetails } from "../../../../../components/tutor/tutorBookings";
import { Avatar } from "../../../../../components/ui/Avatar";

function words(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export default function TutorBookingDetailsPage() {
  const bookingId = String(useParams<{ bookingId: string }>().bookingId ?? "");
  const [details, setDetails] = useState<TutorBookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<"accept" | "decline" | null>(null);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    const controller = new AbortController();
    getTutorBooking(bookingId, controller.signal)
      .then(setDetails)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setError(reason instanceof Error ? reason.message : "Booking details could not be loaded.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [bookingId]);

  const accept = async () => {
    setAction("accept"); setError(""); setMessage("");
    try { await acceptTutorBooking(bookingId); setMessage("Booking accepted."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The booking could not be accepted."); }
    finally { setAction(null); }
  };

  const decline = async () => {
    setAction("decline"); setError(""); setMessage("");
    try { await declineTutorBooking(bookingId, declineReason); setMessage("Booking declined."); setDeclineOpen(false); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The booking could not be declined."); }
    finally { setAction(null); }
  };

  return (
    <main className="min-h-dvh bg-white text-[#2f3547]">
      <header className="border-b border-[#e6e9f2] bg-white"><div className="mx-auto flex min-h-14 w-full max-w-[var(--app-max-width)] items-center justify-between gap-3 px-[var(--app-gutter)] py-2"><div><Link className="inline-flex items-center gap-2 text-xs font-medium text-[#6f7891]" href="/tutor/bookings"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#efeffa]"><ChevronLeft className="h-3.5 w-3.5 text-[#6d6bd6]" /></span>Bookings</Link><h1 className="mt-1 text-base font-semibold text-[#1f2550]">Student profile</h1></div><button className="inline-flex items-center gap-1 rounded-full border border-[#e2e6ef] bg-[#f7f8fb] px-3 py-1.5 text-xs font-semibold text-[#4f566c]" type="button"><CircleHelp className="h-3.5 w-3.5" />Need help</button></div></header>

      <section className="mx-auto w-full max-w-[var(--app-max-width)] space-y-5 px-[var(--app-gutter)] py-4 sm:py-6">
        {loading ? <p className="py-12 text-center text-sm text-[#7a8297]">Loading booking details...</p> : null}
        {error ? <p className="rounded-lg border border-[#f0d2ce] bg-[#fff7f5] px-3 py-2 text-sm text-brand-danger" role="alert">{error}</p> : null}
        {message ? <p className="rounded-lg border border-[#bde8d0] bg-[#effaf4] px-3 py-2 text-sm text-[#20784d]" role="status">{message}</p> : null}

        {details ? <>
          <article className="rounded-xl border border-[#e3e8f2] bg-white p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold text-[#3c4359]">Booking summary</h2><div className="flex w-full flex-wrap items-center gap-2 sm:w-auto"><button className="h-8 rounded-full border border-[#dfe4ef] bg-[#f7f8fb] px-5 text-xs font-semibold text-[#4f566c]" type="button">Send message</button><button className="inline-flex h-8 items-center gap-2 rounded-full bg-[#232066] px-5 text-xs font-semibold text-white disabled:opacity-50" disabled={action !== null} onClick={() => void accept()} type="button"><Check className="h-3.5 w-3.5" strokeWidth={3} />{action === "accept" ? "Accepting..." : "Accept session"}</button><button className="h-8 rounded-full border border-[#efd1cf] px-4 text-xs font-semibold text-brand-danger disabled:opacity-50" disabled={action !== null} onClick={() => setDeclineOpen(true)} type="button">Decline</button></div></div><div className="rounded-lg border border-[#edf0f6] p-4"><div className="grid gap-x-8 gap-y-4 text-xs text-[#687086] sm:grid-cols-2 xl:grid-cols-4"><SummaryItem label="Department" value={details.summary.department} /><SummaryItem label="Session" value={words(details.summary.session_type)} /><SummaryItem label="Period" value={words(details.summary.period)} /><SummaryItem label="Number of weeks" value={String(details.summary.number_of_weeks)} /><SummaryItem label="Hours per day" value={String(details.summary.hours_per_day)} /><SummaryItem label="Payment option" value={words(details.summary.payment_option)} /><SummaryItem label="Availability" value={details.summary.availability.map(words).join(", ")} /><SummaryItem label="Tutor fee" value={details.summary.tutor_fee.toLocaleString()} /></div></div></article>

          <div className="grid gap-5 lg:grid-cols-[minmax(16rem,0.82fr)_minmax(0,1.18fr)]"><article className="h-fit rounded-xl border border-[#e3e8f2] bg-white p-4"><h3 className="border-b border-[#eef1f6] pb-3 text-sm font-semibold text-[#3c4359]">Important guidelines</h3><p className="mt-3 text-xs leading-relaxed text-[#4f576d]">Review the booking information and student details before accepting or declining the request.</p></article><div className="space-y-5"><article className="rounded-xl border border-[#e3e8f2] bg-white p-4"><h3 className="text-sm font-semibold text-[#3c4359]">Student details</h3><div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center"><div className="relative h-20 w-20 shrink-0"><Avatar alt={details.student.name} className="h-20 w-20 overflow-hidden rounded-xl" initials={initials(details.student.name)} src={details.student.profile_photo || undefined} /><span className="absolute -bottom-2 left-3 inline-flex items-center gap-1 rounded-full bg-[#1b1848] px-2 py-0.5 text-xs font-semibold text-white"><Star className="h-3 w-3 text-[#f7c845]" fill="currentColor" />{details.student.rating.toFixed(1)}</span></div><div><p className="text-xl font-semibold text-[#30364a] sm:text-2xl">{details.student.name}</p><p className="mt-2 inline-flex items-center gap-1 text-xs text-[#6c7488]"><MapPin className="h-3.5 w-3.5 text-[#6366d7]" />{details.student.address}<span className="text-[#a0a7b8]">-</span><span className="font-semibold text-[#4f566b]">{details.student.distance_km.toLocaleString()} km</span> from you</p></div></div><div className="mt-5 border-t border-[#eef1f6] pt-4"><h4 className="mb-3 text-xs font-semibold text-[#60687d]">Student bio</h4><p className="text-xs leading-relaxed text-[#3f4760]">{details.student.bio || "No bio provided."}</p></div></article>

          <article className="rounded-xl border border-[#e3e8f2] bg-white p-4"><h3 className="mb-5 text-sm font-semibold text-[#3c4359]">Timeline</h3><div className="space-y-7">{details.timeline.map((step, index) => { const Icon = step.reached ? CheckCircle2 : Hourglass; return <div className="grid grid-cols-[1.7rem_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[1.7rem_minmax(0,1fr)_auto]" key={`${step.label}-${index}`}><div className="relative mt-0.5"><span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white ${step.reached ? "border-[#dbdefb] text-[#4b49d8]" : "border-[#e0e5ef] text-[#4f566c]"}`}><Icon className="h-3.5 w-3.5" /></span>{index !== details.timeline.length - 1 ? <span className="absolute left-1/2 top-7 h-[58px] w-px -translate-x-1/2 border-l border-dashed border-[#c7cbed]" /> : null}</div><p className={`text-sm font-semibold ${step.reached ? "text-[#4b49d8]" : "text-[#4f566c]"}`}>{step.label}</p><p className="col-start-2 text-xs text-[#7b8398] sm:col-start-auto">{[step.date, step.time].filter(Boolean).join(" · ") || "-"}</p></div>; })}</div></article></div></div>
        </> : null}
      </section>

      {declineOpen ? <div aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-[#17152f]/50 p-4" role="dialog"><div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"><h2 className="text-lg font-semibold text-[#30364a]">Decline booking</h2><p className="mt-1 text-sm text-[#6f7689]">You can tell the student why this request cannot be accepted.</p><label className="mt-4 block text-xs font-semibold text-[#596277]">Reason (optional)<textarea className="mt-1.5 min-h-28 w-full rounded-lg border border-[#dfe3eb] p-3 text-sm font-normal outline-none focus:border-[#6d63ee]" onChange={(event) => setDeclineReason(event.target.value)} value={declineReason} /></label><div className="mt-5 flex justify-end gap-2"><button className="h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#555e73]" onClick={() => setDeclineOpen(false)} type="button">Cancel</button><button className="h-10 rounded-full bg-brand-danger px-5 text-sm font-semibold text-white disabled:opacity-50" disabled={action !== null} onClick={() => void decline()} type="button">{action === "decline" ? "Declining..." : "Decline booking"}</button></div></div></div> : null}
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <p><span className="block text-[#8a92a6]">{label}</span><span className="font-semibold text-[#3f4760]">{value}</span></p>;
}
