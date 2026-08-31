"use client";

import {
  BadgeCheck,
  CircleDollarSign,
  FileCheck2,
  MapPin,
  UploadCloud,
  UserRound,
} from "lucide-react";
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getAccessToken, useSessionUser } from "../../auth/authSession";
import { OnboardingNavbar } from "../../signup/OnboardingNavbar";
import { StepTwoAddressConfirm } from "../../signup/profile-setup/StepTwoAddressConfirm";
import { StepTwoLocationPrompt } from "../../signup/profile-setup/StepTwoLocationPrompt";
import { SelectMenu } from "../../ui/SelectMenu";
import { TutorReviewStep } from "./TutorReviewStep";
import {
  useTutorLocationSetup,
  type TutorLocationSummary,
} from "./useTutorLocationSetup";
import {
  getNigerianBanks,
  getTutorOnboardingReview,
  resolveNigerianBankAccount,
  saveTutorCompensation,
  saveTutorIdentification,
  saveTutorPersonalDetails,
  submitTutorOnboardingConsent,
  type NigerianBank,
  type TutorCompensationInput,
  type TutorOnboardingReview,
  type TutorPersonalDetailsInput,
} from "./tutorOnboardingApi";

type Stage =
  "overview" | "personal" | "identity" | "compensation" | "location" | "review";
type SetupStage = Exclude<Stage, "overview" | "review">;
type OperatingCountry = "NG" | "GB" | "";
type PersonalForm = {
  firstName: string | null;
  lastName: string | null;
  otherName: string;
  dateOfBirth: string;
  email: string | null;
  phoneNumber: string;
  country: OperatingCountry;
  occupation: string;
  qualification: string;
  experience: string;
};
type CompensationForm = {
  bankCode: string;
  bankName: string;
  accountName: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  sortCode: string;
};

const stages = [
  { id: "personal", label: "Personal information", icon: UserRound },
  { id: "identity", label: "Identification verification", icon: FileCheck2 },
  { id: "compensation", label: "Compensation details", icon: CircleDollarSign },
  { id: "location", label: "Location access", icon: MapPin },
] as const;
const fieldClassName =
  "mt-1.5 h-11 w-full rounded-lg border border-[#d8dde8] bg-white px-3.5 text-sm font-medium text-[#46506a] outline-none focus:border-[#6d63ee] focus:ring-2 focus:ring-[#6d63ee]/15 aria-[invalid=true]:border-brand-danger";
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const phoneCountries = getCountries()
  .map((iso) => ({
    callingCode: `+${getCountryCallingCode(iso)}`,
    country: regionNames.of(iso) ?? iso,
    iso,
  }))
  .sort((a, b) => a.country.localeCompare(b.country));
const identificationTypeValues: Record<string, string> = {
  NIN: "national_id",
  Passport: "passport",
  "Voter's card": "voters_card",
  "Driver's licence": "drivers_license",
};
const acceptedIdentityFileName = /\.(?:jpe?g|png|webp|pdf)$/i;

function FieldLabel({
  children,
  optional = false,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <span className="text-xs font-semibold text-[#596277]">
      {children}
      {optional ? (
        <span className="font-medium text-[#9299a9]"> (optional)</span>
      ) : (
        <span className="text-brand-danger"> *</span>
      )}
    </span>
  );
}

