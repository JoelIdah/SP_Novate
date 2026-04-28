"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { LocationTargetIcon } from "./profile-setup/icons";
import { ReviewInformationStep } from "./profile-setup/ReviewInformationStep";
import { SetupSuccessView } from "./profile-setup/SetupSuccessView";
import { getStepIconKindFromLabel, StepItemIcon } from "./shared/StepItemIcon";
import type { SetupMode, SetupStepId, SignUpRole } from "./types";
import { parseReverseGeocodeResult, type AddressState } from "./utils";

type PersonalFormState = {
  lastName: string;
  firstName: string;
  otherName: string;
  dob: string;
  email: string;
  phoneNumber: string;
  occupation: string;
  qualification: string;
  bio: string;
  password: string;
  confirmPassword: string;
};

type IdentificationFormState = {
  employerShareCode: string;
  dbsCertificateNumber: string;
  idType: string;
  idDocumentName: string;
};

type CompensationFormState = {
  lastName: string;
  firstName: string;
  accountNumber: string;
  sortCode: string;
};

type LocationView = "prompt" | "map" | "edit";

type StepMeta = {
  id: SetupStepId;
  label: string;
};

const studentSteps: StepMeta[] = [
  { id: "personal", label: "Personal Information" },
  { id: "location", label: "Location access" },
];

const tutorSteps: StepMeta[] = [
  { id: "personal", label: "Personal Information" },
  { id: "identification", label: "Identification verification" },
  { id: "compensation", label: "Compensation Details" },
  { id: "location", label: "Location access" },
];

const initialPersonalForm: PersonalFormState = {
  lastName: "Alabi",
  firstName: "Oluyinka",
  otherName: "",
  dob: "",
  email: "Oluyinka@gmail.com",
  phoneNumber: "",
  occupation: "",
  qualification: "",
  bio: "",
  password: "",
  confirmPassword: "",
};

const initialIdentificationForm: IdentificationFormState = {
  employerShareCode: "",
  dbsCertificateNumber: "",
  idType: "",
  idDocumentName: "",
};

const initialCompensationForm: CompensationFormState = {
  lastName: "",
  firstName: "",
  accountNumber: "",
  sortCode: "",
};

const initialAddress: AddressState = {
  address: "",
  country: "",
  postcode: "",
  state: "",
  city: "",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[0.72rem] font-semibold text-[#5d6479]">{children}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="border-b border-[#e8ebf2] pb-1 text-[0.78rem] font-semibold text-[#6f778c]">{children}</h3>;
}

function StatusIndicator({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#24cbb8]">
        <svg aria-hidden className="h-2.5 w-2.5" fill="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 5.2L4.1 7.3L8 3.4" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      </span>
    );
  }

  if (active) {
    return (
      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6f778c]">
        <svg aria-hidden className="h-2.5 w-2.5" fill="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 5.2L4.1 7.3L8 3.4" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
      </span>
    );
  }

  return <span className="inline-flex h-4 w-4 rounded-full border border-[#b8c1d4]" />;
}

