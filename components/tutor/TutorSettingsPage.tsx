"use client";

import { useEffect, useState, type ReactNode } from "react";
import { BookOpenCheck, FileCheck2, MapPin, Pencil, Plus, Settings2, X } from "lucide-react";

import { setAuthSession, useSessionUser } from "../auth/authSession";
import { DashboardShell } from "../layout/DashboardShell";
import { StepTwoAddressConfirm } from "../signup/profile-setup/StepTwoAddressConfirm";
import { StepTwoLocationPrompt } from "../signup/profile-setup/StepTwoLocationPrompt";
import { Avatar } from "../ui/Avatar";
import { Notice } from "../ui/Notice";
import { SelectMenu, type SelectMenuOption } from "../ui/SelectMenu";
import { TutorNavbar } from "./TutorNavbar";
import { useTutorLocationSetup, type TutorLocationSummary } from "./onboarding/useTutorLocationSetup";
import {
  createTutorSubject,
  getTutorAccount,
  getTutorKyc,
  getTutorSubjects,
  updateTutorAccount,
  updateTutorKyc,
  updateTutorSubject,
  type TutorAccount,
  type TutorKyc,
  type TutorSubject,
  type TutorSubjectInput,
} from "./tutorSettings";

type SettingsTab = "account" | "subjects" | "kyc";
type AccountDraft = { dbsNumber: string; email: string; firstName: string; lastName: string; middleName: string; occupation: string; phone: string; qualifications: string };
type SubjectDraft = { availability: string[]; department: string; level: string; period: string; rateHourly: string; sessionType: string; subject: string };
type KycDraft = { documents: File[]; idNumber: string; idType: string };
type Category = { department: string; subjects: Array<{ subject: string }> };

const emptyAccount: AccountDraft = { dbsNumber: "", email: "", firstName: "", lastName: "", middleName: "", occupation: "", phone: "", qualifications: "" };
const emptySubject: SubjectDraft = { availability: [], department: "", level: "", period: "", rateHourly: "", sessionType: "", subject: "" };
const emptyKyc: KycDraft = { documents: [], idNumber: "", idType: "" };
const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const sessionTypes: SelectMenuOption[] = [{ label: "Private", value: "private" }, { label: "Online", value: "online" }];
const levels: SelectMenuOption[] = [{ label: "Beginner", value: "beginner" }, { label: "Intermediate", value: "intermediate" }, { label: "Advanced", value: "advanced" }, { label: "Any level", value: "any_level" }];
const periods: SelectMenuOption[] = [1, 2, 3, 4].map((hours) => ({ label: `${hours} hour${hours === 1 ? "" : "s"}`, value: String(hours) }));
const identityTypes: SelectMenuOption[] = [{ label: "NIN", value: "national_id" }, { label: "Passport", value: "passport" }, { label: "Voter's card", value: "voters_card" }, { label: "Driver's licence", value: "drivers_license" }];
const fieldClassName = "mt-1.5 h-11 w-full rounded-lg border border-[#d8dde8] bg-white px-3.5 text-sm font-medium text-[#46506a] outline-none focus:border-[#6d63ee] disabled:cursor-not-allowed disabled:bg-[#f5f7fa]";

