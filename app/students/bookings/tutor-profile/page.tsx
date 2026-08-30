"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, CalendarDays, CheckCircle2, ChevronLeft, CircleDollarSign,
  Clock3, FileText, HelpCircle, Link2, MapPin, PlayCircle, Star,
} from "lucide-react";

import { createBooking, estimateBooking, type BookingEstimate, type BookingInput, type PaymentOption } from "../../../../components/bookings/bookingApi";
import {
  getTutorProfile, getTutorRatings, getTutorResources,
  type TutorProfile, type TutorRating, type TutorResource, type TutorResources,
} from "../../../../components/bookings/tutorProfileApi";
import { Avatar } from "../../../../components/ui/Avatar";
import { Card } from "../../../../components/ui/Card";
import ResponsiveSheet from "../../../../components/ui/ResponsiveSheet";
import { SelectMenu } from "../../../../components/ui/SelectMenu";

const guidelineItems = [
  "Communication outside the platform is at your own risk.",
  "The platform is not liable for any external arrangements.",
  "Please arrive 5 minutes before the scheduled time.",
  "Payment is required upfront to confirm the lesson. Tutors receive payment only after the session is completed satisfactorily.",
  "A 24-hour cancellation notice is required.",
];

const emptyResources: TutorResources = { docs: [], link: [], video: [] };

function titleCase(value: string) {
  return value.split(/[\s_-]+/).filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase()).join("");
}