export function ProfileSetupStep({
  initialMode = "form",
  initialStepId,
  onBack,
  onStateChange,
  role,
}: {
  initialMode?: SetupMode;
  initialStepId?: SetupStepId;
  onBack: () => void;
  onStateChange?: (state: { mode: SetupMode; stepId: SetupStepId }) => void;
  role: SignUpRole | null;
}) {
  const steps = role === "tutor" ? tutorSteps : studentSteps;
  const stepIndexFromUrl = useMemo(() => {
    const fallbackId = steps[0]?.id ?? "personal";
    const targetId = initialStepId ?? fallbackId;
    const index = steps.findIndex((step) => step.id === targetId);
    return index >= 0 ? index : 0;
  }, [initialStepId, steps]);

  const [activeStepIndex, setActiveStepIndex] = useState(stepIndexFromUrl);
  const [completedSteps, setCompletedSteps] = useState<SetupStepId[]>([]);
  const [setupComplete, setSetupComplete] = useState(initialMode === "success");
  const [showReview, setShowReview] = useState(initialMode === "review");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const [personalForm, setPersonalForm] = useState<PersonalFormState>(initialPersonalForm);
  const [identificationForm, setIdentificationForm] = useState<IdentificationFormState>(initialIdentificationForm);
  const [compensationForm, setCompensationForm] = useState<CompensationFormState>(initialCompensationForm);
  const [addressForm, setAddressForm] = useState<AddressState>(initialAddress);

  const [locationView, setLocationView] = useState<LocationView>("prompt");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const currentStep = steps[activeStepIndex]?.id ?? "personal";
  const isLastStep = activeStepIndex === steps.length - 1;
  const showReviewScreen = !setupComplete && showReview;

  useEffect(() => {
    if (!onStateChange) return;
    const mode: SetupMode = setupComplete ? "success" : showReview ? "review" : "form";
    onStateChange({ mode, stepId: currentStep });
  }, [currentStep, onStateChange, setupComplete, showReview]);

  const personalValid = useMemo(() => {
    const base =
      personalForm.lastName.trim().length > 0 &&
      personalForm.firstName.trim().length > 0 &&
      personalForm.email.trim().length > 0 &&
      personalForm.phoneNumber.trim().length >= 7 &&
      personalForm.password.length >= 8 &&
      personalForm.password === personalForm.confirmPassword;

    if (role === "tutor") {
      return base && personalForm.bio.trim().length >= 10 && personalForm.occupation.trim().length > 0;
    }

    return base;
  }, [personalForm, role]);

  const identificationValid = useMemo(() => {
    return (
      identificationForm.employerShareCode.trim().length > 0 &&
      identificationForm.dbsCertificateNumber.trim().length > 0 &&
      identificationForm.idType.trim().length > 0 &&
      identificationForm.idDocumentName.trim().length > 0
    );
  }, [identificationForm]);

  const compensationValid = useMemo(() => {
    return (
      compensationForm.lastName.trim().length > 0 &&
      compensationForm.firstName.trim().length > 0 &&
      compensationForm.accountNumber.trim().length >= 8 &&
      compensationForm.sortCode.trim().length >= 6
    );
  }, [compensationForm]);

  const addressFilled = useMemo(() => {
    return (
      addressForm.address.trim().length > 0 &&
      addressForm.country.trim().length > 0 &&
      addressForm.postcode.trim().length > 0 &&
      addressForm.state.trim().length > 0 &&
      addressForm.city.trim().length > 0
    );
  }, [addressForm]);

  const stepValid =
    currentStep === "personal"
      ? personalValid
      : currentStep === "identification"
        ? identificationValid
        : currentStep === "compensation"
          ? compensationValid
          : addressConfirmed;

  const markStepDone = (step: SetupStepId) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  };

  const handleAllowLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Location is not supported on this browser.");
      return;
    }

    setRequestingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`,
          );

          if (!response.ok) throw new Error("Could not fetch address details.");

          const data = await response.json();
          setCoords({ lat, lon });
          setAddressForm(parseReverseGeocodeResult(data, lat, lon));
          setLocationView("map");
          setAddressConfirmed(false);
        } catch (error) {
          setLocationError(error instanceof Error ? error.message : "Could not fetch your address.");
        } finally {
          setRequestingLocation(false);
        }
      },
      () => {
        setLocationError("Location permission was denied or unavailable.");
        setRequestingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 },
    );
  };

  const mapEmbedUrl = useMemo(() => {
    if (!coords) return "";

    const delta = 0.02;
    const left = coords.lon - delta;
    const right = coords.lon + delta;
    const top = coords.lat + delta;
    const bottom = coords.lat - delta;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`;
  }, [coords]);

  const handleContinue = () => {
    if (!stepValid) return;

    markStepDone(currentStep);

    if (isLastStep) {
      setSetupComplete(true);
      return;
    }

    setActiveStepIndex((prev) => prev + 1);
  };

  const jumpToStep = (step: SetupStepId, nextLocationView: LocationView = "map") => {
    const index = steps.findIndex((item) => item.id === step);
    if (index >= 0) {
      setActiveStepIndex(index);
    }
    if (step === "location") {
      setLocationView(nextLocationView);
    }
    setShowReview(false);
    setReviewConfirmed(false);
  };

  const openReviewScreen = () => {
    setAddressConfirmed(true);
    markStepDone("location");
    setReviewConfirmed(false);
    setShowReview(true);
  };

  const greetingName = personalForm.firstName.trim() || "there";
  const fullAddress = [addressForm.address, addressForm.city, addressForm.state, addressForm.postcode, addressForm.country].filter(Boolean).join(", ");

  const stepLabel = `Step ${activeStepIndex + 1}/${steps.length}`;
  const footerHasContinue = !setupComplete && !showReviewScreen && currentStep !== "location";
  return (
    <main className={`${showReviewScreen ? "h-[100svh] overflow-y-auto" : "h-[100svh] overflow-hidden"} bg-[#f8f9fc] text-[#1f2430]`}>
      <header className="flex h-14 items-center justify-between border-b border-[#e6e9f2] bg-white px-4 sm:px-6">
        <Image alt="SP Novate" className="h-8 w-auto" height={32} src="/logo/logo.png" width={32} />
        <button className="flex items-center gap-2 rounded-full border border-[#e2e6ef] bg-[#fbfcff] px-2 py-1.5 text-left" type="button">
          <span className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-full bg-[#3d3bb8] text-[0.7rem] font-semibold text-white">O</span>
          <span className="leading-tight">
            <span className="block text-[0.76rem] font-semibold text-[#3d3bb8]">Welcome back, Oluyinka!</span>
            <span className="block text-[0.62rem] text-[#6d758a]">Oluyinka@dotsandsstrokesstudio.com</span>
          </span>
          <span className="ml-1 text-[0.65rem] text-[#6d758a]">v</span>
        </button>
      </header>

      <section
        className={
          showReviewScreen
            ? "min-h-[calc(100svh-112px)] px-4 py-5 sm:px-6"
            : setupComplete
              ? "h-[calc(100svh-56px)] px-4 py-5 sm:px-6"
            : "grid h-[calc(100svh-112px)] grid-cols-[250px_1fr] gap-8 px-8 py-6"
        }
      >
        {!setupComplete && !showReviewScreen ? (
          <aside className="pt-8">
            <div className="space-y-2">
              {steps.map((step, index) => {
                const active = index === activeStepIndex;
                const done = completedSteps.includes(step.id);

                return (
                  <button
                    key={step.id}
                    className={`flex h-11 w-full items-center justify-between rounded-[0.58rem] px-3 text-left ${active ? "bg-[#e4effa]" : "bg-[#edf2f8]"}`}
                    onClick={() => setActiveStepIndex(index)}
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <StepItemIcon kind={getStepIconKindFromLabel(step.label)} />
                      <span className="text-[0.78rem] font-semibold text-[#38445e]">{step.label}</span>
                    </span>
                    <StatusIndicator active={active} done={done} />
                  </button>
                );
              })}
            </div>
          </aside>
        ) : null}

        <div className={showReviewScreen ? "mx-auto w-full max-w-[660px]" : setupComplete ? "mx-auto flex h-full w-full max-w-[820px] items-center justify-center" : "overflow-hidden pr-2"}>
          {setupComplete ? (
            <SetupSuccessView />
          ) : showReviewScreen ? (
            <ReviewInformationStep
              compensationForm={compensationForm}
              fullAddress={fullAddress}
              greetingName={greetingName}
              identificationForm={identificationForm}
              mapEmbedUrl={mapEmbedUrl}
              onEditCompensation={() => jumpToStep("compensation")}
              onEditIdentification={() => jumpToStep("identification")}
              onEditLocation={() => jumpToStep("location", "edit")}
              onEditPersonal={() => jumpToStep("personal")}
              onReviewConfirmedChange={setReviewConfirmed}
              personalForm={personalForm}
              reviewConfirmed={reviewConfirmed}
              role={role}
            />
          ) : currentStep === "personal" ? (
            <div className="mx-auto max-w-[620px]">
              <SectionTitle>Personal information</SectionTitle>

              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <label><FieldLabel>Last name</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, lastName: e.target.value }))} value={personalForm.lastName} /></label>
                <label><FieldLabel>First name</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, firstName: e.target.value }))} value={personalForm.firstName} /></label>
                <label><FieldLabel>Other name</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, otherName: e.target.value }))} placeholder="Enter your other name" value={personalForm.otherName} /></label>
                <label><FieldLabel>Date of birth</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, dob: e.target.value }))} placeholder="DD/MM/YY" value={personalForm.dob} /></label>
              </div>

              <SectionTitle>Contact information</SectionTitle>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <label><FieldLabel>Email</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, email: e.target.value }))} value={personalForm.email} /></label>
                <label>
                  <FieldLabel>Phone number</FieldLabel>
                  <div className="mt-1 flex h-8 items-center rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem] text-[#6c748a]">
                    <span>+234</span>
                    <span className="mx-2 text-[#c5cada]">|</span>
                    <input className="min-w-0 flex-1 bg-transparent text-[0.76rem] text-[#37405a] outline-none" onChange={(e) => setPersonalForm((p) => ({ ...p, phoneNumber: e.target.value }))} placeholder="phone number" value={personalForm.phoneNumber} />
                  </div>
                </label>
              </div>

              {role === "tutor" ? (
                <>
                  <SectionTitle>Professional information</SectionTitle>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    <label><FieldLabel>Occupation</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, occupation: e.target.value }))} placeholder="Occupation" value={personalForm.occupation} /></label>
                    <label><FieldLabel>Qualification</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, qualification: e.target.value }))} placeholder="Highest qualification" value={personalForm.qualification} /></label>
                    <label className="col-span-2"><FieldLabel>Tell us about your experience</FieldLabel><textarea className="mt-1 h-12 w-full resize-none rounded-md border border-[#d8dde8] bg-white px-3 py-2 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, bio: e.target.value }))} placeholder="Tell us why you are the perfect tutor for the job." value={personalForm.bio} /></label>
                  </div>
                </>
              ) : null}

              <SectionTitle>Security</SectionTitle>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <label><FieldLabel>Password</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, password: e.target.value }))} type="password" value={personalForm.password} /></label>
                <label><FieldLabel>Confirm Password</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setPersonalForm((p) => ({ ...p, confirmPassword: e.target.value }))} type="password" value={personalForm.confirmPassword} /></label>
              </div>
            </div>
          ) : currentStep === "identification" ? (
            <div className="mx-auto max-w-[620px]">
              <SectionTitle>Right to work (UK)</SectionTitle>
              <div className="mt-2 space-y-2">
                <label><FieldLabel>Employer share code</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setIdentificationForm((p) => ({ ...p, employerShareCode: e.target.value }))} placeholder="Enter employer share code" value={identificationForm.employerShareCode} /></label>
                <p className="text-[0.62rem] text-[#8c93a7]">Generate your share code from the UK government website to confirm your right to work.</p>
              </div>

              <div className="mt-6">
                <SectionTitle>Background check</SectionTitle>
                <div className="mt-2 space-y-2">
                  <label><FieldLabel>DBS certificate number</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setIdentificationForm((p) => ({ ...p, dbsCertificateNumber: e.target.value }))} placeholder="Enter DBS certificate number" value={identificationForm.dbsCertificateNumber} /></label>
                  <p className="text-[0.62rem] text-[#8c93a7]">Provide your Disclosure and Barring Service (DBS) certificate number for background verification.</p>
                </div>
              </div>

              <div className="mt-6">
                <SectionTitle>Identification type</SectionTitle>
                <div className="mt-2 space-y-2">
                  <label><FieldLabel>ID type</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setIdentificationForm((p) => ({ ...p, idType: e.target.value }))} placeholder="Select ID type" value={identificationForm.idType} /></label>
                  <label>
                    <FieldLabel>Upload ID document</FieldLabel>
                    <button className="mt-1 flex h-20 w-full flex-col items-center justify-center rounded-md border border-[#d8dde8] bg-white text-[0.72rem]" onClick={() => setIdentificationForm((p) => ({ ...p, idDocumentName: "uploaded-document.pdf" }))} type="button">
                      <span className="font-semibold text-[#5a52d4]">Click to upload</span>
                      <span className="text-[#8c93a7]">or drag and drop</span>
                    </button>
                  </label>
                </div>
              </div>
            </div>
          ) : currentStep === "compensation" ? (
            <div className="mx-auto max-w-[620px]">
              <SectionTitle>Payment details</SectionTitle>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <label><FieldLabel>Last name</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setCompensationForm((p) => ({ ...p, lastName: e.target.value }))} placeholder="Enter your last name" value={compensationForm.lastName} /></label>
                <label><FieldLabel>First Name</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setCompensationForm((p) => ({ ...p, firstName: e.target.value }))} placeholder="Enter your first name" value={compensationForm.firstName} /></label>
                <label><FieldLabel>Account number</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setCompensationForm((p) => ({ ...p, accountNumber: e.target.value }))} placeholder="Enter your bank account number" value={compensationForm.accountNumber} /></label>
                <label><FieldLabel>Sort code</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => setCompensationForm((p) => ({ ...p, sortCode: e.target.value }))} placeholder="Enter your bank's sort code" value={compensationForm.sortCode} /></label>
              </div>
            </div>
          ) : locationView === "prompt" ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-5 w-fit"><LocationTargetIcon /></div>
                <h2 className="text-[2rem] font-bold tracking-[-0.02em] text-[#1d2331]">Find tutors near you</h2>
                <p className="mx-auto mt-2 max-w-[390px] text-sm font-medium text-[#8c93a7]">Allow location access so we can show you the best tutors available in your area.</p>
                <button className="mt-5 h-10 rounded-full bg-[#231d71] px-8 text-sm font-semibold text-white" disabled={requestingLocation} onClick={handleAllowLocation} type="button">{requestingLocation ? "Requesting location..." : "Allow location access"}</button>
                {locationError ? <p className="mt-2 text-sm text-[#d04b4b]">{locationError}</p> : null}
              </div>
            </div>
          ) : locationView === "map" ? (
            <div className="mx-auto max-w-[660px] text-center">
              <div className="mx-auto mb-4 w-fit"><LocationTargetIcon /></div>
              <h2 className="text-[2rem] font-bold tracking-[-0.02em] text-[#1d2331]">Is this your current address?</h2>

              <div className="mt-3 rounded-[0.7rem] border border-[#d8dde8] bg-white p-2.5 text-left">
                <p className="text-[0.72rem] font-semibold text-[#6f778c]">Address</p>
                <p className="mt-0.5 text-[0.83rem] text-[#37405a]">{addressForm.address || "No address found yet"}</p>
                <div className="mt-2 overflow-hidden rounded-[0.55rem] border border-[#e1e4ee]">
                  {mapEmbedUrl ? (
                    <iframe className="h-[220px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapEmbedUrl} title="Current location map" />
                  ) : (
                    <div className="flex h-[220px] items-center justify-center text-sm text-[#8c93a7]">Map preview unavailable</div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button className="h-9 rounded-full border border-[#d8dde8] bg-white px-5 text-sm font-semibold text-[#6f778c]" onClick={() => setLocationView("edit")} type="button">Edit address</button>
                <button className="h-9 rounded-full bg-[#231d71] px-6 text-sm font-semibold text-white" onClick={openReviewScreen} type="button">Yes this is my address</button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-[620px]">
              <h2 className="text-[2rem] font-bold tracking-[-0.02em] text-[#1d2331]">Edit address</h2>
              <p className="mt-1.5 text-sm text-[#8c93a7]">Update your address details and confirm when done.</p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <label className="col-span-2"><FieldLabel>Address</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => { setAddressForm((p) => ({ ...p, address: e.target.value })); setAddressConfirmed(false); }} value={addressForm.address} /></label>
                <label><FieldLabel>Country</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => { setAddressForm((p) => ({ ...p, country: e.target.value })); setAddressConfirmed(false); }} value={addressForm.country} /></label>
                <label><FieldLabel>Postcode</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => { setAddressForm((p) => ({ ...p, postcode: e.target.value })); setAddressConfirmed(false); }} value={addressForm.postcode} /></label>
                <label><FieldLabel>State</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => { setAddressForm((p) => ({ ...p, state: e.target.value })); setAddressConfirmed(false); }} value={addressForm.state} /></label>
                <label><FieldLabel>City</FieldLabel><input className="mt-1 h-8 w-full rounded-md border border-[#d8dde8] bg-white px-3 text-[0.76rem]" onChange={(e) => { setAddressForm((p) => ({ ...p, city: e.target.value })); setAddressConfirmed(false); }} value={addressForm.city} /></label>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button className="h-9 rounded-full border border-[#d8dde8] px-5 text-sm" onClick={() => setLocationView("map")} type="button">Back to map</button>
                <button className={`h-9 rounded-full px-6 text-sm font-semibold text-white ${addressFilled ? "bg-[#231d71]" : "bg-[#cdd1de]"}`} disabled={!addressFilled} onClick={openReviewScreen} type="button">Yes this is my address</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {!setupComplete ? (
        <footer className="flex h-14 items-center justify-between border-t border-[#e6e9f2] bg-white/95 px-3 sm:px-5">
          <div className="flex items-center gap-2 text-[0.72rem] text-[#5f6780]">
            <span className="rounded-full border border-[#c7cdfd] bg-[#f2f3ff] px-2 py-1 font-semibold text-[#5852ce]">{stepLabel}</span>
            <span>›</span>
            <span className="font-medium">Profile set up</span>
          </div>

          <div className="flex items-center gap-2.5">
            {showReviewScreen ? (
              <>
                <button
                  className="h-8.5 rounded-full border border-[#d8dde8] px-5 text-[0.78rem] font-semibold text-[#6f778c]"
                  onClick={() => {
                    setShowReview(false);
                    setReviewConfirmed(false);
                    setLocationView("map");
                  }}
                  type="button"
                >
                  Go back
                </button>
                <button
                  className={`h-8.5 rounded-full px-6 text-[0.78rem] font-semibold text-white ${reviewConfirmed ? "bg-[#231d71]" : "bg-[#cdd1de]"}`}
                  disabled={!reviewConfirmed}
                  onClick={() => setSetupComplete(true)}
                  type="button"
                >
                  Finish setup
                </button>
              </>
            ) : (
              <>
                <button className="h-8.5 rounded-full border border-[#d8dde8] px-5 text-[0.78rem] font-semibold text-[#6f778c]" onClick={activeStepIndex === 0 ? onBack : () => setActiveStepIndex((i) => Math.max(0, i - 1))} type="button">Cancel</button>

                {footerHasContinue ? (
                  <button className={`h-8.5 rounded-full px-6 text-[0.78rem] font-semibold text-white ${stepValid ? "bg-[#918ed8]" : "bg-[#cdd1de]"}`} disabled={!stepValid} onClick={handleContinue} type="button">{isLastStep ? "Finish setup" : "Continue"}</button>
                ) : null}
              </>
            )}
          </div>
        </footer>
      ) : null}

      <div className="sr-only">Selected role: {role ?? "none"}</div>
    </main>
  );
}
