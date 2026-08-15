"use client";

import { CircleDollarSign, FileCheck2, MapPin, Pencil, UserRound } from "lucide-react";
import Image from "next/image";

import type { TutorLocationSummary } from "./useTutorLocationSetup";

type ReviewPersonal = {
  firstName: string;
  lastName: string;
  otherName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  country: "NG" | "GB" | "";
  occupation: string;
  qualification: string;
  experience: string;
};

type ReviewIdentity = { shareCode: string; dbsNumber: string; idType: string; file: File | null };
type ReviewCompensation = { bankName: string; accountName: string; firstName: string; lastName: string; accountNumber: string; sortCode: string };

function ReviewField({ label, value }: { label: string; value: string }) {
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

export function TutorReviewStep({
  compensation,
  confirmed,
  identity,
  location,
  onConfirmedChange,
  onEdit,
  personal,
}: {
  compensation: ReviewCompensation;
  confirmed: boolean;
  identity: ReviewIdentity;
  location: TutorLocationSummary | null;
  onConfirmedChange: (value: boolean) => void;
  onEdit: (section: "personal" | "identity" | "compensation" | "location") => void;
  personal: ReviewPersonal;
}) {
  const mapUrl = location?.coordinates
    ? `/api/places/map?latitude=${encodeURIComponent(location.coordinates.latitude)}&longitude=${encodeURIComponent(location.coordinates.longitude)}`
    : "";
  const uk = personal.country === "GB";

  return (
    <section className="mx-auto w-full max-w-[40rem] pb-4">
      <div className="mb-4 text-center"><h1 className="text-2xl font-bold text-[#1d2331]">Hey {personal.firstName || "there"}!</h1><p className="mt-1 text-sm font-medium text-[#8a93a7]">Please confirm that all the information provided is correct.</p></div>
      <div className="space-y-3">
        <ReviewCard icon={UserRound} onEdit={() => onEdit("personal")} title="Personal information">
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 sm:grid-cols-4"><ReviewField label="First name" value={personal.firstName} /><ReviewField label="Last name" value={personal.lastName} /><ReviewField label="Other name" value={personal.otherName} /><ReviewField label="Date of birth" value={personal.dateOfBirth} /><ReviewField label="Email" value={personal.email} /><ReviewField label="Phone number" value={personal.phone} /><ReviewField label="Operating country" value={uk ? "United Kingdom" : "Nigeria"} /><ReviewField label="Occupation" value={personal.occupation} /><ReviewField label="Qualification" value={personal.qualification} /><div className="col-span-2 sm:col-span-4"><ReviewField label="Tutoring experience" value={personal.experience} /></div></div>
        </ReviewCard>

        <ReviewCard icon={FileCheck2} onEdit={() => onEdit("identity")} title="Identification verification">
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">{uk ? <><ReviewField label="Employer share code" value={identity.shareCode} /><ReviewField label="DBS certificate number" value={identity.dbsNumber} /></> : null}<ReviewField label="ID type" value={identity.idType} /><ReviewField label="ID document" value={identity.file?.name ?? ""} /></div>
        </ReviewCard>

        <ReviewCard icon={CircleDollarSign} onEdit={() => onEdit("compensation")} title="Compensation details">
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">{uk ? <><ReviewField label="First name" value={compensation.firstName} /><ReviewField label="Last name" value={compensation.lastName} /><ReviewField label="Account number" value={compensation.accountNumber} /><ReviewField label="Sort code" value={compensation.sortCode} /></> : <><ReviewField label="Bank name" value={compensation.bankName} /><ReviewField label="Account number" value={compensation.accountNumber} /><div className="col-span-2"><ReviewField label="Account holder name" value={compensation.accountName} /></div></>}</div>
        </ReviewCard>

        <ReviewCard icon={MapPin} onEdit={() => onEdit("location")} title="Location access">
          <ReviewField label="Address" value={location?.address.address ?? "Not provided"} />
          {mapUrl ? <div className="relative mt-2 aspect-[2.7/1] overflow-hidden rounded-lg border border-[#e1e5ed]"><Image alt="Confirmed tutor location" className="object-cover" fill sizes="640px" src={mapUrl} unoptimized /></div> : null}
        </ReviewCard>
      </div>
      <label className="mt-3 flex items-center gap-2 rounded-lg border border-[#dfe3ee] bg-white px-3 py-2 text-xs font-medium text-[#4f586f]"><input checked={confirmed} className="h-4 w-4 accent-[#4f4ac8]" onChange={(event) => onConfirmedChange(event.target.checked)} type="checkbox" />I confirm that the information I&apos;ve provided is accurate.</label>
    </section>
  );
}
