"use client";

import { BookOpenCheck, FileCheck2, MapPin, Pencil, Settings2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { requestJson } from "../auth/request";
import { useSessionUser } from "../auth/authSession";
import { DashboardShell } from "../layout/DashboardShell";
import { StepTwoAddressConfirm } from "../signup/profile-setup/StepTwoAddressConfirm";
import { StepTwoLocationPrompt } from "../signup/profile-setup/StepTwoLocationPrompt";
import { Notice } from "../ui/Notice";
import { SelectMenu } from "../ui/SelectMenu";
import { TutorNavbar } from "./TutorNavbar";
import { useTutorLocationSetup, type TutorLocationSummary } from "./onboarding/useTutorLocationSetup";

type SettingsTab = "account" | "subjects" | "kyc";
type AccountDraft = {
  firstName: string;
  otherName: string;
  lastName: string;
  phone: string;
  email: string;
  occupation: string;
  qualification: string;
  dbsNumber: string;
};
type SubjectDraft = {
  department: string;
  subject: string;
  hourlyRate: string;
  sessionType: string;
  teachingLevel: string;
  sessionPeriod: string;
  availability: string[];
};
type KycDraft = { documentType: string; identityNumber: string };
type Category = { department: string; public_id?: string; subjects: Array<{ subject: string }> };
type CategoriesResponse = { data?: Category[]; message?: string };

const emptyDraft: AccountDraft = {
  firstName: "",
  otherName: "",
  lastName: "",
  phone: "",
  email: "",
  occupation: "",
  qualification: "",
  dbsNumber: "",
};
const emptySubjectDraft: SubjectDraft = { department: "", subject: "", hourlyRate: "", sessionType: "", teachingLevel: "", sessionPeriod: "", availability: [] };
const emptyKycDraft: KycDraft = { documentType: "", identityNumber: "" };
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const identityTypes = ["NIN", "Passport", "Voter's card", "Driver's licence"];

const fieldClassName = "mt-1.5 h-11 w-full rounded-lg border border-[#d8dde8] bg-white px-3.5 text-sm font-medium text-[#46506a] outline-none focus:border-[#6d63ee] focus:ring-2 focus:ring-[#6d63ee]/15 disabled:cursor-not-allowed disabled:bg-[#f5f7fa]";

export default function TutorSettingsPage() {
  const sessionUser = useSessionUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [editing, setEditing] = useState(false);
  const [accountDraft, setAccountDraft] = useState<AccountDraft>(emptyDraft);
  const [accountMessage, setAccountMessage] = useState("");
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSummary, setLocationSummary] = useState<TutorLocationSummary | null>(null);
  const [subjectEditing, setSubjectEditing] = useState(false);
  const [subjectDraft, setSubjectDraft] = useState<SubjectDraft>(emptySubjectDraft);
  const [subjectMessage, setSubjectMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [kycEditing, setKycEditing] = useState(false);
  const [kycDraft, setKycDraft] = useState<KycDraft>(emptyKycDraft);
  const [kycMessage, setKycMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const result = await requestJson("/api/categories", {
          signal: controller.signal,
        }) as CategoriesResponse;
        setCategories(result?.data ?? []);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setCategoriesError(caught instanceof Error ? caught.message : "Could not load departments and subjects.");
      } finally {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const fullName = [sessionUser?.firstName, sessionUser?.lastName].filter((value) => value?.trim()).join(" ");
  const initial = (fullName || sessionUser?.email || "T").charAt(0).toUpperCase();
  const openAccountEditor = () => {
    setAccountDraft({ ...emptyDraft, firstName: sessionUser?.firstName ?? "", lastName: sessionUser?.lastName ?? "", email: sessionUser?.email ?? "" });
    setAccountMessage("");
    setEditing(true);
  };
  const updateField = (field: keyof AccountDraft, value: string) => {
    setAccountMessage("");
    setAccountDraft((current) => ({ ...current, [field]: value }));
  };
  const selectedCategory = categories.find((category) => category.department === subjectDraft.department);
  const updateSubjectField = (field: Exclude<keyof SubjectDraft, "availability">, value: string) => {
    setSubjectMessage("");
    setSubjectDraft((current) => ({ ...current, [field]: value, ...(field === "department" ? { subject: "" } : {}) }));
  };
  const toggleAvailability = (day: string) => {
    setSubjectMessage("");
    setSubjectDraft((current) => ({ ...current, availability: current.availability.includes(day) ? current.availability.filter((item) => item !== day) : [...current.availability, day] }));
  };

  return (
    <DashboardShell contentClassName="!max-w-none !px-0" mainClassName="!p-0" navbar={<TutorNavbar active="Settings" />}>
      <div className="w-full">
        <div className="border-b border-[#e7eaf1] bg-[#f4f6fa] px-[var(--dashboard-gutter)] py-2.5">
          <nav aria-label="Tutor settings" className="navbar-scroll mx-auto flex w-full max-w-[74rem] justify-start gap-1.5 overflow-x-auto sm:justify-center">
            <SettingsTabButton active={activeTab === "account"} icon={<Settings2 />} label="Account settings" onClick={() => setActiveTab("account")} />
            <SettingsTabButton active={activeTab === "subjects"} icon={<BookOpenCheck />} label="Subjects" onClick={() => setActiveTab("subjects")} />
            <SettingsTabButton active={activeTab === "kyc"} icon={<FileCheck2 />} label="KYC" onClick={() => setActiveTab("kyc")} />
          </nav>
        </div>

        <div className="px-[var(--dashboard-gutter)] pb-6 pt-5 sm:pt-7">
          <div className="mx-auto w-full max-w-[74rem]">
          {activeTab === "account" ? (
            <div className={`mx-auto mt-6 grid items-start gap-5 ${editing ? "max-w-[68rem] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]" : "max-w-[44rem]"}`}>
              <div className="space-y-5">
                <section className="rounded-2xl border border-[#e5e8ef] bg-[#f7f7f8] p-3 shadow-[0_8px_22px_rgba(31,40,74,0.04)] sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-[#302d79]">Account details</h2>
                    <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primary-hover" onClick={openAccountEditor} type="button"><Pencil className="h-3.5 w-3.5" />Edit information</button>
                  </div>
                  <div className="rounded-xl border border-[#eceef3] bg-white p-4 sm:p-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#443dc3] text-2xl font-semibold text-white shadow-sm">{initial}</div>
                    <dl className="mt-6 grid grid-cols-1 gap-x-7 gap-y-5 sm:grid-cols-2">
                      <Detail label="Name" value={fullName} />
                      <Detail label="Phone number" value="" />
                      <Detail label="Email" value={sessionUser?.email ?? ""} />
                      <Detail label="Occupation" value="" />
                      <Detail label="Qualification" value="" />
                      <Detail label="DBS certificate number" value="" />
                    </dl>
                  </div>
                </section>

                <section className="rounded-2xl border border-[#e5e8ef] bg-[#f7f7f8] p-3 shadow-[0_8px_22px_rgba(31,40,74,0.04)] sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-[#302d79]">Location</h2>
                    <button className="min-h-9 rounded-full bg-brand-primary px-3.5 text-xs font-semibold text-white hover:bg-brand-primary-hover" onClick={() => setLocationOpen(true)} type="button">Update location</button>
                  </div>
                  <div className="rounded-xl border border-[#eceef3] bg-white p-4">
                    <h3 className="text-sm font-semibold text-[#31384d]">Location access</h3>
                    <p className="mt-1 text-xs text-[#6664ca]">Your location is used to match you with nearby students.</p>
                    {locationSummary ? (
                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#e0e4ec] px-3.5 py-3">
                        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0f1ff] text-[#4541c6]"><MapPin className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#303755]">{locationSummary.address.city || locationSummary.address.state}</span><span className="mt-0.5 block text-xs text-[#737c92]">{locationSummary.address.address}</span></span>
                        <span className="rounded-full border border-[#dfe3ec] px-2.5 py-1 text-[0.65rem] font-semibold text-[#5551c9]">Current</span>
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-[#dce1ea] px-3.5 py-4 text-sm text-[#7b8499]"><MapPin className="h-4 w-4 shrink-0" />Saved location details will appear here when the backend provides them.</div>
                    )}
                  </div>
                </section>
              </div>

              {editing ? (
                <AccountEditForm
                  draft={accountDraft}
                  message={accountMessage}
                  onCancel={() => { setEditing(false); setAccountMessage(""); }}
                  onChange={updateField}
                  onSubmit={() => setAccountMessage("The account settings update endpoint is not connected yet. No changes were saved.")}
                />
              ) : null}
            </div>
          ) : activeTab === "subjects" ? (
            <SubjectSettings
              categories={categories}
              categoriesError={categoriesError}
              categoriesLoading={categoriesLoading}
              draft={subjectDraft}
              editing={subjectEditing}
              message={subjectMessage}
              onCancel={() => { setSubjectDraft(emptySubjectDraft); setSubjectEditing(false); setSubjectMessage(""); }}
              onChange={updateSubjectField}
              onEdit={() => { setSubjectDraft(emptySubjectDraft); setSubjectEditing(true); setSubjectMessage(""); }}
              onSubmit={() => setSubjectMessage("The subject setup endpoint is not connected yet. No changes were saved.")}
              onToggleDay={toggleAvailability}
              subjectOptions={selectedCategory?.subjects.map((item) => item.subject) ?? []}
            />
          ) : (
            <KycSettings
              draft={kycDraft}
              editing={kycEditing}
              message={kycMessage}
              onCancel={() => { setKycDraft(emptyKycDraft); setKycEditing(false); setKycMessage(""); }}
              onChange={(field, value) => { setKycMessage(""); setKycDraft((current) => ({ ...current, [field]: value })); }}
              onEdit={() => { setKycDraft(emptyKycDraft); setKycEditing(true); setKycMessage(""); }}
              onSubmit={() => setKycMessage("The KYC update endpoint is not connected yet. No changes were saved.")}
            />
          )}
          </div>
        </div>
      </div>

      {locationOpen ? <LocationUpdateModal onClose={() => setLocationOpen(false)} onConfirmed={(summary) => { setLocationSummary(summary); setLocationOpen(false); }} /> : null}
    </DashboardShell>
  );
}

function SettingsTabButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button aria-current={active ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold ${active ? "border border-[#d9daf8] bg-[#eeefff] text-[#423dc0]" : "border border-transparent text-[#697188] hover:bg-[#f4f5f8]"}`} onClick={onClick} type="button"><span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span>{label}</button>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 border-b border-[#f0f2f6] pb-3"><dt className="text-[0.68rem] font-medium text-[#8b93a5]">{label}</dt><dd className={`mt-1 truncate text-xs font-semibold ${value ? "text-[#32394c]" : "text-[#9aa2b2]"}`}>{value || "Not provided"}</dd></div>;
}

function AccountEditForm({ draft, message, onCancel, onChange, onSubmit }: { draft: AccountDraft; message: string; onCancel: () => void; onChange: (field: keyof AccountDraft, value: string) => void; onSubmit: () => void }) {
  return <section className="rounded-2xl border border-[#e5e8ef] bg-white p-4 shadow-[0_8px_24px_rgba(31,40,74,0.06)] sm:p-5 lg:sticky lg:top-4"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#302d79]">Account details</h2><button aria-label="Close account editor" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#70798e] hover:bg-[#f3f4f8]" onClick={onCancel} type="button"><X className="h-4 w-4" /></button></div><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1"><SettingsField label="First name" onChange={(value) => onChange("firstName", value)} value={draft.firstName} /><SettingsField label="Other name" onChange={(value) => onChange("otherName", value)} value={draft.otherName} /><SettingsField label="Last name" onChange={(value) => onChange("lastName", value)} value={draft.lastName} /><SettingsField label="Phone number" onChange={(value) => onChange("phone", value)} type="tel" value={draft.phone} /><SettingsField disabled label="Email" onChange={(value) => onChange("email", value)} type="email" value={draft.email} /><SettingsField label="Occupation" onChange={(value) => onChange("occupation", value)} value={draft.occupation} /><SettingsField label="Qualification" onChange={(value) => onChange("qualification", value)} value={draft.qualification} /><SettingsField label="DBS certificate number" onChange={(value) => onChange("dbsNumber", value)} value={draft.dbsNumber} /></div>{message ? <SettingsMessage>{message}</SettingsMessage> : null}<div className="mt-5 flex flex-wrap justify-end gap-2"><button className="min-h-10 rounded-full border border-[#d8dde8] bg-white px-4 text-sm font-semibold text-[#555e73]" onClick={onCancel} type="button">Cancel</button><button className="min-h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white hover:bg-brand-primary-hover" onClick={onSubmit} type="button">Update details</button></div></section>;
}

function SettingsField({ disabled = false, label, onChange, type = "text", value }: { disabled?: boolean; label: string; onChange: (value: string) => void; type?: string; value: string }) {
  return <label><span className="text-xs font-semibold text-[#596277]">{label}</span><input className={fieldClassName} disabled={disabled} onChange={(event) => onChange(event.target.value)} type={type} value={value} /></label>;
}

function SubjectSettings({ categories, categoriesError, categoriesLoading, draft, editing, message, onCancel, onChange, onEdit, onSubmit, onToggleDay, subjectOptions }: { categories: Category[]; categoriesError: string; categoriesLoading: boolean; draft: SubjectDraft; editing: boolean; message: string; onCancel: () => void; onChange: (field: Exclude<keyof SubjectDraft, "availability">, value: string) => void; onEdit: () => void; onSubmit: () => void; onToggleDay: (day: string) => void; subjectOptions: string[] }) {
  const complete = Boolean(draft.department && draft.subject && Number(draft.hourlyRate) > 0 && draft.sessionType && draft.teachingLevel && draft.sessionPeriod && draft.availability.length);
  return <div className={`mx-auto mt-6 grid items-start gap-5 ${editing ? "max-w-[68rem] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]" : "max-w-[44rem]"}`}><SubjectSummaryCard onEdit={onEdit} />{editing ? <section className="rounded-2xl border border-[#e5e8ef] bg-white p-4 shadow-[0_8px_24px_rgba(31,40,74,0.06)] sm:p-5 lg:sticky lg:top-4"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#302d79]">Total subject setup</h2><button aria-label="Close subject editor" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#70798e] hover:bg-[#f3f4f8]" onClick={onCancel} type="button"><X className="h-4 w-4" /></button></div>{categoriesError ? <p className="mt-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium text-[#8b5a20]" role="alert">{categoriesError}</p> : null}<div className="mt-4 grid gap-3"><SettingsSelect disabled={categoriesLoading || Boolean(categoriesError)} label="Department" onChange={(value) => onChange("department", value)} options={categories.map((category) => category.department)} placeholder={categoriesLoading ? "Loading departments..." : "Select department"} value={draft.department} /><SettingsSelect disabled={!draft.department} label="Subject" onChange={(value) => onChange("subject", value)} options={subjectOptions} placeholder="Select subject" value={draft.subject} /><SettingsField label="Hourly rate" onChange={(value) => onChange("hourlyRate", value.replace(/[^0-9.]/g, ""))} type="text" value={draft.hourlyRate} /><SettingsSelect label="Session type" onChange={(value) => onChange("sessionType", value)} options={["Private", "Group"]} placeholder="Select session type" value={draft.sessionType} /><SettingsSelect label="Teaching level" onChange={(value) => onChange("teachingLevel", value)} options={["Beginner", "Intermediate", "Advanced"]} placeholder="Select teaching level" value={draft.teachingLevel} /><SettingsSelect label="Preferred session period" onChange={(value) => onChange("sessionPeriod", value)} options={["30 minutes", "1 hour", "90 minutes", "2 hours"]} placeholder="Select session period" value={draft.sessionPeriod} /><fieldset><legend className="text-xs font-semibold text-[#596277]">Availability</legend><div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-7">{weekDays.map((day) => { const selected = draft.availability.includes(day); return <button aria-pressed={selected} className={`min-h-9 rounded-lg border px-1 text-[0.65rem] font-semibold ${selected ? "border-[#168b78] bg-[#168b78] text-white" : "border-[#dfe3eb] bg-white text-[#737c91] hover:border-[#bfc5d3]"}`} key={day} onClick={() => onToggleDay(day)} type="button">{day.slice(0, 3)}</button>; })}</div></fieldset></div>{message ? <SettingsMessage>{message}</SettingsMessage> : null}<div className="mt-5 flex justify-end gap-2"><button className="min-h-10 rounded-full border border-[#d8dde8] bg-white px-4 text-sm font-semibold text-[#555e73]" onClick={onCancel} type="button">Cancel</button><button className="min-h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b8b6cf]" disabled={!complete} onClick={onSubmit} type="button">Update details</button></div></section> : null}</div>;
}

function SubjectSummaryCard({ onEdit }: { onEdit: () => void }) {
  return <section className="rounded-2xl border border-[#e5e8ef] bg-[#f7f7f8] p-3 shadow-[0_8px_22px_rgba(31,40,74,0.04)] sm:p-4"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-[#302d79]">Total subject setup</h2><button className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-primary px-3.5 text-xs font-semibold text-white" onClick={onEdit} type="button"><Pencil className="h-3.5 w-3.5" />Edit information</button></div><dl className="space-y-4 rounded-xl border border-[#eceef3] bg-white p-4 sm:p-5"><Detail label="Department" value="" /><Detail label="Subject" value="" /><Detail label="Hourly rate" value="" /><Detail label="Session type" value="" /><Detail label="Teaching level" value="" /><Detail label="Preferred session period" value="" /><Detail label="Availability" value="" /></dl></section>;
}

function KycSettings({ draft, editing, message, onCancel, onChange, onEdit, onSubmit }: { draft: KycDraft; editing: boolean; message: string; onCancel: () => void; onChange: (field: keyof KycDraft, value: string) => void; onEdit: () => void; onSubmit: () => void }) {
  const complete = Boolean(draft.documentType && draft.identityNumber.trim());
  return <div className={`mx-auto mt-6 grid items-start gap-5 ${editing ? "max-w-[68rem] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]" : "max-w-[44rem]"}`}><section className="rounded-2xl border border-[#e5e8ef] bg-[#f7f7f8] p-3 shadow-[0_8px_22px_rgba(31,40,74,0.04)] sm:p-4"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-[#302d79]">KYC</h2><button className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-primary px-3.5 text-xs font-semibold text-white" onClick={onEdit} type="button"><Pencil className="h-3.5 w-3.5" />Edit information</button></div><div className="rounded-xl border border-[#eceef3] bg-white p-4 sm:p-5"><h3 className="text-sm font-semibold text-[#30374a]">Identity verification</h3><p className="mt-1 text-xs leading-relaxed text-[#737c90]">Complete your Know Your Customer (KYC) verification to proceed.</p><dl className="mt-6 space-y-4"><Detail label="Document type" value="" /><Detail label="Identity number" value="" /></dl></div></section>{editing ? <section className="rounded-2xl border border-[#e5e8ef] bg-white p-4 shadow-[0_8px_24px_rgba(31,40,74,0.06)] sm:p-5 lg:sticky lg:top-4"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#302d79]">KYC</h2><button aria-label="Close KYC editor" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#70798e] hover:bg-[#f3f4f8]" onClick={onCancel} type="button"><X className="h-4 w-4" /></button></div><div className="mt-4 grid gap-3"><SettingsSelect label="Document type" onChange={(value) => onChange("documentType", value)} options={identityTypes} placeholder="Select document type" value={draft.documentType} /><SettingsField label="Identity number" onChange={(value) => onChange("identityNumber", value)} value={draft.identityNumber} /></div>{message ? <SettingsMessage>{message}</SettingsMessage> : null}<div className="mt-5 flex justify-end gap-2"><button className="min-h-10 rounded-full border border-[#d8dde8] bg-white px-4 text-sm font-semibold text-[#555e73]" onClick={onCancel} type="button">Cancel</button><button className="min-h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b8b6cf]" disabled={!complete} onClick={onSubmit} type="button">Update details</button></div></section> : null}</div>;
}

function SettingsSelect({ disabled = false, label, onChange, options, placeholder, value }: { disabled?: boolean; label: string; onChange: (value: string) => void; options: string[]; placeholder: string; value: string }) {
  return <div><span className="text-xs font-semibold text-[#596277]">{label}</span><SelectMenu ariaLabel={label} className="mt-1.5" disabled={disabled} onChange={onChange} options={options.map((option) => ({ label: option, value: option }))} placeholder={placeholder} value={value} /></div>;
}

function SettingsMessage({ children }: { children: ReactNode }) {
  return <Notice className="mt-4 text-xs">{children}</Notice>;
}

function LocationUpdateModal({ onClose, onConfirmed }: { onClose: () => void; onConfirmed: (summary: TutorLocationSummary) => void }) {
  const location = useTutorLocationSetup((summary) => { if (summary) onConfirmed(summary); });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10152f]/45 px-3 py-4" onClick={onClose}><section aria-labelledby="location-settings-title" aria-modal="true" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[48rem] flex-col overflow-hidden rounded-2xl border border-[#e1e5ed] bg-white shadow-[var(--ui-shadow-overlay)]" onClick={(event) => event.stopPropagation()} role="dialog"><header className="flex shrink-0 items-center justify-between border-b border-[#e7eaf1] px-4 py-3 sm:px-5"><div><h2 className="text-base font-bold text-[#282f42]" id="location-settings-title">Update location</h2><p className="mt-0.5 text-xs text-[#858da0]">Confirm a precise tutoring location.</p></div><button aria-label="Close location update" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#697188] hover:bg-[#f3f4f8]" onClick={onClose} type="button"><X className="h-4 w-4" /></button></header><div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">{location.view === "prompt" ? <StepTwoLocationPrompt locationError={location.error} onAllowLocation={location.requestCurrentLocation} onEnterAddress={() => location.openSearch()} requestingLocation={location.requestingLocation} variant="tutor" /> : <StepTwoAddressConfirm addressForm={location.address} coordinates={location.coordinates} locationError={location.error} mode={location.view} onAddressFieldChange={location.changeAddress} onMapLocationChange={location.moveMap} onPlaceQueryChange={location.changeQuery} onSelectPlace={location.selectPlace} placePredictions={location.predictions} placeQuery={location.query} requestingPlaceSearch={location.requestingSearch} resolvingMapLocation={location.resolvingMap} />}</div>{location.view !== "prompt" ? <footer className="flex shrink-0 justify-end gap-2 border-t border-[#e7eaf1] px-4 py-3 sm:px-5"><button className="min-h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#555e73]" onClick={location.goBack} type="button">Back</button>{location.view !== "search" ? <button className="min-h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:bg-[#b8b6cf]" disabled={!location.complete || location.saving || location.resolvingMap} onClick={() => void location.confirm()} type="button">{location.saving ? "Saving..." : "Confirm location"}</button> : null}</footer> : null}</section></div>;
}
