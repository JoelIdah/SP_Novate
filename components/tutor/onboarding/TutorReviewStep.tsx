"use client";

import { CircleDollarSign, FileCheck2, MapPin, Pencil, UserRound } from "lucide-react";
import Image from "next/image";

import type { TutorOnboardingReview } from "./tutorOnboarding";

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ReviewField({ label, value }: { label: string; value?: string }) {
  return <div><p className="text-[0.68rem] font-medium text-[#8a93a7]">{label}</p><p className="mt-0.5 break-words text-xs font-semibold text-[#35405a]">{value || "—"}</p></div>;
}

function ReviewCard({ children, icon: Icon, onEdit, title }: { children: React.ReactNode; icon: typeof UserRound; onEdit: () => void; title: string }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e1e5ed] bg-[#f7f8fc]">
      <header className="flex items-center justify-between border-b border-[#e5e8f0] px-3 py-2">
        <h2 className="flex items-center gap-2 text-xs font-bold text-[#35405a]"><span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4039bd] text-white"><Icon size={11} /></span>{title}</h2>
        <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#5652c9]" onClick={onEdit} type="button"><Pencil size={11} /> Edit</button>
      </header>
      <div className="bg-white p-3">{children}</div>
    </article>
  );
}

export function TutorReviewStep({ confirmed, onConfirmedChange, onEdit, review }: {
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  onEdit: (section: "personal" | "identity" | "compensation" | "location") => void;
  review: TutorOnboardingReview;
}) {
  const personal = review.personal_details;
  const identity = review.identification;
  const compensation = review.compensation;
  const location = review.location;
  const mapUrl = location
    ? `/api/places/map?latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}`
    : "";
  const uk = identity?.country === "uk" || compensation?.country === "uk";

  return (
    <section className="mx-auto w-full max-w-[40rem] pb-4">
      <div className="mb-4 text-center"><h1 className="text-2xl font-bold text-[#1d2331]">Hey {personal?.first_name || "there"}!</h1><p className="mt-1 text-sm font-medium text-[#8a93a7]">Please confirm the information saved for your tutor application.</p></div>
      <div className="mb-3 rounded-xl border border-[#dfe3f0] bg-[#f7f8fc] px-4 py-3 text-sm text-[#596277]"><span className="font-semibold">Application status:</span> {titleCase(review.tutor_status)}</div>
      {!review.is_complete ? <div className="mb-3 rounded-xl border border-[#f0d6b5] bg-[#fff9f1] px-4 py-3 text-sm text-[#8b5a20]" role="alert"><p className="font-semibold">Your application is not complete yet.</p><p className="mt-1 text-xs">Missing: {review.missing_steps.length ? review.missing_steps.map(titleCase).join(", ") : "one or more required steps"}.</p></div> : null}
      <div className="space-y-3">
        <ReviewCard icon={UserRound} onEdit={() => onEdit("personal")} title="Personal information">
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 sm:grid-cols-4"><ReviewField label="First name" value={personal?.first_name} /><ReviewField label="Last name" value={personal?.last_name} /><ReviewField label="Other names" value={personal?.other_names} /><ReviewField label="Email" value={personal?.email} /><ReviewField label="Phone number" value={personal?.phone_number} /><ReviewField label="Occupation" value={personal?.occupation} /><ReviewField label="Qualifications" value={personal?.qualifications.join(", ")} /><div className="col-span-2 sm:col-span-4"><ReviewField label="Tutor bio" value={personal?.bio} /></div></div>
        </ReviewCard>

        <ReviewCard icon={FileCheck2} onEdit={() => onEdit("identity")} title="Identification verification">
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">{uk ? <><ReviewField label="Employer share code" value={identity?.employer_share_code} /><ReviewField label="DBS certificate number" value={identity?.dbs_certificate_number} /></> : null}<ReviewField label="Country" value={identity?.country ? titleCase(identity.country) : undefined} /><ReviewField label="ID type" value={identity?.id_type ? titleCase(identity.id_type) : undefined} /><ReviewField label="Verification status" value={identity?.status ? titleCase(identity.status) : undefined} /><ReviewField label="ID documents" value={review.documents.map((document) => document.file_name).join(", ")} /></div>
        </ReviewCard>

        <ReviewCard icon={CircleDollarSign} onEdit={() => onEdit("compensation")} title="Compensation details">
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">{uk ? <><ReviewField label="First name" value={compensation?.first_name} /><ReviewField label="Last name" value={compensation?.last_name} /><ReviewField label="Account number" value={compensation?.account_number} /><ReviewField label="Sort code" value={compensation?.sort_code} /></> : <><ReviewField label="Bank name" value={compensation?.bank_name} /><ReviewField label="Bank code" value={compensation?.bank_code} /><ReviewField label="Account number" value={compensation?.account_number} /><ReviewField label="Account holder name" value={compensation?.account_name} /></>}</div>
        </ReviewCard>

        <ReviewCard icon={MapPin} onEdit={() => onEdit("location")} title="Location access">
          <ReviewField label="Address" value={location?.address} />
          {mapUrl ? <div className="relative mt-2 aspect-[2.7/1] overflow-hidden rounded-lg border border-[#e1e5ed]"><Image alt="Confirmed tutor location" className="object-cover" fill sizes="640px" src={mapUrl} unoptimized /></div> : null}
        </ReviewCard>
      </div>
      <label className={`mt-3 flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-medium ${review.is_complete ? "border-[#dfe3ee] text-[#4f586f]" : "border-[#e5e7ed] text-[#9a9faf]"}`}><input checked={confirmed} className="h-4 w-4 accent-[#4f4ac8]" disabled={!review.is_complete} onChange={(event) => onConfirmedChange(event.target.checked)} type="checkbox" />I confirm that the information saved above is accurate.</label>
    </section>
  );
}