function InlineFieldError({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) {
  return show ? (
    <span
      className="mt-1 block text-xs font-medium text-brand-danger"
      role="alert"
    >
      {children}
    </span>
  ) : null;
}

function SelectField({
  ariaInvalid,
  onChange,
  options,
  placeholder,
  searchable = false,
  searchPlaceholder,
  value,
}: {
  ariaInvalid?: boolean;
  onChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  placeholder: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  value: string;
}) {
  return (
    <SelectMenu
      className="mt-1.5"
      invalid={ariaInvalid}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      value={value}
    />
  );
}

function StepList({
  active,
  completed,
  onSelect,
}: {
  active: SetupStage;
  completed: SetupStage[];
  onSelect: (stage: SetupStage) => void;
}) {
  const activeIndex = stages.findIndex((step) => step.id === active);
  return (
    <aside className="hidden w-[18rem] shrink-0 lg:block">
      <div className="space-y-2">
        {stages.map((step, index) => {
          const Icon = step.icon;
          const done = completed.includes(step.id);
          const current = index === activeIndex;
          const selectable = done || current;
          return (
            <button
              className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-3.5 text-left ${current ? "border-[#cfd3fa] bg-[#f1f3ff]" : "border-[#e0e5ee] bg-[#f7f9fc]"} ${selectable ? "cursor-pointer" : "cursor-default"}`}
              disabled={!selectable}
              key={step.id}
              onClick={() => onSelect(step.id)}
              type="button"
            >
              <span className="flex items-center gap-2.5 text-xs font-semibold text-[#39435b]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4039bd] text-white">
                  <Icon size={13} />
                </span>
                {step.label}
              </span>
              {done ? (
                <BadgeCheck className="h-4 w-4 text-[#20bca8]" />
              ) : (
                <span
                  className={`h-4 w-4 rounded-full ${current ? "bg-[#7d8495]" : "border border-[#b8c0d0]"}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default function TutorOnboardingFlow() {
  const router = useRouter();
  const sessionUser = useSessionUser();
  const [stage, setStage] = useState<Stage>("overview");
  const [completed, setCompleted] = useState<SetupStage[]>([]);
  const [returnToReview, setReturnToReview] = useState(false);
  const [validationVisible, setValidationVisible] = useState(false);
  const [identityValidationVisible, setIdentityValidationVisible] =
    useState(false);
  const [compensationValidationVisible, setCompensationValidationVisible] =
    useState(false);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [reviewData, setReviewData] = useState<TutorOnboardingReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState("");
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [consentSubmitting, setConsentSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [personalSubmitting, setPersonalSubmitting] = useState(false);
  const [personalApiError, setPersonalApiError] = useState("");
  const [submittedPersonalSignature, setSubmittedPersonalSignature] = useState("");
  const [personalForm, setPersonalForm] = useState<PersonalForm>({
    firstName: null,
    lastName: null,
    otherName: "",
    dateOfBirth: "",
    email: null,
    phoneNumber: "",
    country: "",
    occupation: "",
    qualification: "",
    experience: "",
  });
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>("NG");
  const [shareCode, setShareCode] = useState("");
  const [dbsNumber, setDbsNumber] = useState("");
  const [idType, setIdType] = useState("");
  const [idFiles, setIdFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [identitySubmitting, setIdentitySubmitting] = useState(false);
  const [identityApiError, setIdentityApiError] = useState("");
  const [submittedIdentitySignature, setSubmittedIdentitySignature] =
    useState("");
  const [compensation, setCompensation] = useState<CompensationForm>({
    bankCode: "",
    bankName: "",
    accountName: "",
    firstName: "",
    lastName: "",
    accountNumber: "",
    sortCode: "",
  });
  const [banks, setBanks] = useState<NigerianBank[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [banksError, setBanksError] = useState("");
  const [banksRetry, setBanksRetry] = useState(0);
  const banksRequestInFlight = useRef(false);
  const [accountResolving, setAccountResolving] = useState(false);
  const [accountResolveError, setAccountResolveError] = useState("");
  const [verifiedAccountSignature, setVerifiedAccountSignature] = useState("");
  const [compensationSubmitting, setCompensationSubmitting] = useState(false);
  const [compensationApiError, setCompensationApiError] = useState("");
  const [submittedCompensationSignature, setSubmittedCompensationSignature] =
    useState("");
  const [locationSummary, setLocationSummary] =
    useState<TutorLocationSummary | null>(null);

  const firstName = personalForm.firstName ?? sessionUser?.firstName ?? "";
  const lastName = personalForm.lastName ?? sessionUser?.lastName ?? "";
  const email = personalForm.email ?? sessionUser?.email ?? "";
  const parsedPhone = parsePhoneNumberFromString(
    personalForm.phoneNumber.trim(),
    phoneCountry,
  );
  const phoneValid = parsedPhone?.isValid() ?? false;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const personalComplete = Boolean(
    firstName.trim() &&
    lastName.trim() &&
    emailValid &&
    phoneValid &&
    personalForm.country &&
    personalForm.occupation.trim() &&
    personalForm.qualification.trim() &&
    personalForm.experience.trim().length >= 10,
  );
  const personalPayload: TutorPersonalDetailsInput = {
    bio: personalForm.experience.trim(),
    country_code: `+${getCountryCallingCode(phoneCountry)}`,
    email: email.trim(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    occupation: personalForm.occupation.trim(),
    phone_number: parsedPhone?.nationalNumber ?? "",
    qualifications: [personalForm.qualification.trim()],
    ...(personalForm.otherName.trim() ? { other_names: personalForm.otherName.trim() } : {}),
  };
  const personalSignature = JSON.stringify(personalPayload);
  const identityComplete = Boolean(
    idType &&
    idFiles.length > 0 &&
    idFiles.length <= 5 &&
    (personalForm.country !== "GB" || (shareCode.trim() && dbsNumber.trim())),
  );
  const identitySignature = JSON.stringify({
    country: personalForm.country,
    dbsNumber: dbsNumber.trim(),
    files: idFiles.map((file) => [file.name, file.size, file.lastModified]),
    idType,
    shareCode: shareCode.trim(),
  });
  const compensationComplete =
    personalForm.country === "GB"
      ? Boolean(
          compensation.firstName.trim() &&
          compensation.lastName.trim() &&
          compensation.accountNumber.trim().length >= 8 &&
          compensation.sortCode.replace(/\D/g, "").length === 6,
        )
      : Boolean(
          compensation.bankCode.trim() &&
          compensation.bankName.trim() &&
          compensation.accountName.trim() &&
          compensation.accountNumber.replace(/\D/g, "").length === 10 &&
          verifiedAccountSignature ===
            `${compensation.bankCode}:${compensation.accountNumber}`,
        );
  const compensationSignature = JSON.stringify({
    ...compensation,
    country: personalForm.country,
  });
  const displayName = firstName || "there";

  const markCompleted = (item: SetupStage) =>
    setCompleted((current) =>
      current.includes(item) ? current : [...current, item],
    );
  const goNext = (current: SetupStage, next: SetupStage) => {
    markCompleted(current);
    setStage(returnToReview ? "review" : next);
    setReturnToReview(false);
  };
  const updatePersonal = <K extends keyof PersonalForm>(
    field: K,
    value: PersonalForm[K],
  ) => {
    setPersonalApiError("");
    setPersonalForm((current) => ({ ...current, [field]: value }));
  };
  const updateCompensation = (field: keyof CompensationForm, value: string) => {
    setCompensationApiError("");
    setCompensation((current) => ({ ...current, [field]: value }));
  };
  const changeCountry = (country: OperatingCountry) => {
    if (country !== personalForm.country) {
      setShareCode("");
      setDbsNumber("");
      setIdType("");
      setIdFiles([]);
      setFileError("");
      setIdentityApiError("");
      setSubmittedIdentitySignature("");
      setCompensation({
        bankCode: "",
        bankName: "",
        accountName: "",
        firstName: "",
        lastName: "",
        accountNumber: "",
        sortCode: "",
      });
      setVerifiedAccountSignature("");
      setAccountResolveError("");
      setCompensationApiError("");
      setSubmittedCompensationSignature("");
    }
    updatePersonal("country", country);
  };
  const location = useTutorLocationSetup((summary) => {
    setLocationSummary(summary);
    markCompleted("location");
    setStage("review");
    setReturnToReview(false);
  });

  useEffect(() => {
    if (stage !== "review") return;
    const controller = new AbortController();
    getTutorOnboardingReview(controller.signal)
      .then((data) => {
        setReviewData(data);
        setReviewError("");
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setReviewData(null);
        setReviewError(caught instanceof Error ? caught.message : "Tutor review could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setReviewLoading(false);
      });
    return () => controller.abort();
  }, [reviewRefreshKey, stage]);

  const handleFiles = (selectedFiles?: FileList | null) => {
    setFileError("");
    setIdentityApiError("");
    if (!selectedFiles?.length) return;
    const incoming = Array.from(selectedFiles);
    const invalidFile = incoming.find(
      (file) => !acceptedIdentityFileName.test(file.name),
    );
    if (invalidFile) {
      setFileError(
        `${invalidFile.name} is not supported. Upload JPG, PNG, WEBP, or PDF files.`,
      );
      return;
    }
    const combined = [...idFiles, ...incoming].filter(
      (file, index, files) =>
        files.findIndex(
          (candidate) =>
            candidate.name === file.name &&
            candidate.size === file.size &&
            candidate.lastModified === file.lastModified,
        ) === index,
    );
    if (combined.length > 5) {
      setFileError("You can upload a maximum of 5 identity documents.");
      return;
    }
    setIdFiles(combined);
  };
  const startSetup = () => {
    if (!getAccessToken()) router.push("/login");
    else setStage("personal");
  };
  const continuePersonal = async () => {
    setValidationVisible(true);
    setPersonalApiError("");
    if (!personalComplete) return;
    if (submittedPersonalSignature === personalSignature) {
      setValidationVisible(false);
      goNext("personal", "identity");
      return;
    }
    setPersonalSubmitting(true);
    try {
      await saveTutorPersonalDetails(personalPayload);
      setSubmittedPersonalSignature(personalSignature);
    } catch (caught) {
      setPersonalApiError(caught instanceof Error ? caught.message : "Personal details could not be saved.");
      return;
    } finally {
      setPersonalSubmitting(false);
    }
    setValidationVisible(false);
    goNext("personal", "identity");
  };
  const advanceFromIdentity = () => {
    if (personalForm.country === "GB")
      setCompensation((current) => ({
        ...current,
        firstName: current.firstName || firstName,
        lastName: current.lastName || lastName,
      }));
    setIdentityValidationVisible(false);
    goNext("identity", "compensation");
  };
  const continueIdentity = async () => {
    setIdentityValidationVisible(true);
    setIdentityApiError("");
    if (!identityComplete) return;
    if (submittedIdentitySignature === identitySignature) {
      advanceFromIdentity();
      return;
    }
    setIdentitySubmitting(true);
    try {
      await saveTutorIdentification({
        country: personalForm.country === "GB" ? "uk" : "nigeria",
        id_type: identificationTypeValues[idType] ?? idType.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
        documents: idFiles,
        ...(personalForm.country === "GB" ? {
          employer_share_code: shareCode.trim(),
          dbs_certificate_number: dbsNumber.trim(),
        } : {}),
      });
      setSubmittedIdentitySignature(identitySignature);
      advanceFromIdentity();
    } catch (caught) {
      setIdentityApiError(
        caught instanceof Error
          ? caught.message
          : "Could not submit identity verification.",
      );
    } finally {
      setIdentitySubmitting(false);
    }
  };
  useEffect(() => {
    if (
      stage !== "compensation" ||
      personalForm.country !== "NG" ||
      banks.length > 0 ||
      banksRequestInFlight.current
    )
      return;
    banksRequestInFlight.current = true;
    setBanksLoading(true);
    setBanksError("");
    void getNigerianBanks()
      .then((result) => {
        const uniqueBanks = Array.from(
          new Map(
            result.map((bank) => [bank.code, bank]),
          ).values(),
        );
        setBanks(uniqueBanks);
      })
      .catch((caught) => {
        setBanksError(
          caught instanceof Error
            ? caught.message
            : "Could not load Nigerian banks.",
        );
      })
      .finally(() => {
        banksRequestInFlight.current = false;
        setBanksLoading(false);
      });
  }, [banks.length, banksRetry, personalForm.country, stage]);

  const selectBank = (bankCode: string) => {
    const bank = banks.find((candidate) => candidate.code === bankCode);
    setCompensation((current) => ({
      ...current,
      accountName: "",
      bankCode,
      bankName: bank?.name ?? "",
    }));
    setVerifiedAccountSignature("");
    setAccountResolveError("");
    setCompensationApiError("");
  };
  const changeNigerianAccountNumber = (value: string) => {
    setCompensation((current) => ({
      ...current,
      accountName: "",
      accountNumber: value.replace(/\D/g, "").slice(0, 10),
    }));
    setVerifiedAccountSignature("");
    setAccountResolveError("");
    setCompensationApiError("");
  };
  const resolveNigerianAccount = async () => {
    const accountNumber = compensation.accountNumber.replace(/\D/g, "");
    setCompensationValidationVisible(true);
    setAccountResolveError("");
    if (!compensation.bankCode || accountNumber.length !== 10) return;
    setAccountResolving(true);
    try {
      const accountName = await resolveNigerianBankAccount(accountNumber, compensation.bankCode);
      setCompensation((current) => ({
        ...current,
        accountName,
      }));
      setVerifiedAccountSignature(`${compensation.bankCode}:${accountNumber}`);
    } catch (caught) {
      setAccountResolveError(
        caught instanceof Error
          ? caught.message
          : "Could not verify this account.",
      );
    } finally {
      setAccountResolving(false);
    }
  };
  const continueCompensation = async () => {
    setCompensationValidationVisible(true);
    setCompensationApiError("");
    if (!compensationComplete) return;
    if (submittedCompensationSignature === compensationSignature) {
      setCompensationValidationVisible(false);
      goNext("compensation", "location");
      return;
    }
    setCompensationSubmitting(true);
    try {
      const payload: TutorCompensationInput =
        personalForm.country === "GB"
          ? {
              account_number: compensation.accountNumber.trim(),
              country: "uk",
              first_name: compensation.firstName.trim(),
              last_name: compensation.lastName.trim(),
              sort_code: compensation.sortCode.replace(/\D/g, ""),
            }
          : {
              account_name: compensation.accountName,
              account_number: compensation.accountNumber,
              bank_code: compensation.bankCode,
              bank_name: compensation.bankName,
              country: "nigeria",
            };
      await saveTutorCompensation(payload);
      setSubmittedCompensationSignature(compensationSignature);
    } catch (caught) {
      setCompensationApiError(
        caught instanceof Error
          ? caught.message
          : "Could not save compensation details.",
      );
      return;
    } finally {
      setCompensationSubmitting(false);
    }
    setCompensationValidationVisible(false);
    goNext("compensation", "location");
  };
  const editReview = (section: SetupStage) => {
    setReviewConfirmed(false);
    setReviewData(null);
    setReviewError("");
    setReviewLoading(true);
    setReturnToReview(true);
    setStage(section);
    if (section === "location")
      location.setView(locationSummary ? "edit" : "prompt");
  };
  const submitReview = async () => {
    if (!reviewConfirmed || !reviewData?.is_complete || consentSubmitting || applicationSubmitted) return;
    setConsentSubmitting(true);
    setSubmissionMessage("");
    try {
      const message = await submitTutorOnboardingConsent();
      setSubmissionMessage(message);
      setApplicationSubmitted(true);
      setReviewConfirmed(false);
    } catch (caught) {
      setSubmissionMessage(caught instanceof Error ? caught.message : "Tutor application could not be submitted.");
    } finally {
      setConsentSubmitting(false);
    }
  };

  const activeSetupStage =
    stage !== "overview" && stage !== "review" ? stage : null;
  const stageIndex = activeSetupStage
    ? stages.findIndex((item) => item.id === activeSetupStage)
    : -1;

  return (
    <main className="flex min-h-[100svh] flex-col bg-white text-[#171c2a]">
      <OnboardingNavbar
        email={sessionUser?.email ?? ""}
        name={sessionUser?.firstName ?? ""}
      />
      <section className="flex min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-[var(--dashboard-gutter)] lg:py-3">
        {stage === "overview" ? (
          <div className="mx-auto flex w-full max-w-[34rem] flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold text-[#1d2331] sm:text-3xl">
              Welcome {displayName}!
            </h1>
            <p className="mt-2 text-sm font-medium text-[#8a93a7]">
              Complete your tutor verification to start receiving bookings and
              payments.
            </p>
            <div className="mt-6 w-full max-w-[23rem] space-y-2.5 text-left">
              {stages.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d9e4ef] bg-[#edf6fd] px-4 text-xs font-semibold text-[#35405a]"
                    key={item.id}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#4039bd] text-white">
                      <Icon size={13} />
                    </span>
                    {item.label}
                  </div>
                );
              })}
            </div>
            <button
              className="mt-7 h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white"
              onClick={startSetup}
              type="button"
            >
              Let&apos;s get started
            </button>
          </div>
        ) : stage === "review" ? (
          <div className="mx-auto w-full max-w-[40rem]">
            {submissionMessage ? <p className={`mb-3 rounded-xl border px-4 py-3 text-sm font-medium ${applicationSubmitted ? "border-[#bde8d0] bg-[#effaf4] text-[#20784d]" : "border-[#f0d6b5] bg-[#fff9f1] text-[#8b5a20]"}`} role="status">{submissionMessage}</p> : null}
            {reviewLoading ? <div className="py-16 text-center text-sm font-medium text-[#8a93a7]">Loading your saved application…</div> : null}
            {!reviewLoading && reviewError ? <div className="flex flex-col items-center gap-3 py-16 text-center" role="alert"><p className="text-sm font-medium text-brand-danger">{reviewError}</p><button className="h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white" onClick={() => { setReviewLoading(true); setReviewError(""); setReviewRefreshKey((current) => current + 1); }} type="button">Try again</button></div> : null}
            {!reviewLoading && reviewData ? <TutorReviewStep confirmed={reviewConfirmed} onConfirmedChange={(value) => { setReviewConfirmed(value); setSubmissionMessage(""); }} onEdit={editReview} review={reviewData} /> : null}
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[75rem] items-start justify-center gap-8 xl:gap-16">
            <StepList
              active={stage}
              completed={completed}
              onSelect={setStage}
            />
            <section className="w-full max-w-[42rem]">
              {stage === "personal" ? (
                <>
                  <h1 className="text-xl font-bold text-[#252c3c]">
                    Personal information
                  </h1>
                  {personalApiError ? <p className="mt-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-sm font-medium text-[#8b5a20]" role="alert">{personalApiError}</p> : null}
                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
                    <label>
                      <FieldLabel>First name</FieldLabel>
                      <input
                        aria-invalid={validationVisible && !firstName.trim()}
                        className={fieldClassName}
                        onChange={(e) =>
                          updatePersonal("firstName", e.target.value)
                        }
                        value={firstName}
                      />
                      <InlineFieldError
                        show={validationVisible && !firstName.trim()}
                      >
                        Enter your first name.
                      </InlineFieldError>
                    </label>
                    <label>
                      <FieldLabel>Last name</FieldLabel>
                      <input
                        aria-invalid={validationVisible && !lastName.trim()}
                        className={fieldClassName}
                        onChange={(e) =>
                          updatePersonal("lastName", e.target.value)
                        }
                        value={lastName}
                      />
                      <InlineFieldError
                        show={validationVisible && !lastName.trim()}
                      >
                        Enter your last name.
                      </InlineFieldError>
                    </label>
                    <label>
                      <FieldLabel optional>Other name</FieldLabel>
                      <input
                        className={fieldClassName}
                        onChange={(e) =>
                          updatePersonal("otherName", e.target.value)
                        }
                        value={personalForm.otherName}
                      />
                    </label>
                    <label>
                      <FieldLabel optional>Date of birth</FieldLabel>
                      <input
                        className={fieldClassName}
                        onChange={(e) =>
                          updatePersonal("dateOfBirth", e.target.value)
                        }
                        type="date"
                        value={personalForm.dateOfBirth}
                      />
                    </label>
                    <label>
                      <FieldLabel>Email</FieldLabel>
                      <input
                        aria-invalid={validationVisible && !emailValid}
                        className={`${fieldClassName} ${sessionUser?.email ? "cursor-not-allowed bg-[#f5f7fb]" : ""}`}
                        onChange={(e) =>
                          updatePersonal("email", e.target.value)
                        }
                        readOnly={Boolean(sessionUser?.email)}
                        type="email"
                        value={email}
                      />
                      <InlineFieldError show={validationVisible && !emailValid}>
                        Enter a valid email address.
                      </InlineFieldError>
                    </label>
                    <label>
                      <FieldLabel>Phone number</FieldLabel>
                      <span
                        className={`mt-1.5 flex h-11 rounded-lg border bg-white focus-within:border-[#6d63ee] ${validationVisible && !phoneValid ? "border-brand-danger" : "border-[#d8dde8]"}`}
                      >
                        <SelectMenu
                          ariaLabel="Phone country code"
                          buttonClassName="!h-[2.65rem] !rounded-r-none !border-0 !bg-[#f7f8fc] !px-2.5 !text-xs !shadow-none focus:!ring-0"
                          className="w-[8rem] shrink-0"
                          onChange={(value) =>
                            {
                              setPersonalApiError("");
                              setPhoneCountry(value as CountryCode);
                            }
                          }
                          options={phoneCountries.map((country) => ({
                            label: `${country.iso} ${country.callingCode} - ${country.country}`,
                            value: country.iso,
                          }))}
                          placeholder="Code"
                          value={phoneCountry}
                        />
                        <input
                          className="min-w-0 flex-1 rounded-r-lg px-3.5 text-sm outline-none"
                          onChange={(e) =>
                            updatePersonal("phoneNumber", e.target.value)
                          }
                          placeholder="Phone number"
                          type="tel"
                          value={personalForm.phoneNumber}
                        />
                      </span>
                      <InlineFieldError show={validationVisible && !phoneValid}>
                        Enter a valid phone number for the selected country
                        code.
                      </InlineFieldError>
                    </label>
                    <label className="sm:col-span-2">
                      <FieldLabel>
                        Country where you&apos;ll provide tutoring services
                      </FieldLabel>
                      <SelectField
                        ariaInvalid={validationVisible && !personalForm.country}
                        onChange={(value) =>
                          changeCountry(value as OperatingCountry)
                        }
                        options={[
                          { label: "Nigeria", value: "NG" },
                          { label: "United Kingdom", value: "GB" },
                        ]}
                        placeholder="Select country"
                        value={personalForm.country}
                      />
                      <InlineFieldError
                        show={validationVisible && !personalForm.country}
                      >
                        Select the country where you will provide tutoring.
                      </InlineFieldError>
                    </label>
                    <label>
                      <FieldLabel>Occupation</FieldLabel>
                      <input
                        aria-invalid={
                          validationVisible && !personalForm.occupation.trim()
                        }
                        className={fieldClassName}
                        onChange={(e) =>
                          updatePersonal("occupation", e.target.value)
                        }
                        value={personalForm.occupation}
                      />
                      <InlineFieldError
                        show={
                          validationVisible && !personalForm.occupation.trim()
                        }
                      >
                        Enter your occupation.
                      </InlineFieldError>
                    </label>
                    <label>
                      <FieldLabel>Highest qualification</FieldLabel>
                      <input
                        aria-invalid={
                          validationVisible &&
                          !personalForm.qualification.trim()
                        }
                        className={fieldClassName}
                        onChange={(e) =>
                          updatePersonal("qualification", e.target.value)
                        }
                        value={personalForm.qualification}
                      />
                      <InlineFieldError
                        show={
                          validationVisible &&
                          !personalForm.qualification.trim()
                        }
                      >
                        Enter your highest qualification.
                      </InlineFieldError>
                    </label>
                    <label className="sm:col-span-2">
                      <FieldLabel>Teaching or tutoring experience</FieldLabel>
                      <textarea
                        aria-invalid={
                          validationVisible &&
                          personalForm.experience.trim().length < 10
                        }
                        className="mt-1.5 h-20 w-full resize-none rounded-lg border border-[#d8dde8] px-3.5 py-2.5 text-sm outline-none aria-[invalid=true]:border-brand-danger"
                        maxLength={500}
                        onChange={(e) =>
                          updatePersonal("experience", e.target.value)
                        }
                        placeholder="Tell us why you are the perfect tutor for the job."
                        value={personalForm.experience}
                      />
                      <span className="mt-0.5 flex justify-between text-xs text-[#8a93a7]">
                        <span>Bio must be at least 10 characters</span>
                        <span>{personalForm.experience.length}/500</span>
                      </span>
                      <InlineFieldError
                        show={
                          validationVisible &&
                          personalForm.experience.trim().length < 10
                        }
                      >
                        Describe your tutoring experience using at least 10
                        characters.
                      </InlineFieldError>
                    </label>
                  </div>
                </>
              ) : stage === "identity" ? (
                <>
                  <h1 className="text-xl font-bold text-[#252c3c]">
                    Identification verification
                  </h1>
                  {personalForm.country === "GB" ? (
                    <div className="mt-5 grid gap-4">
                      <label>
                        <span className="mb-2 block border-b border-[#e8ebf2] pb-1 text-xs font-semibold text-[#6f778c]">
                          Right to work (UK)
                        </span>
                        <FieldLabel>Employer share code</FieldLabel>
                        <input
                          aria-invalid={
                            identityValidationVisible && !shareCode.trim()
                          }
                          className={fieldClassName}
                          onChange={(e) => setShareCode(e.target.value)}
                          placeholder="Enter employer share code"
                          value={shareCode}
                        />
                        <InlineFieldError
                          show={identityValidationVisible && !shareCode.trim()}
                        >
                          Enter your employer share code.
                        </InlineFieldError>
                        <span className="mt-1 block text-xs text-[#8a93a7]">
                          Generate your share code from the UK government
                          website to confirm your right to work.
                        </span>
                      </label>
                      <label>
                        <span className="mb-2 block border-b border-[#e8ebf2] pb-1 text-xs font-semibold text-[#6f778c]">
                          Background check
                        </span>
                        <FieldLabel>DBS certificate number</FieldLabel>
                        <input
                          aria-invalid={
                            identityValidationVisible && !dbsNumber.trim()
                          }
                          className={fieldClassName}
                          onChange={(e) => setDbsNumber(e.target.value)}
                          placeholder="Enter DBS certificate number"
                          value={dbsNumber}
                        />
                        <InlineFieldError
                          show={identityValidationVisible && !dbsNumber.trim()}
                        >
                          Enter your DBS certificate number.
                        </InlineFieldError>
                        <span className="mt-1 block text-xs text-[#8a93a7]">
                          Provide your Disclosure and Barring Service (DBS)
                          certificate number for background verification.
                        </span>
                      </label>
                    </div>
                  ) : null}
                  <div className="mt-5 grid gap-4">
                    <label>
                      <span className="mb-2 block border-b border-[#e8ebf2] pb-1 text-xs font-semibold text-[#6f778c]">
                        Identification type
                      </span>
                      <FieldLabel>ID type</FieldLabel>
                      <SelectField
                        ariaInvalid={identityValidationVisible && !idType}
                        onChange={setIdType}
                        options={(personalForm.country === "GB"
                          ? ["Passport", "Driver's licence"]
                          : [
                              "NIN",
                              "Passport",
                              "Voter's card",
                              "Driver's licence",
                            ]
                        ).map((type) => ({ label: type, value: type }))}
                        placeholder="Select ID type"
                        value={idType}
                      />
                      <InlineFieldError
                        show={identityValidationVisible && !idType}
                      >
                        Select an identification type.
                      </InlineFieldError>
                      <span className="mt-1 block text-xs text-[#8a93a7]">
                        Accepted:{" "}
                        {personalForm.country === "GB"
                          ? "Passport or Driver's Licence"
                          : "NIN, Passport, Voter's Card, or Driver's Licence"}
                      </span>
                    </label>
                    <label>
                      <FieldLabel>Upload ID documents</FieldLabel>
                      <span
                        className={`mt-1.5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-[#fbfcff] ${identityValidationVisible && idFiles.length === 0 ? "border-brand-danger" : "border-[#cfd5e2]"}`}
                      >
                        <UploadCloud className="h-6 w-6 text-[#5652d2]" />
                        <span className="mt-2 text-sm font-semibold text-[#5652d2]">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-[#9299a9]">
                          Upload 1–5 JPG, PNG, WEBP, or PDF files
                        </span>
                        <input
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="sr-only"
                          multiple
                          onChange={(event) => {
                            handleFiles(event.target.files);
                            event.target.value = "";
                          }}
                          type="file"
                        />
                      </span>
                      <InlineFieldError
                        show={identityValidationVisible && idFiles.length === 0}
                      >
                        Upload at least one identity document.
                      </InlineFieldError>
                    </label>
                    {fileError ? (
                      <p className="text-sm text-brand-danger">{fileError}</p>
                    ) : null}
                    {idFiles.length ? (
                      <div className="space-y-2">
                        {idFiles.map((file) => (
                          <div
                            className="flex items-center justify-between gap-3 rounded-xl border border-[#d9d7fb] bg-[#faf9ff] px-4 py-3 text-sm"
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                          >
                            <span className="min-w-0 truncate">
                              {file.name}
                            </span>
                            <button
                              className="shrink-0 font-semibold text-brand-danger"
                              onClick={() => {
                                setIdFiles((current) =>
                                  current.filter(
                                    (candidate) => candidate !== file,
                                  ),
                                );
                                setIdentityApiError("");
                              }}
                              type="button"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {identityApiError ? (
                    <p
                      className="mt-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-sm font-medium text-[#8b5a20]"
                      role="alert"
                    >
                      {identityApiError}
                    </p>
                  ) : null}
                </>
              ) : stage === "compensation" ? (
                <>
                  <h1 className="text-xl font-bold text-[#252c3c]">
                    Payment details
                  </h1>
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {personalForm.country === "GB" ? (
                      <>
                        <label>
                          <FieldLabel>First name</FieldLabel>
                          <input
                            aria-invalid={
                              compensationValidationVisible &&
                              !compensation.firstName.trim()
                            }
                            className={fieldClassName}
                            onChange={(e) =>
                              updateCompensation("firstName", e.target.value)
                            }
                            value={compensation.firstName}
                          />
                          <InlineFieldError
                            show={
                              compensationValidationVisible &&
                              !compensation.firstName.trim()
                            }
                          >
                            Enter the account holder&apos;s first name.
                          </InlineFieldError>
                        </label>
                        <label>
                          <FieldLabel>Last name</FieldLabel>
                          <input
                            aria-invalid={
                              compensationValidationVisible &&
                              !compensation.lastName.trim()
                            }
                            className={fieldClassName}
                            onChange={(e) =>
                              updateCompensation("lastName", e.target.value)
                            }
                            value={compensation.lastName}
                          />
                          <InlineFieldError
                            show={
                              compensationValidationVisible &&
                              !compensation.lastName.trim()
                            }
                          >
                            Enter the account holder&apos;s last name.
                          </InlineFieldError>
                        </label>
                        <label>
                          <FieldLabel>Account number</FieldLabel>
                          <input
                            aria-invalid={
                              compensationValidationVisible &&
                              compensation.accountNumber.trim().length < 8
                            }
                            className={fieldClassName}
                            inputMode="numeric"
                            onChange={(e) =>
                              updateCompensation(
                                "accountNumber",
                                e.target.value,
                              )
                            }
                            value={compensation.accountNumber}
                          />
                          <InlineFieldError
                            show={
                              compensationValidationVisible &&
                              compensation.accountNumber.trim().length < 8
                            }
                          >
                            Enter an account number with at least 8 digits.
                          </InlineFieldError>
                        </label>
                        <label>
                          <FieldLabel>Sort code</FieldLabel>
                          <input
                            aria-invalid={
                              compensationValidationVisible &&
                              compensation.sortCode.replace(/\D/g, "")
                                .length !== 6
                            }
                            className={fieldClassName}
                            inputMode="numeric"
                            onChange={(e) =>
                              updateCompensation("sortCode", e.target.value)
                            }
                            placeholder="00-00-00"
                            value={compensation.sortCode}
                          />
                          <InlineFieldError
                            show={
                              compensationValidationVisible &&
                              compensation.sortCode.replace(/\D/g, "")
                                .length !== 6
                            }
                          >
                            Enter a valid 6-digit sort code.
                          </InlineFieldError>
                        </label>
                      </>
                    ) : (
                      <>
                        <div>
                          <FieldLabel>Bank name</FieldLabel>
                          <SelectField
                            ariaInvalid={
                              compensationValidationVisible &&
                              !compensation.bankCode
                            }
                            onChange={selectBank}
                            options={banks.map((bank) => ({
                              label: bank.name,
                              value: bank.code,
                            }))}
                            placeholder={
                              banksLoading ? "Loading banks..." : "Select bank"
                            }
                            searchable
                            searchPlaceholder="Search banks"
                            value={compensation.bankCode}
                          />
                          <InlineFieldError
                            show={
                              compensationValidationVisible &&
                              !compensation.bankCode
                            }
                          >
                            Select your bank.
                          </InlineFieldError>
                          {banksError ? (
                            <div
                              className="mt-1 flex items-center gap-2 text-xs font-medium text-brand-danger"
                              role="alert"
                            >
                              <span>{banksError}</span>
                              <button
                                className="font-bold underline underline-offset-2"
                                onClick={() =>
                                  setBanksRetry((value) => value + 1)
                                }
                                type="button"
                              >
                                Try again
                              </button>
                            </div>
                          ) : null}
                        </div>
                        <label>
                          <FieldLabel>Account number</FieldLabel>
                          <input
                            aria-invalid={
                              compensationValidationVisible &&
                              compensation.accountNumber.replace(/\D/g, "")
                                .length !== 10
                            }
                            className={fieldClassName}
                            inputMode="numeric"
                            maxLength={10}
                            onChange={(e) =>
                              changeNigerianAccountNumber(e.target.value)
                            }
                            placeholder="10-digit account number"
                            value={compensation.accountNumber}
                          />
                          <InlineFieldError
                            show={
                              compensationValidationVisible &&
                              compensation.accountNumber.replace(/\D/g, "")
                                .length !== 10
                            }
                          >
                            Enter a valid 10-digit account number.
                          </InlineFieldError>
                        </label>
                        <div className="sm:col-span-2">
                          <button
                            className="h-10 rounded-full border border-brand-primary px-5 text-sm font-semibold text-brand-primary transition hover:bg-brand-primary-soft disabled:cursor-not-allowed disabled:border-[#c8cad5] disabled:text-[#9ca1b2]"
                            disabled={
                              accountResolving ||
                              !compensation.bankCode ||
                              compensation.accountNumber.length !== 10
                            }
                            onClick={() => void resolveNigerianAccount()}
                            type="button"
                          >
                            {accountResolving
                              ? "Verifying..."
                              : "Verify account"}
                          </button>
                          {accountResolveError ? (
                            <p
                              className="mt-2 text-xs font-medium text-brand-danger"
                              role="alert"
                            >
                              {accountResolveError}
                            </p>
                          ) : null}
                        </div>
                        <label className="sm:col-span-2">
                          <FieldLabel>Account holder name</FieldLabel>
                          <input
                            aria-invalid={
                              compensationValidationVisible &&
                              !compensation.accountName.trim()
                            }
                            className={`${fieldClassName} bg-[#f5f6f9]`}
                            placeholder="Verified account name will appear here"
                            readOnly
                            value={compensation.accountName}
                          />
                          <InlineFieldError
                            show={
                              compensationValidationVisible &&
                              !compensation.accountName.trim()
                            }
                          >
                            Verify the bank account to continue.
                          </InlineFieldError>
                        </label>
                      </>
                    )}
                  </div>
                  {compensationApiError ? (
                    <p
                      className="mt-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-sm font-medium text-[#8b5a20]"
                      role="alert"
                    >
                      {compensationApiError}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  {location.view === "prompt" ? (
                    <StepTwoLocationPrompt
                      locationError={location.error}
                      onAllowLocation={location.requestCurrentLocation}
                      onEnterAddress={() => location.openSearch()}
                      requestingLocation={location.requestingLocation}
                      variant="tutor"
                    />
                  ) : (
                    <StepTwoAddressConfirm
                      addressForm={location.address}
                      coordinates={location.coordinates}
                      locationError={location.error}
                      mode={location.view}
                      onAddressFieldChange={location.changeAddress}
                      onMapLocationChange={location.moveMap}
                      onPlaceQueryChange={location.changeQuery}
                      onSelectPlace={location.selectPlace}
                      placePredictions={location.predictions}
                      placeQuery={location.query}
                      requestingPlaceSearch={location.requestingSearch}
                      resolvingMapLocation={location.resolvingMap}
                    />
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </section>

      {stage !== "overview" ? (
        <footer className="shrink-0 border-t border-[#e5e8f2] bg-white px-4 py-2 sm:px-[var(--dashboard-gutter)]">
          <div className="mx-auto flex w-full max-w-[var(--dashboard-max-width)] items-center justify-between gap-3">
            <span className="rounded-full border border-[#6d63ee] px-2.5 py-1 text-xs font-semibold text-[#5b4ded]">
              {stage === "review" ? "Review" : `Step ${stageIndex + 1}/4`}
            </span>
            <div className="flex items-center gap-2">
              {submissionMessage && stage !== "review" ? (
                <span className="hidden text-xs font-medium text-[#8b5a20] sm:inline">
                  {submissionMessage}
                </span>
              ) : null}
              <button
                className="h-11 rounded-full border border-[#d8dde8] bg-white px-5 text-sm font-semibold"
                onClick={() => {
                  if (returnToReview && stage !== "review") {
                    setReturnToReview(false);
                    setStage("review");
                  } else if (stage === "review") setStage("location");
                  else if (stage === "personal")
                    router.push("/students/dashboard");
                  else if (stage === "identity") setStage("personal");
                  else if (stage === "compensation") setStage("identity");
                  else if (location.view === "prompt") setStage("compensation");
                  else location.goBack();
                }}
                type="button"
              >
                {stage === "personal" ? "Cancel" : "Back"}
              </button>
              {stage === "personal" ? (
                <button
                  className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b8b6cf]"
                  disabled={personalSubmitting}
                  onClick={() => void continuePersonal()}
                  type="button"
                >
                  {personalSubmitting ? "Saving..." : "Continue"}
                </button>
              ) : stage === "identity" ? (
                <button
                  className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b8b6cf]"
                  disabled={identitySubmitting}
                  onClick={() => void continueIdentity()}
                  type="button"
                >
                  {identitySubmitting ? "Submitting..." : "Continue"}
                </button>
              ) : stage === "compensation" ? (
                <button
                  className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#b8b6cf]"
                  disabled={compensationSubmitting}
                  onClick={() => void continueCompensation()}
                  type="button"
                >
                  {compensationSubmitting ? "Saving..." : "Continue"}
                </button>
              ) : stage === "location" ? (
                location.view === "prompt" ? (
                  <>
                    <button
                      className="h-11 rounded-full border border-[#d8dde8] px-5 text-sm font-semibold"
                      onClick={() => {
                        setLocationSummary(null);
                        markCompleted("location");
                        setStage("review");
                        setReturnToReview(false);
                      }}
                      type="button"
                    >
                      Skip
                    </button>
                  </>
                ) : location.view === "search" ? null : (
                  <>
                    <button
                      className="h-11 rounded-full border border-[#d8dde8] px-5 text-sm font-semibold"
                      onClick={
                        location.view === "edit"
                          ? location.goBack
                          : location.openEdit
                      }
                      type="button"
                    >
                      {location.view === "edit" ? "Cancel" : "No, edit address"}
                    </button>
                    <button
                      className="h-11 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:bg-[#b8b6cf]"
                      disabled={
                        !location.complete ||
                        location.saving ||
                        location.resolvingMap
                      }
                      onClick={() => void location.confirm()}
                      type="button"
                    >
                      {location.saving
                        ? "Saving..."
                        : "Yes, this is my address"}
                    </button>
                  </>
                )
              ) : (
                <button
                  className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white disabled:bg-[#b8b6cf]"
                  disabled={!reviewConfirmed || !reviewData?.is_complete || consentSubmitting || applicationSubmitted}
                  onClick={() => void submitReview()}
                  type="button"
                >
                  {applicationSubmitted ? "Application submitted" : consentSubmitting ? "Submitting..." : "Finish setup"}
                </button>
              )}
            </div>
          </div>
        </footer>
      ) : null}
    </main>
  );
}