export default function TutorProfilePage() {
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [ratings, setRatings] = useState<TutorRating[]>([]);
  const [resources, setResources] = useState<TutorResources>(emptyResources);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [ratingsError, setRatingsError] = useState("");
  const [resourcesError, setResourcesError] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const tutorId = new URLSearchParams(window.location.search).get("tutorId")?.trim();
    if (!tutorId) {
      const timer = window.setTimeout(() => {
        setProfileError("A tutor ID is required to view this profile.");
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const controller = new AbortController();
    const load = async () => {
      const [profileResult, ratingsResult, resourcesResult] = await Promise.allSettled([
        getTutorProfile(tutorId, controller.signal),
        getTutorRatings(tutorId, controller.signal),
        getTutorResources(tutorId, controller.signal),
      ]);
      if (controller.signal.aborted) return;

      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      else setProfileError(profileResult.reason instanceof Error ? profileResult.reason.message : "Could not load this tutor profile.");

      if (ratingsResult.status === "fulfilled") setRatings(ratingsResult.value);
      else setRatingsError(ratingsResult.reason instanceof Error ? ratingsResult.reason.message : "Could not load tutor ratings.");

      if (resourcesResult.status === "fulfilled") setResources(resourcesResult.value);
      else setResourcesError(resourcesResult.reason instanceof Error ? resourcesResult.reason.message : "Could not load tutor resources.");

      setLoading(false);
    };
    void load();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!profile || new URLSearchParams(window.location.search).get("book") !== "1") return;
    const timer = window.setTimeout(() => setBookingOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [profile]);

  const selectedSubject = profile?.subjects[selectedSubjectIndex];
  const allResources = useMemo(
    () => [...resources.video, ...resources.link, ...resources.docs],
    [resources],
  );

  return (
    <main className="min-h-dvh bg-white text-[#2f3547]">
      <header className="border-b border-[#e6e9f2] bg-white">
        <div className="mx-auto flex h-14 w-full max-w-[var(--app-max-width)] items-center justify-between px-[var(--app-gutter)]">
          <Link className="inline-flex items-center gap-2 text-[0.75rem] font-medium text-[#6f7891]" href="/students/bookings">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#efeffa]"><ChevronLeft className="h-3.5 w-3.5 text-[#6d6bd6]" /></span>
            Bookings
          </Link>
          <Link className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#e2e6ef] bg-[#f7f8fb] px-3 py-1.5 text-[0.76rem] font-semibold text-[#4f566c]" href="/students/chat">
            <HelpCircle className="h-3.5 w-3.5" />Need help
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[var(--app-max-width)] px-[var(--app-gutter)] py-4 sm:py-5">
        <h1 className="text-xl font-semibold text-ui-title sm:text-2xl">Tutor Profile</h1>
        {loading ? <ProfileSkeleton /> : null}
        {!loading && profileError ? (
          <Card className="mt-4 p-6 text-center">
            <p className="text-sm font-medium text-[#a34343]" role="alert">{profileError}</p>
            <Link className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#232066] px-5 text-sm font-semibold text-white" href="/students/bookings">Back to tutors</Link>
          </Card>
        ) : null}

        {!loading && profile ? (
          <>
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
              <Card className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Avatar alt={profile.name} className="relative h-24 w-28 overflow-hidden rounded-xl bg-[#eef1f6]" initials={initials(profile.name)} src={profile.profile_photo || undefined}>
                    {!profile.profile_photo ? <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#596177]">{initials(profile.name)}</span> : null}
                    <div className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-[#1b1848] px-2 py-0.5 text-[0.62rem] font-semibold text-white">
                      <Star className="h-3 w-3 text-[#f7c845]" fill="currentColor" strokeWidth={1} />
                      {profile.average_rating.toFixed(1)} ({profile.rating_count})
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-2xl leading-tight font-semibold text-[#30364a] sm:text-3xl">{profile.name}</h2>
                        <p className="mt-1 text-sm text-[#6f7689] sm:text-base">{[profile.occupation, profile.qualifications.join(", ")].filter(Boolean).join(" · ")}</p>
                      </div>
                      {selectedSubject ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f8f0] px-2.5 py-1 text-[0.72rem] font-semibold text-[#27a56c]"><CheckCircle2 className="h-3.5 w-3.5" />{titleCase(selectedSubject.session_type)}</span> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.subjects.map((item) => <span key={`${item.department}-${item.subject}`} className="rounded-md bg-[#ecf0f5] px-2 py-0.5 text-[0.68rem] font-medium text-[#5e677b]">{item.subject}</span>)}
                    </div>
                    {profile.address || typeof profile.distance_km === "number" ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.78rem] text-[#6c7488]">
                        {profile.address ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#6366d7]" />{profile.address}</span> : null}
                        {profile.address && typeof profile.distance_km === "number" ? <span className="text-[#a2a9ba]">-</span> : null}
                        {typeof profile.distance_km === "number" ? <><span className="font-semibold text-[#4d556b]">{profile.distance_km.toLocaleString(undefined, { maximumFractionDigits: 1 })} km</span><span>from you</span></> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                {profile.subjects.length ? <>
                  <div className="mb-3 flex overflow-x-auto border-b border-[#eceff5] text-[0.9rem] font-semibold">
                    {profile.subjects.map((item, index) => <button className={`shrink-0 px-3 py-2 text-left ${index === selectedSubjectIndex ? "border-b-2 border-[#4a49d7] text-[#4a49d7]" : "text-[#7a8298]"}`} key={`${item.department}-${item.subject}`} onClick={() => setSelectedSubjectIndex(index)} type="button">{item.subject}</button>)}
                  </div>
                  {selectedSubject ? <SubjectSummary subject={selectedSubject} /> : null}
                </> : <p className="text-sm text-[#7a8298]">No subjects are listed for this tutor.</p>}
                <div className="mt-4 flex gap-2">
                  <Link className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-ui-border bg-white px-4 py-2 text-[0.74rem] font-semibold text-ui-body hover:bg-[#f7f8fb]" href={`/students/chat?contact=${encodeURIComponent(profile.public_id)}`}>Send message</Link>
                  <button className="min-h-11 flex-1 rounded-full bg-[#232066] px-4 py-2 text-[0.74rem] font-semibold text-white hover:bg-[#1c175f] disabled:cursor-not-allowed disabled:bg-[#a6a9c9]" disabled={!profile.subjects.length} onClick={() => setBookingOpen(true)} type="button">Book a session</button>
                </div>
              </Card>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[18rem_1fr]">
              <article className="rounded-xl border border-[#e3e7ef] bg-[#f4f5f7] p-4">
                <h3 className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[#7a8298]"><AlertCircle className="h-3.5 w-3.5 text-[#6366d7]" />Important Guidelines</h3>
                <ul className="mt-3 grid gap-2 text-[0.75rem] text-[#636b7f] sm:grid-cols-2 xl:grid-cols-1">
                  {guidelineItems.map((item) => <li key={item} className="flex min-w-0 items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6d7488]" /><span>{item}</span></li>)}
                </ul>
              </article>

              <div className="space-y-4">
                <Card className="p-4"><h3 className="text-[0.82rem] font-semibold text-[#6f7891]">About tutor</h3><p className="mt-2 text-[0.78rem] leading-5 text-[#5f667b]">{profile.bio}</p></Card>

                <article>
                  <h3 className="mb-2 text-[0.82rem] font-semibold text-[#6f7891]">Teaching categories</h3>
                  {profile.subjects.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{profile.subjects.map((subject) => <Card className="p-3" key={`${subject.department}-${subject.subject}`}><p className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[#4f566b]"><CircleDollarSign className="h-3.5 w-3.5" />{subject.subject}</p><p className="mt-1 text-[0.68rem] text-[#8e96aa]">{subject.department} · {titleCase(subject.level)} · {titleCase(subject.session_type)}</p><div className="mt-2 border-t border-[#eceff5]" /><SubjectSummary subject={subject} /></Card>)}</div> : <EmptyState text="No teaching categories are listed." />}
                </article>

                <section>
                  <h3 className="mb-2 text-[0.82rem] font-semibold text-[#6f7891]">Resources</h3>
                  {resourcesError ? <SectionError message={resourcesError} /> : allResources.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-3">{allResources.map((resource, index) => <ResourceCard key={`${resource.type}-${resource.title}-${index}`} resource={resource} />)}</div> : <EmptyState text="This tutor has no published resources." />}
                </section>

                <section>
                  <h3 className="mb-2 text-[0.82rem] font-semibold text-[#6f7891]">Testimonials</h3>
                  {ratingsError ? <SectionError message={ratingsError} /> : ratings.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-3">{ratings.map((rating, index) => <RatingCard key={`${rating.student_name}-${rating.created_at}-${index}`} rating={rating} />)}</div> : <EmptyState text="This tutor has no testimonials yet." />}
                </section>
              </div>
            </div>
          </>
        ) : null}
      </section>
      {profile ? <BookingSheet initialSubjectIndex={selectedSubjectIndex} onClose={() => setBookingOpen(false)} open={bookingOpen} profile={profile} /> : null}
    </main>
  );
}

function BookingSheet({ initialSubjectIndex, onClose, open, profile }: { initialSubjectIndex: number; onClose: () => void; open: boolean; profile: TutorProfile }) {
  const [subjectIndex, setSubjectIndex] = useState(initialSubjectIndex);
  const [days, setDays] = useState<string[]>([]);
  const [hoursPerDay, setHoursPerDay] = useState("1");
  const [numberOfWeeks, setNumberOfWeeks] = useState("1");
  const [paymentOption, setPaymentOption] = useState<PaymentOption | "">("");
  const [estimate, setEstimate] = useState<BookingEstimate | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const subject = profile.subjects[subjectIndex];

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setSubjectIndex(initialSubjectIndex);
      setDays([]);
      setHoursPerDay("1");
      setNumberOfWeeks("1");
      setPaymentOption("");
      setEstimate(null);
      setError("");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialSubjectIndex, open]);

  if (!subject) return null;
  const input: BookingInput = {
    days,
    department: subject.department,
    hours_per_day: Number(hoursPerDay),
    number_of_weeks: Number(numberOfWeeks),
    payment_option: paymentOption || "full",
    subject: subject.subject,
  };
  const complete = days.length > 0 && Number.isInteger(input.hours_per_day) && input.hours_per_day > 0 && Number.isInteger(input.number_of_weeks) && input.number_of_weeks >= 1 && Boolean(paymentOption);
  const toggleDay = (day: string) => setDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  const preview = async () => {
    if (!complete || !paymentOption) return;
    setLoadingEstimate(true); setError("");
    try { setEstimate(await estimateBooking(profile.public_id, { ...input, payment_option: paymentOption })); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not calculate this booking."); }
    finally { setLoadingEstimate(false); }
  };
  const proceed = async () => {
    if (!complete || !paymentOption || !estimate) return;
    setCreating(true); setError("");
    try {
      const result = await createBooking(profile.public_id, { ...input, payment_option: paymentOption });
      const checkoutUrl = new URL(result.checkout_url);
      if (checkoutUrl.protocol !== "https:" && checkoutUrl.protocol !== "http:") throw new Error("The payment service returned an invalid checkout URL.");
      window.location.assign(checkoutUrl.toString());
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not initialize payment."); setCreating(false); }
  };

  return <ResponsiveSheet open={open} onClose={creating ? () => undefined : onClose}><div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#d8dde8] xl:hidden" /><h2 className="text-2xl font-semibold text-[#2f3547]">{estimate ? "Review booking" : "Book a session"}</h2><p className="mt-1 text-xs text-[#8b93a8]">{estimate ? "This estimate comes directly from the booking service. No booking has been created yet." : `Choose a schedule for ${subject.subject}.`}</p>{error ? <p className="mt-4 rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-sm font-medium text-[#8b5a20]" role="alert">{error}</p> : null}<div className="mt-5 min-h-0 flex-1 overflow-y-auto pb-3">{!estimate ? <div className="space-y-4"><BookingSelect label="Subject" onChange={(value) => { setSubjectIndex(Number(value)); setDays([]); }} options={profile.subjects.map((item, index) => ({ label: `${item.department} · ${item.subject}`, value: String(index) }))} placeholder="Select subject" value={String(subjectIndex)} /><fieldset><legend className="text-sm font-semibold text-[#3f4760]">Available days</legend><div className="mt-2 flex flex-wrap gap-2">{subject.availability.map((item) => { const selected = days.includes(item.day); return <button aria-pressed={selected} className={`min-h-10 rounded-full border px-4 text-xs font-semibold ${selected ? "border-[#403bc0] bg-[#eeefff] text-[#3934ae]" : "border-[#d8dde8] text-[#687086]"}`} key={item.day} onClick={() => toggleDay(item.day)} type="button">{titleCase(item.day)}</button>; })}</div></fieldset><NumberField label="Hours per day" min={1} onChange={setHoursPerDay} value={hoursPerDay} /><NumberField label="Number of weeks" min={1} onChange={setNumberOfWeeks} value={numberOfWeeks} /><BookingSelect label="Payment option" onChange={(value) => setPaymentOption(value as PaymentOption)} options={[{ label: "Full payment", value: "full" }, { label: "Pay per session", value: "per_session" }]} placeholder="Select payment option" value={paymentOption} /></div> : <EstimateReview estimate={estimate} />}</div><div className="mt-auto flex gap-2 border-t border-[#eef1f6] bg-white py-3"><button className="h-11 flex-1 rounded-full bg-[#ececef] text-sm font-semibold text-[#4e576d]" disabled={creating} onClick={estimate ? () => setEstimate(null) : onClose} type="button">{estimate ? "Back" : "Cancel"}</button><button className="h-11 flex-1 rounded-full bg-[#232066] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#a6a9c9]" disabled={estimate ? creating : !complete || loadingEstimate} onClick={() => void (estimate ? proceed() : preview())} type="button">{estimate ? creating ? "Opening checkout..." : "Proceed to payment" : loadingEstimate ? "Calculating..." : "Review cost"}</button></div></ResponsiveSheet>;
}

function EstimateReview({ estimate }: { estimate: BookingEstimate }) {
  const money = (amount: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: estimate.estimate.currency }).format(amount);
  return <div className="space-y-4"><Card className="p-4"><h3 className="text-sm font-semibold text-[#3f4760]">Booking summary</h3><dl className="mt-3 grid grid-cols-2 gap-3 text-xs"><ReviewItem label="Department" value={estimate.summary.department} /><ReviewItem label="Subject" value={estimate.summary.subject} /><ReviewItem label="Days" value={estimate.summary.availability.map(titleCase).join(", ")} /><ReviewItem label="Hours per day" value={String(estimate.summary.hours_per_day)} /><ReviewItem label="Number of weeks" value={String(estimate.summary.number_of_weeks)} /><ReviewItem label="Payment" value={titleCase(estimate.summary.payment_option)} /></dl></Card><Card className="p-4"><h3 className="text-sm font-semibold text-[#3f4760]">Cost breakdown</h3><div className="mt-3 space-y-2 text-sm text-[#687086]"><CostLine label="Tutor fee" value={money(estimate.estimate.tutor_fee)} /><CostLine label="Finder's fee" value={money(estimate.estimate.finders_fee)} /><CostLine label="VAT" value={money(estimate.estimate.vat)} /><CostLine label="Subtotal" value={money(estimate.estimate.subtotal)} /><CostLine label="Full booking total" value={money(estimate.estimate.total)} /><div className="border-t border-[#e2e6ef] pt-2"><CostLine strong label="Amount due now" value={money(estimate.estimate.amount_due_now)} /></div>{estimate.summary.payment_option === "per_session" ? <CostLine label="Amount per session day" value={money(estimate.estimate.amount_per_session)} /> : null}</div></Card></div>;
}

function BookingSelect({ label, onChange, options, placeholder, value }: { label: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }>; placeholder: string; value: string }) { return <label className="block text-sm font-semibold text-[#3f4760]">{label}<SelectMenu ariaLabel={label} className="mt-1.5" onChange={onChange} options={options} placeholder={placeholder} value={value} /></label>; }
function NumberField({ label, min, onChange, value }: { label: string; min: number; onChange: (value: string) => void; value: string }) { return <label className="block text-sm font-semibold text-[#3f4760]">{label}<input className="mt-1.5 h-11 w-full rounded-xl border border-[#d8dde8] px-3 text-sm outline-none focus:border-[#5f64d8]" min={min} onChange={(event) => onChange(event.target.value)} step={1} type="number" value={value} /></label>; }
function ReviewItem({ label, value }: { label: string; value: string }) { return <div><dt className="text-[#8a92a6]">{label}</dt><dd className="mt-1 font-semibold text-[#3f4760]">{value}</dd></div>; }
function CostLine({ label, strong = false, value }: { label: string; strong?: boolean; value: string }) { return <p className={`flex items-center justify-between gap-4 ${strong ? "font-semibold text-[#2f3547]" : ""}`}><span>{label}</span><span>{value}</span></p>; }

function SubjectSummary({ subject }: { subject: TutorProfile["subjects"][number] }) {
  const days = subject.availability.map((entry) => titleCase(entry.day));
  return <><p className="mt-2 inline-flex items-center gap-1 text-[0.72rem] text-[#7f879a]"><CalendarDays className="h-3.5 w-3.5 text-[#5b60d7]" />{days.join(", ")}</p><p className="mt-2 inline-flex items-center gap-1 text-[0.72rem] text-[#7f879a]"><Clock3 className="h-3.5 w-3.5 text-[#5b60d7]" />Period: {subject.period}</p><p className="mt-2 text-[0.72rem] text-[#8e96aa]">Hourly rate</p><p className="text-3xl font-semibold leading-none text-[#3d3fd0]">{subject.rate_hourly.toLocaleString()}/hr</p></>;
}

function ResourceCard({ resource }: { resource: TutorResource }) {
  const Icon = resource.type === "video" ? PlayCircle : resource.type === "link" ? Link2 : FileText;
  return <Card className="min-h-32 p-4"><Icon className="h-5 w-5 text-[#5b60d7]" /><p className="mt-3 text-[0.9rem] font-semibold text-[#454d62]">{resource.title}</p><p className="mt-1 text-[0.7rem] text-[#7a8298]">{titleCase(resource.type)}</p></Card>;
}

function RatingCard({ rating }: { rating: TutorRating }) {
  return <Card className="min-h-48 p-4"><div className="flex items-center gap-1 text-[0.72rem] font-semibold text-[#4f566b]"><Star className="h-3.5 w-3.5 text-[#f7c845]" fill="currentColor" strokeWidth={1} />{rating.rating.toFixed(1)}</div><p className="mt-3 text-[0.74rem] leading-5 text-[#5d667c]">&quot;{rating.message}&quot;</p><div className="mt-4 flex items-center gap-2"><Avatar alt={rating.student_name} className="h-8 w-8 overflow-hidden rounded-full bg-[#eef1f6]" initials={initials(rating.student_name)} src={rating.student_photo || undefined} /><div><p className="text-[0.74rem] font-semibold text-[#4f566b]">{rating.student_name}</p><time className="text-[0.62rem] text-[#939bae]" dateTime={rating.created_at}>{rating.created_at}</time></div></div></Card>;
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-[#d9deea] bg-[#fafbfe] px-4 py-8 text-center text-sm text-[#747d92]">{text}</p>;
}

function SectionError({ message }: { message: string }) {
  return <p className="rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-4 py-3 text-sm font-medium text-[#8b5a20]" role="alert">{message}</p>;
}

function ProfileSkeleton() {
  return <div className="mt-4 animate-pulse space-y-3"><div className="h-40 rounded-xl bg-[#eef1f6]" /><div className="grid gap-3 md:grid-cols-2"><div className="h-48 rounded-xl bg-[#f3f5f8]" /><div className="h-48 rounded-xl bg-[#f3f5f8]" /></div></div>;
}
