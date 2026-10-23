"use client";

import { isValidPhoneNumber } from "libphonenumber-js";
import { MapPin, Pencil, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { fetchAuthenticatedProfile, type AuthenticatedProfile } from "../auth/profile";
import { setAuthSession } from "../auth/authSession";
import { StudentDashboardNavbar } from "../dashboard/StudentDashboardNavbar";
import { DashboardShell } from "../layout/DashboardShell";
import { StepTwoAddressConfirm } from "../signup/profile-setup/StepTwoAddressConfirm";
import { StepTwoLocationPrompt } from "../signup/profile-setup/StepTwoLocationPrompt";
import { useTutorLocationSetup } from "../tutor/onboarding/useTutorLocationSetup";
import { Avatar } from "../ui/Avatar";
import { Notice } from "../ui/Notice";
import { updateStudentProfile, type StudentProfileUpdate } from "./studentSettings";

type Draft = {
  bio: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phone: string;
};

const emptyDraft: Draft = {
  bio: "",
  email: "",
  firstName: "",
  lastName: "",
  middleName: "",
  phone: "",
};
const fieldClassName = "mt-1.5 h-11 w-full rounded-lg border border-[#d8dde8] bg-white px-3.5 text-sm font-medium text-[#46506a] outline-none focus:border-[#6d63ee]";

function draftFrom(profile: AuthenticatedProfile): Draft {
  return {
    bio: profile.bio ?? "",
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    middleName: profile.middle_name ?? profile.other_names ?? "",
    phone: profile.phone_number ?? "",
  };
}

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState<AuthenticatedProfile | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = useCallback(async () => {
    const nextProfile = await fetchAuthenticatedProfile();
    setProfile(nextProfile);
    setAuthSession(nextProfile);
    return nextProfile;
  }, []);

  useEffect(() => {
    let active = true;
    void fetchAuthenticatedProfile()
      .then((nextProfile) => {
        if (!active) return;
        setProfile(nextProfile);
        setAuthSession(nextProfile);
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : "Account settings could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const openEditor = () => {
    if (!profile) return;
    setDraft(draftFrom(profile));
    setError("");
    setMessage("");
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!profile || saving) return;
    setError("");
    setMessage("");

    if (!draft.firstName.trim() || !draft.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (draft.phone.trim() && !isValidPhoneNumber(draft.phone.trim())) {
      setError("Enter a valid phone number including its country code.");
      return;
    }

    const original = draftFrom(profile);
    const fields: Array<[keyof Draft, keyof StudentProfileUpdate]> = [
      ["firstName", "first_name"],
      ["lastName", "last_name"],
      ["middleName", "middle_name"],
      ["email", "email"],
      ["phone", "phone_number"],
      ["bio", "bio"],
    ];
    const update: StudentProfileUpdate = {};
    for (const [draftKey, apiKey] of fields) {
      const value = draft[draftKey].trim();
      if (value && value !== original[draftKey].trim()) update[apiKey] = value;
    }

    if (!Object.keys(update).length) {
      setEditing(false);
      setMessage("No profile changes to save.");
      return;
    }

    setSaving(true);
    try {
      await updateStudentProfile(update);
      await loadProfile();
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your profile could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "";

  return (
    <DashboardShell contentClassName="!max-w-none !px-0" mainClassName="!p-0" navbar={<StudentDashboardNavbar active="Settings" />}>
      <div className="w-full">
        <div className="border-b border-[#e7eaf1] bg-[#f4f6fa] px-[var(--dashboard-gutter)] py-4">
          <div className="mx-auto w-full max-w-[68rem]">
            <h1 className="text-xl font-bold text-ui-title">Account settings</h1>
            <p className="mt-1 text-sm text-ui-body">View and update your personal information and location.</p>
          </div>
        </div>
        <div className="px-[var(--dashboard-gutter)] py-6">
          {message ? <Notice className="mx-auto mb-4 max-w-[68rem] text-sm" tone="success">{message}</Notice> : null}
          {error ? <Notice className="mx-auto mb-4 max-w-[68rem] text-sm" role="alert" tone="error">{error}</Notice> : null}
          {loading ? <div className="mx-auto flex min-h-48 max-w-[44rem] items-center justify-center rounded-2xl border border-[#e5e8ef] bg-white text-sm text-ui-body">Loading account settings...</div> : null}
          {!loading && profile ? (
            <div className={`mx-auto grid max-w-[68rem] items-start gap-5 ${editing ? "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.85fr)]" : "max-w-[44rem]"}`}>
              <div className="space-y-5">
                <Card action={<EditButton onClick={openEditor} />} title="Personal information">
                  <div className="flex items-center gap-3">
                    <Avatar alt={name} className="h-16 w-16 overflow-hidden rounded-xl bg-brand-primary text-xl text-white" initials={name.charAt(0).toUpperCase()} src={profile.profile_photo || undefined} />
                    <div className="min-w-0"><p className="truncate font-semibold text-ui-title">{name}</p><p className="truncate text-sm text-ui-body">{profile.email}</p></div>
                  </div>
                  <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Detail label="Middle name" value={profile.middle_name ?? profile.other_names} />
                    <Detail label="Phone number" value={profile.phone_number} />
                    <div className="sm:col-span-2"><Detail label="Bio" value={profile.bio} /></div>
                  </dl>
                </Card>
                <Card action={<button className="min-h-9 rounded-full bg-brand-primary px-3.5 text-xs font-semibold text-white" onClick={() => { setError(""); setMessage(""); setLocationOpen(true); }} type="button">Update location</button>} title="Location">
                  {profile.location ? <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" /><div><p className="text-sm font-semibold text-ui-title">{profile.location.address}</p><p className="mt-1 text-xs text-ui-body">{profile.location.latitude}, {profile.location.longitude}</p></div></div> : <p className="text-sm text-ui-body">No saved location.</p>}
                </Card>
              </div>
              {editing ? (
                <Editor onCancel={() => { setEditing(false); setError(""); }} onSave={() => void saveProfile()} saving={saving}>
                  <Field label="First name" onChange={(value) => setDraft((current) => ({ ...current, firstName: value }))} value={draft.firstName} />
                  <Field label="Middle name" onChange={(value) => setDraft((current) => ({ ...current, middleName: value }))} value={draft.middleName} />
                  <Field label="Last name" onChange={(value) => setDraft((current) => ({ ...current, lastName: value }))} value={draft.lastName} />
                  <Field label="Email" onChange={(value) => setDraft((current) => ({ ...current, email: value }))} type="email" value={draft.email} />
                  <Field label="Phone number" onChange={(value) => setDraft((current) => ({ ...current, phone: value }))} placeholder="Include country code, e.g. +234..." type="tel" value={draft.phone} />
                  <label className="text-xs font-semibold text-[#596277]">Bio<textarea className="mt-1.5 min-h-28 w-full resize-y rounded-lg border border-[#d8dde8] bg-white px-3.5 py-3 text-sm font-medium text-[#46506a] outline-none focus:border-[#6d63ee]" maxLength={500} onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))} value={draft.bio} /></label>
                </Editor>
              ) : null}
            </div>
          ) : null}
        </div>
        {locationOpen ? <LocationModal onClose={() => setLocationOpen(false)} onSaved={() => { setLocationOpen(false); setMessage("Location updated successfully."); void loadProfile().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not refresh your location.")); }} /> : null}
      </div>
    </DashboardShell>
  );
}

function Card({ action, children, title }: { action?: React.ReactNode; children: React.ReactNode; title: string }) {
  return <section className="rounded-2xl border border-[#e5e8ef] bg-white p-4 shadow-[0_8px_22px_rgba(31,40,74,0.04)] sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-[#302d79]">{title}</h2>{action}</div>{children}</section>;
}
function EditButton({ onClick }: { onClick: () => void }) {
  return <button className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-primary px-3.5 text-xs font-semibold text-white" onClick={onClick} type="button"><Pencil className="h-3.5 w-3.5" />Edit information</button>;
}
function Detail({ label, value }: { label: string; value?: string }) {
  return <div className="min-w-0 border-b border-[#f0f2f6] pb-3"><dt className="text-xs font-medium text-[#8b93a5]">{label}</dt><dd className={`mt-1 break-words text-sm font-semibold ${value ? "text-[#32394c]" : "text-[#9aa2b2]"}`}>{value || "Not provided"}</dd></div>;
}
function Field({ label, onChange, placeholder, type = "text", value }: { label: string; onChange: (value: string) => void; placeholder?: string; type?: string; value: string }) {
  return <label className="text-xs font-semibold text-[#596277]">{label}<input className={fieldClassName} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} /></label>;
}
function Editor({ children, onCancel, onSave, saving }: { children: React.ReactNode; onCancel: () => void; onSave: () => void; saving: boolean }) {
  return <section className="rounded-2xl border border-[#e5e8ef] bg-white p-4 shadow-[0_8px_24px_rgba(31,40,74,0.06)] sm:p-5 lg:sticky lg:top-4"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#302d79]">Edit personal information</h2><button aria-label="Close editor" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#70798e] hover:bg-[#f3f4f8]" onClick={onCancel} type="button"><X className="h-4 w-4" /></button></div><div className="mt-4 grid gap-3">{children}</div><div className="mt-5 flex justify-end gap-2"><button className="min-h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#555e73]" disabled={saving} onClick={onCancel} type="button">Cancel</button><button className="min-h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:opacity-50" disabled={saving} onClick={onSave} type="button">{saving ? "Saving..." : "Save changes"}</button></div></section>;
}
function LocationModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const location = useTutorLocationSetup((summary) => { if (summary) onSaved(); });
  useEffect(() => { const previousOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = previousOverflow; }; }, []);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10152f]/45 px-3 py-4" onClick={onClose}><section aria-labelledby="student-location-title" aria-modal="true" className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[48rem] flex-col overflow-hidden rounded-2xl border border-[#e1e5ed] bg-white shadow-[var(--ui-shadow-overlay)]" onClick={(event) => event.stopPropagation()} role="dialog"><header className="flex shrink-0 items-center justify-between border-b border-[#e7eaf1] px-4 py-3 sm:px-5"><div><h2 className="text-base font-bold text-[#282f42]" id="student-location-title">Update location</h2><p className="mt-0.5 text-xs text-[#858da0]">Confirm your current location or search for an address.</p></div><button aria-label="Close location update" className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#697188] hover:bg-[#f3f4f8]" onClick={onClose} type="button"><X className="h-4 w-4" /></button></header><div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">{location.view === "prompt" ? <StepTwoLocationPrompt locationError={location.error} onAllowLocation={location.requestCurrentLocation} onEnterAddress={() => location.openSearch()} requestingLocation={location.requestingLocation} /> : <StepTwoAddressConfirm addressForm={location.address} coordinates={location.coordinates} locationError={location.error} mode={location.view} placeId={location.placeId} onChangeLocation={location.goBack} onPlaceQueryChange={location.changeQuery} onSelectPlace={location.selectPlace} placePredictions={location.predictions} placeQuery={location.query} requestingPlaceSearch={location.requestingSearch} source={location.source} />}</div>{location.view !== "prompt" ? <footer className="flex shrink-0 justify-end gap-2 border-t border-[#e7eaf1] px-4 py-3 sm:px-5"><button className="min-h-10 rounded-full border border-[#d8dde8] px-4 text-sm font-semibold text-[#555e73]" onClick={location.goBack} type="button">Back</button>{location.view !== "search" ? <button className="min-h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:bg-[#b8b6cf]" disabled={!location.ready || location.saving} onClick={() => void location.confirm()} type="button">{location.saving ? "Saving..." : "Confirm location"}</button> : null}</footer> : null}</section></div>;
}