function words(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function TutorSettingsPage({ initialTab = "account" }: { initialTab?: SettingsTab }) {
  const sessionUser = useSessionUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [account, setAccount] = useState<TutorAccount | null>(null);
  const [subjects, setSubjects] = useState<TutorSubject[]>([]);
  const [kyc, setKyc] = useState<TutorKyc | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accountError, setAccountError] = useState("");
  const [subjectsError, setSubjectsError] = useState("");
  const [kycError, setKycError] = useState("");
  const [accountLoading, setAccountLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [kycLoading, setKycLoading] = useState(true);
  const [accountDraft, setAccountDraft] = useState<AccountDraft>(emptyAccount);
  const [subjectDraft, setSubjectDraft] = useState<SubjectDraft>(emptySubject);
  const [kycDraft, setKycDraft] = useState<KycDraft>(emptyKyc);
  const [accountEditing, setAccountEditing] = useState(false);
  const [subjectEditorOpen, setSubjectEditorOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState("");
  const [kycEditing, setKycEditing] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadSubjects = async (signal?: AbortSignal) => setSubjects(await getTutorSubjects(signal));
  const loadKyc = async (signal?: AbortSignal) => setKyc(await getTutorKyc(signal));

  useEffect(() => {
    const controller = new AbortController();
    void getTutorAccount(controller.signal).then(setAccount).catch((error: unknown) => {
      if (!controller.signal.aborted) setAccountError(error instanceof Error ? error.message : "Account settings could not be loaded.");
    }).finally(() => { if (!controller.signal.aborted) setAccountLoading(false); });
    void getTutorSubjects(controller.signal).then(setSubjects).catch((error: unknown) => {
      if (!controller.signal.aborted) setSubjectsError(error instanceof Error ? error.message : "Subjects could not be loaded.");
    }).finally(() => { if (!controller.signal.aborted) setSubjectsLoading(false); });
    void getTutorKyc(controller.signal).then(setKyc).catch((error: unknown) => {
      if (!controller.signal.aborted) setKycError(error instanceof Error ? error.message : "KYC could not be loaded.");
    }).finally(() => { if (!controller.signal.aborted) setKycLoading(false); });
    fetch("/api/categories", { cache: "no-store", signal: controller.signal }).then((response) => response.json()).then((payload) => setCategories(Array.isArray(payload?.data) ? payload.data : [])).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const openAccount = () => {
    setMessage("");
    setAccountDraft(account ? { dbsNumber: "", email: account.email, firstName: account.first_name, lastName: account.last_name, middleName: "", occupation: account.occupation, phone: account.phone_number, qualifications: account.qualifications.join(", ") } : emptyAccount);
    setAccountEditing(true);
  };

  const saveAccount = async () => {
    setSaving(true); setMessage("");
    try {
      await updateTutorAccount({ first_name: accountDraft.firstName.trim(), last_name: accountDraft.lastName.trim(), middle_name: accountDraft.middleName.trim(), email: accountDraft.email.trim(), occupation: accountDraft.occupation.trim(), qualifications: accountDraft.qualifications.split(",").map((item) => item.trim()).filter(Boolean), ...(accountDraft.dbsNumber.trim() ? { dbs_certificate_number: accountDraft.dbsNumber.trim() } : {}) });
      const updated = await getTutorAccount();
      setAccount(updated);
      setAuthSession({ email: updated.email, first_name: updated.first_name, last_name: updated.last_name, profile_photo: updated.profile_photo, public_id: sessionUser?.publicId, role: sessionUser?.role || undefined });
      setAccountEditing(false); setMessage("Account details updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Account details could not be updated."); }
    finally { setSaving(false); }
  };

  const openNewSubject = () => { setSubjectDraft(emptySubject); setEditingSubjectId(""); setMessage(""); setSubjectEditorOpen(true); };
  const openSubject = (subject: TutorSubject) => {
    if (!subject.public_id) return;
    setSubjectDraft({ availability: subject.availability.map((item) => item.day), department: subject.department, level: subject.level, period: String(subject.period), rateHourly: String(subject.rate_hourly), sessionType: subject.session_type, subject: subject.subject });
    setEditingSubjectId(subject.public_id); setMessage(""); setSubjectEditorOpen(true);
  };
  const saveSubject = async () => {
    const input: TutorSubjectInput = { days: subjectDraft.availability, department: subjectDraft.department, level: subjectDraft.level, period: Number(subjectDraft.period), rate_hourly: Number(subjectDraft.rateHourly), session_type: subjectDraft.sessionType, subject: subjectDraft.subject };
    setSaving(true); setMessage("");
    try {
      if (editingSubjectId) await updateTutorSubject(editingSubjectId, input); else await createTutorSubject(input);
      await loadSubjects(); setSubjectEditorOpen(false); setMessage(editingSubjectId ? "Subject updated." : "Subject added.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "The subject could not be saved."); }
    finally { setSaving(false); }
  };

  const openKyc = () => { setKycDraft({ documents: [], idNumber: kyc?.id_number ?? "", idType: kyc?.id_type ?? "" }); setMessage(""); setKycEditing(true); };
  const saveKyc = async () => {
    setSaving(true); setMessage("");
    try { await updateTutorKyc(kycDraft); await loadKyc(); setKycEditing(false); setMessage("Identity verification updated and sent for review."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Identity verification could not be updated."); }
    finally { setSaving(false); }
  };

  return (
    <DashboardShell contentClassName="!max-w-none !px-0" mainClassName="!p-0" navbar={<TutorNavbar active="Settings" />}>
      <div className="w-full">
        <div className="border-b border-[#e7eaf1] bg-[#f4f6fa] px-[var(--dashboard-gutter)] py-2.5"><nav aria-label="Tutor settings" className="navbar-scroll mx-auto flex w-full max-w-[74rem] justify-start gap-1.5 overflow-x-auto sm:justify-center"><Tab active={activeTab === "account"} icon={<Settings2 />} label="Account settings" onClick={() => { setActiveTab("account"); setMessage(""); }} /><Tab active={activeTab === "subjects"} icon={<BookOpenCheck />} label="Subjects" onClick={() => { setActiveTab("subjects"); setMessage(""); }} /><Tab active={activeTab === "kyc"} icon={<FileCheck2 />} label="KYC" onClick={() => { setActiveTab("kyc"); setMessage(""); }} /></nav></div>
        <div className="px-[var(--dashboard-gutter)] py-6"><div className="mx-auto w-full max-w-[74rem]">
          {message ? <Notice className="mx-auto mb-4 max-w-[68rem] text-sm" tone={message.includes("could not") ? "error" : "success"}>{message}</Notice> : null}
          {activeTab === "account" ? <AccountPanel account={account} draft={accountDraft} editing={accountEditing} error={accountError} loading={accountLoading} onCancel={() => setAccountEditing(false)} onChange={(field, value) => setAccountDraft((current) => ({ ...current, [field]: value }))} onEdit={openAccount} onLocation={() => setLocationOpen(true)} onSave={() => void saveAccount()} saving={saving} /> : null}
          {activeTab === "subjects" ? <SubjectsPanel categories={categories} draft={subjectDraft} editingId={editingSubjectId} editorOpen={subjectEditorOpen} error={subjectsError} loading={subjectsLoading} onCancel={() => setSubjectEditorOpen(false)} onChange={(field, value) => setSubjectDraft((current) => ({ ...current, [field]: value, ...(field === "department" ? { subject: "" } : {}) }))} onEdit={openSubject} onNew={openNewSubject} onSave={() => void saveSubject()} onToggleDay={(day) => setSubjectDraft((current) => ({ ...current, availability: current.availability.includes(day) ? current.availability.filter((item) => item !== day) : [...current.availability, day] }))} saving={saving} subjects={subjects} /> : null}
          {activeTab === "kyc" ? <KycPanel draft={kycDraft} editing={kycEditing} error={kycError} kyc={kyc} loading={kycLoading} onCancel={() => setKycEditing(false)} onChange={(field, value) => setKycDraft((current) => ({ ...current, [field]: value }))} onEdit={openKyc} onFiles={(documents) => setKycDraft((current) => ({ ...current, documents }))} onSave={() => void saveKyc()} saving={saving} /> : null}
        </div></div>
      </div>
      {locationOpen ? <LocationUpdateModal onClose={() => setLocationOpen(false)} onConfirmed={(summary) => { setAccount((current) => current ? { ...current, location: { address: summary.address.address, latitude: summary.coordinates?.latitude ?? current.location?.latitude ?? 0, longitude: summary.coordinates?.longitude ?? current.location?.longitude ?? 0 } } : current); setLocationOpen(false); }} /> : null}
    </DashboardShell>
  );
}

function AccountPanel({ account, draft, editing, error, loading, onCancel, onChange, onEdit, onLocation, onSave, saving }: { account: TutorAccount | null; draft: AccountDraft; editing: boolean; error: string; loading: boolean; onCancel: () => void; onChange: (field: keyof AccountDraft, value: string) => void; onEdit: () => void; onLocation: () => void; onSave: () => void; saving: boolean }) {
  if (loading) return <Loading text="Loading account settings..." />;
  if (error) return <Notice tone="error">{error}</Notice>;
  const name = account ? `${account.first_name} ${account.last_name}`.trim() : "";
  return <div className={`mx-auto grid max-w-[68rem] items-start gap-5 ${editing ? "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]" : "max-w-[44rem]"}`}><div className="space-y-5"><Card title="Account details" action={<EditButton onClick={onEdit} />}><div className="flex items-center gap-3"><Avatar alt={name} className="h-16 w-16 overflow-hidden rounded-xl bg-brand-primary text-xl text-white" initials={name.slice(0, 1)} src={account?.profile_photo || undefined} /><div><p className="font-semibold text-ui-title">{name || "Not provided"}</p><p className="text-sm text-ui-body">{account?.email}</p></div></div><dl className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label="Phone number" value={account?.phone_number} /><Detail label="Occupation" value={account?.occupation} /><Detail label="Qualifications" value={account?.qualifications.join(", ")} /></dl></Card><Card title="Location" action={<button className="min-h-9 rounded-full bg-brand-primary px-3.5 text-xs font-semibold text-white" onClick={onLocation} type="button">Update location</button>}>{account?.location ? <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-brand-accent" /><div><p className="text-sm font-semibold text-ui-title">{account.location.address}</p><p className="mt-1 text-xs text-ui-body">{account.location.latitude}, {account.location.longitude}</p></div></div> : <p className="text-sm text-ui-body">No saved location.</p>}</Card></div>{editing ? <Editor title="Account details" onCancel={onCancel} onSave={onSave} saving={saving}><Field label="First name" onChange={(value) => onChange("firstName", value)} value={draft.firstName} /><Field label="Middle name" onChange={(value) => onChange("middleName", value)} value={draft.middleName} /><Field label="Last name" onChange={(value) => onChange("lastName", value)} value={draft.lastName} /><Field label="Email" onChange={(value) => onChange("email", value)} type="email" value={draft.email} /><Field disabled label="Phone number" onChange={(value) => onChange("phone", value)} type="tel" value={draft.phone} /><Field label="Occupation" onChange={(value) => onChange("occupation", value)} value={draft.occupation} /><Field label="Qualifications" onChange={(value) => onChange("qualifications", value)} value={draft.qualifications} /><Field label="DBS certificate number (UK only)" onChange={(value) => onChange("dbsNumber", value)} value={draft.dbsNumber} /></Editor> : null}</div>;
}

function SubjectsPanel({ categories, draft, editingId, editorOpen, error, loading, onCancel, onChange, onEdit, onNew, onSave, onToggleDay, saving, subjects }: { categories: Category[]; draft: SubjectDraft; editingId: string; editorOpen: boolean; error: string; loading: boolean; onCancel: () => void; onChange: (field: Exclude<keyof SubjectDraft, "availability">, value: string) => void; onEdit: (subject: TutorSubject) => void; onNew: () => void; onSave: () => void; onToggleDay: (day: string) => void; saving: boolean; subjects: TutorSubject[] }) {
  const subjectOptions = categories.find((category) => category.department === draft.department)?.subjects.map((item) => ({ label: item.subject, value: item.subject })) ?? [];
  const complete = Boolean(draft.department && draft.subject && Number(draft.rateHourly) > 0 && draft.sessionType && draft.level && Number(draft.period) > 0 && draft.availability.length);
  return <div className={`mx-auto grid max-w-[68rem] items-start gap-5 ${editorOpen ? "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]" : "max-w-[50rem]"}`}><section><div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-semibold text-ui-title">Subjects</h2><p className="text-sm text-ui-body">Manage what you teach and when you are available.</p></div><button className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white" onClick={onNew} type="button"><Plus className="h-4 w-4" />Add subject</button></div>{loading ? <Loading text="Loading subjects..." /> : error ? <Notice tone="error">{error}</Notice> : subjects.length ? <div className="grid gap-3">{subjects.map((subject, index) => <Card action={subject.public_id ? <EditButton onClick={() => onEdit(subject)} /> : undefined} key={subject.public_id ?? `${subject.department}-${subject.subject}-${index}`} title={subject.subject}><dl className="grid gap-3 sm:grid-cols-3"><Detail label="Department" value={subject.department} /><Detail label="Rate per hour" value={subject.rate_hourly.toLocaleString()} /><Detail label="Session type" value={words(subject.session_type)} /><Detail label="Level" value={words(subject.level)} /><Detail label="Session length" value={`${subject.period} hour${subject.period === 1 ? "" : "s"}`} /><Detail label="Availability" value={subject.availability.map((item) => words(item.day)).join(", ")} /></dl>{!subject.public_id ? <p className="mt-3 text-xs text-[#9a7314]">This subject cannot be edited because its public ID was not returned.</p> : null}</Card>)}</div> : <Card title="No subjects"><p className="text-sm text-ui-body">Add your first subject to begin receiving relevant booking requests.</p></Card>}</section>{editorOpen ? <Editor disabled={!complete} title={editingId ? "Edit subject" : "Add subject"} onCancel={onCancel} onSave={onSave} saving={saving}><SelectField label="Department" onChange={(value) => onChange("department", value)} options={categories.map((category) => ({ label: category.department, value: category.department }))} placeholder="Select department" value={draft.department} /><SelectField label="Subject" onChange={(value) => onChange("subject", value)} options={subjectOptions} placeholder="Select subject" value={draft.subject} /><Field label="Hourly rate" onChange={(value) => onChange("rateHourly", value.replace(/[^0-9.]/g, ""))} value={draft.rateHourly} /><SelectField label="Session type" onChange={(value) => onChange("sessionType", value)} options={sessionTypes} placeholder="Select session type" value={draft.sessionType} /><SelectField label="Teaching level" onChange={(value) => onChange("level", value)} options={levels} placeholder="Select level" value={draft.level} /><SelectField label="Session length" onChange={(value) => onChange("period", value)} options={periods} placeholder="Select hours" value={draft.period} /><fieldset><legend className="text-xs font-semibold text-[#596277]">Availability</legend><div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-7 lg:grid-cols-4">{weekDays.map((day) => <button aria-pressed={draft.availability.includes(day)} className={`min-h-9 rounded-lg border px-1 text-xs font-semibold ${draft.availability.includes(day) ? "border-[#168b78] bg-[#168b78] text-white" : "border-[#dfe3eb] bg-white text-[#737c91]"}`} key={day} onClick={() => onToggleDay(day)} type="button">{day.slice(0, 3)}</button>)}</div></fieldset></Editor> : null}</div>;
}

function KycPanel({ draft, editing, error, kyc, loading, onCancel, onChange, onEdit, onFiles, onSave, saving }: { draft: KycDraft; editing: boolean; error: string; kyc: TutorKyc | null; loading: boolean; onCancel: () => void; onChange: (field: "idNumber" | "idType", value: string) => void; onEdit: () => void; onFiles: (files: File[]) => void; onSave: () => void; saving: boolean }) {
  const complete = Boolean(draft.idType || draft.idNumber.trim() || draft.documents.length);
  if (loading) return <Loading text="Loading identity verification..." />;
  if (error) return <Notice tone="error">{error}</Notice>;
  return <div className={`mx-auto grid max-w-[68rem] items-start gap-5 ${editing ? "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]" : "max-w-[44rem]"}`}><Card action={<EditButton label={kyc ? "Update information" : "Add information"} onClick={onEdit} />} title="Identity verification">{kyc ? <dl className="grid gap-4 sm:grid-cols-2"><Detail label="Country" value={words(kyc.country)} /><Detail label="Document type" value={words(kyc.id_type)} /><Detail label="Identity number" value={kyc.id_number} /><Detail label="Status" value={words(kyc.status)} /><Detail label="Documents" value={`${kyc.document_urls.length} uploaded`} /></dl> : <p className="text-sm text-ui-body">No identity verification has been submitted yet.</p>}{kyc?.document_urls.length ? <div className="mt-4 flex flex-wrap gap-2">{kyc.document_urls.map((url, index) => <a className="text-xs font-semibold text-brand-accent underline" href={url} key={url} rel="noreferrer" target="_blank">Document {index + 1}</a>)}</div> : null}</Card>{editing ? <Editor disabled={!complete} title="Identity verification" onCancel={onCancel} onSave={onSave} saving={saving}><SelectField label="Document type" onChange={(value) => onChange("idType", value)} options={identityTypes} placeholder="Select document type" value={draft.idType} /><Field label="Identity number" onChange={(value) => onChange("idNumber", value)} value={draft.idNumber} /><label className="text-xs font-semibold text-[#596277]">Additional documents<input accept=".jpg,.jpeg,.png,.webp,.pdf" className="mt-1.5 block w-full text-sm font-normal text-ui-body file:mr-3 file:rounded-full file:border-0 file:bg-brand-primary-soft file:px-4 file:py-2 file:font-semibold file:text-brand-accent" multiple onChange={(event) => onFiles(Array.from(event.target.files ?? []))} type="file" /></label>{draft.documents.length ? <p className="text-xs text-ui-body">{draft.documents.map((file) => file.name).join(", ")}</p> : null}</Editor> : null}</div>;
}

function Card({ action, children, title }: { action?: ReactNode; children: ReactNode; title: string }) { return <section className="rounded-2xl border border-[#e5e8ef] bg-white p-4 shadow-[0_8px_22px_rgba(31,40,74,0.04)] sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-[#302d79]">{title}</h2>{action}</div>{children}</section>; }
function EditButton({ label = "Edit information", onClick }: { label?: string; onClick: () => void }) { return <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-primary px-3.5 text-xs font-semibold text-white" onClick={onClick} type="button"><Pencil className="h-3.5 w-3.5" />{label}</button>; }
function Detail({ label, value }: { label: string; value?: string }) { return <div className="min-w-0 border-b border-[#f0f2f6] pb-3"><dt className="text-xs font-medium text-[#8b93a5]">{label}</dt><dd className={`mt-1 break-words text-sm font-semibold ${value ? "text-[#32394c]" : "text-[#9aa2b2]"}`}>{value || "Not provided"}</dd></div>; }
function Field({ disabled = false, label, onChange, type = "text", value }: { disabled?: boolean; label: string; onChange: (value: string) => void; type?: string; value: string }) { return <label className="text-xs font-semibold text-[#596277]">{label}<input className={fieldClassName} disabled={disabled} onChange={(event) => onChange(event.target.value)} type={type} value={value} /></label>; }
function SelectField({ label, onChange, options, placeholder, value }: { label: string; onChange: (value: string) => void; options: SelectMenuOption[]; placeholder: string; value: string }) { return <label className="text-xs font-semibold text-[#596277]">{label}<SelectMenu ariaLabel={label} className="mt-1.5" onChange={onChange} options={options} placeholder={placeholder} value={value} /></label>; }
function Editor({ children, disabled = false, onCancel, onSave, saving, title }: { children: ReactNode; disabled?: boolean; onCancel: () => void; onSave: () => void; saving: boolean; title: string }) { return <section className="rounded-2xl border border-[#e5e8ef] bg-white p-4 shadow-[0_8px_24px_rgba(31,40,74,0.06)] sm:p-5 lg:sticky lg:top-4"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#302d79]">{title}</h2><button aria-label={`Close ${title}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#70798e] hover:bg-[#f3f4f8]" onClick={onCancel} type="button"><X className="h-4 w-4" /></button></div><div className="mt-4 grid gap-3">{children}</div><div className="mt-5 flex justify-end gap-2"><button className="min-h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#555e73]" disabled={saving} onClick={onCancel} type="button">Cancel</button><button className="min-h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:opacity-50" disabled={disabled || saving} onClick={onSave} type="button">{saving ? "Saving..." : "Save changes"}</button></div></section>; }
function Loading({ text }: { text: string }) { return <div className="mx-auto flex min-h-48 max-w-[44rem] items-center justify-center rounded-2xl border border-[#e5e8ef] bg-white text-sm text-ui-body">{text}</div>; }
function Tab({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) { return <button aria-current={active ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold ${active ? "border border-[#d9daf8] bg-[#eeefff] text-[#423dc0]" : "border border-transparent text-[#697188] hover:bg-[#f4f5f8]"}`} onClick={onClick} type="button"><span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span>{label}</button>; }

function LocationUpdateModal({ onClose, onConfirmed }: { onClose: () => void; onConfirmed: (summary: TutorLocationSummary) => void }) {
  const location = useTutorLocationSetup((summary) => { if (summary) onConfirmed(summary); });
  useEffect(() => { const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previousOverflow; }; }, []);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10152f]/45 px-3 py-4" onClick={onClose}><section aria-labelledby="location-settings-title" aria-modal="true" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[48rem] flex-col overflow-hidden rounded-2xl border border-[#e1e5ed] bg-white shadow-[var(--ui-shadow-overlay)]" onClick={(event) => event.stopPropagation()} role="dialog"><header className="flex shrink-0 items-center justify-between border-b border-[#e7eaf1] px-4 py-3 sm:px-5"><div><h2 className="text-base font-bold text-[#282f42]" id="location-settings-title">Update location</h2><p className="mt-0.5 text-xs text-[#858da0]">Confirm a precise tutoring location.</p></div><button aria-label="Close location update" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#697188] hover:bg-[#f3f4f8]" onClick={onClose} type="button"><X className="h-4 w-4" /></button></header><div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">{location.view === "prompt" ? <StepTwoLocationPrompt locationError={location.error} onAllowLocation={location.requestCurrentLocation} onEnterAddress={() => location.openSearch()} requestingLocation={location.requestingLocation} variant="tutor" /> : <StepTwoAddressConfirm addressForm={location.address} coordinates={location.coordinates} locationError={location.error} mode={location.view} onAddressFieldChange={location.changeAddress} onMapLocationChange={location.moveMap} onPlaceQueryChange={location.changeQuery} onSelectPlace={location.selectPlace} placePredictions={location.predictions} placeQuery={location.query} requestingPlaceSearch={location.requestingSearch} resolvingMapLocation={location.resolvingMap} />}</div>{location.view !== "prompt" ? <footer className="flex shrink-0 justify-end gap-2 border-t border-[#e7eaf1] px-4 py-3 sm:px-5"><button className="min-h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#555e73]" onClick={location.goBack} type="button">Back</button>{location.view !== "search" ? <button className="min-h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:bg-[#b8b6cf]" disabled={!location.complete || location.saving || location.resolvingMap} onClick={() => void location.confirm()} type="button">{location.saving ? "Saving..." : "Confirm location"}</button> : null}</footer> : null}</section></div>;
}
