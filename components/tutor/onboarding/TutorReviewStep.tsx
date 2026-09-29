"use client";

import { CircleDollarSign, FileCheck2, MapPin, Pencil, UserRound } from "lucide-react";
import Image from "next/image";

import type { TutorOnboardingReview } from "./tutorOnboarding";

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ReviewField({ label, value }: { label: string; value?: string }) {
  return <div className="min-w-0"><dt className="text-xs font-medium text-[#7d879d]">{label}</dt><dd className="mt-1 break-words text-sm font-semibold leading-relaxed text-[#35405a]">{value || "—"}</dd></div>;
}

function ReviewCard({ children, className = "", editable, icon: Icon, onEdit, title }: { children: React.ReactNode; className?: string; editable: boolean; icon: typeof UserRound; onEdit: () => void; title: string }) {
  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl border border-[#dce2ec] bg-[#f7f8fc] shadow-[0_6px_20px_rgba(31,40,74,0.05)] ${className}`}>
      <header className="flex items-center justify-between border-b border-[#e2e6ee] px-4 py-3.5 sm:px-5">
        <h2 className="flex items-center gap-2.5 text-sm font-bold text-[#35405a]"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#4039bd] text-white"><Icon size={14} /></span>{title}</h2>
        {editable ? <button className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#5652c9] hover:bg-[#eeedff]" onClick={onEdit} type="button"><Pencil size={13} /> Edit</button> : null}
      </header>
      <div className="flex-1 bg-white p-4 sm:p-5">{children}</div>
    </article>
  );
}

export function TutorReviewStep({ canSubmit, confirmed, editable, onConfirmedChange, onEdit, review }: {
  canSubmit: boolean;
  confirmed: boolean;
  editable: boolean;
  onConfirmedChange: (value: boolean) => void;
  onEdit: (section: "personal" | "identity" | "compensation" | "location") => void;
  review: TutorOnboardingReview;
}) {
  const personal = review.personal_details;
  const identity = review.identification;
  const identityDocuments = review.documents;
  const compensation = review.compensation;
  const location = review.location;
  const mapUrl = location
    ? `/api/places/map?latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}`
    : "";
  const uk = identity?.country === "uk" || compensation?.country === "uk";

  return (
    <section className="mx-auto w-full max-w-[75rem] pb-6">
      <div className="mb-6 text-center"><h1 className="text-2xl font-bold text-[#1d2331] sm:text-3xl">Hey {personal?.first_name || "there"}!</h1><p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-relaxed text-[#7d879d] sm:text-base">Please confirm the information saved for your tutor application.</p></div>
      <div className="mb-4 rounded-xl border border-[#dfe3f0] bg-[#f4f5fb] px-4 py-3.5 text-sm text-[#505a72]"><span className="font-semibold">Application status:</span> {titleCase(review.tutor_status)}</div>
      {!review.is_complete ? <div className="mb-4 rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-4 py-3.5 text-sm text-[#8b5a20]" role="alert"><p className="font-semibold">Your application is not complete yet.</p><p className="mt-1 text-sm">Missing: {review.missing_steps.length ? review.missing_steps.map(titleCase).join(", ") : "one or more required steps"}.</p></div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <ReviewCard className="lg:col-span-2" editable={editable} icon={UserRound} onEdit={() => onEdit("personal")} title="Personal information">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4"><ReviewField label="First name" value={personal?.first_name} /><ReviewField label="Last name" value={personal?.last_name} /><ReviewField label="Other names" value={personal?.other_names} /><ReviewField label="Date of birth" value={personal?.dob} /><ReviewField label="Email" value={personal?.email} /><ReviewField label="Phone number" value={personal?.phone_number} /><ReviewField label="Occupation" value={personal?.occupation} /><ReviewField label="Qualifications" value={personal?.qualifications.join(", ")} /><div className="sm:col-span-2 xl:col-span-4 xl:max-w-[75ch]"><ReviewField label="Tutor bio" value={personal?.bio} /></div></dl>
        </ReviewCard>

        <ReviewCard editable={editable} icon={FileCheck2} onEdit={() => onEdit("identity")} title="Identification verification">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {uk ? <><ReviewField label="Employer share code" value={identity?.employer_share_code} /><ReviewField label="DBS certificate number" value={identity?.dbs_certificate_number} /></> : null}
            <ReviewField label="Country" value={identity?.country ? titleCase(identity.country) : undefined} />
            <ReviewField label="ID type" value={identity?.id_type ? titleCase(identity.id_type) : undefined} />
            <ReviewField label="Verification status" value={identity?.status ? titleCase(identity.status) : "Not available"} />
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-[#7d879d]">ID documents</dt>
              {identityDocuments.length ? (
                <dd className="mt-1.5 flex flex-wrap gap-x-4 gap-y-2">
                  {identityDocuments.map((document) => (
                    <a
                      className="break-all text-sm font-semibold text-brand-accent hover:underline"
                      href={document.document_url}
                      key={document.document_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {document.file_name}
                    </a>
                  ))}
                </dd>
              ) : <dd className="mt-1 text-sm font-semibold text-[#35405a]">Not available</dd>}
            </div>
          </dl>
        </ReviewCard>

        <ReviewCard editable={editable} icon={CircleDollarSign} onEdit={() => onEdit("compensation")} title="Compensation details">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">{uk ? <><ReviewField label="Payout provider" value="Stripe" /><ReviewField label="Payouts enabled" value={compensation?.stripe_payouts_enabled ? "Yes" : "Pending"} /></> : <><ReviewField label="Bank name" value={compensation?.bank_name} /><ReviewField label="Bank code" value={compensation?.bank_code} /><ReviewField label="Account number" value={compensation?.account_number} /><ReviewField label="Account holder name" value={compensation?.account_name} /></>}</dl>
        </ReviewCard>

        <ReviewCard className="lg:col-span-2" editable={editable} icon={MapPin} onEdit={() => onEdit("location")} title="Location access">
          <dl><ReviewField label="Address" value={location?.address} /></dl>
          {mapUrl ? <div className="relative mt-4 aspect-[3.4/1] min-h-40 overflow-hidden rounded-xl border border-[#dce2ec]"><Image alt="Confirmed tutor location" className="object-cover" fill sizes="(min-width: 1024px) 1200px, 100vw" src={mapUrl} unoptimized /></div> : null}
        </ReviewCard>
      </div>
      {canSubmit ? <label className="mt-4 flex items-start gap-3 rounded-xl border border-[#d8deea] bg-white px-4 py-3.5 text-sm font-medium leading-relaxed text-[#4f586f]"><input checked={confirmed} className="mt-0.5 h-4 w-4 shrink-0 accent-[#4f4ac8]" onChange={(event) => onConfirmedChange(event.target.checked)} type="checkbox" />I confirm that the information saved above is accurate.</label> : null}
    </section>
  );
}
