"use client";

import {
  BadgeCheck,
  Clock3,
  CircleDollarSign,
  FileCheck2,
  Globe2,
  LoaderCircle,
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
import { useEffect, useMemo, useRef, useState } from "react";

import { setAuthSession, useSessionUser } from "../../auth/authSession";
import { fetchAuthenticatedProfile } from "../../auth/profile";
import { OnboardingNavbar } from "../../signup/OnboardingNavbar";
import { StepTwoAddressConfirm } from "../../signup/profile-setup/StepTwoAddressConfirm";
import { StepTwoLocationPrompt } from "../../signup/profile-setup/StepTwoLocationPrompt";
import { Notice } from "../../ui/Notice";
import { SelectMenu } from "../../ui/SelectMenu";
import { TutorDocumentLink, TutorLocalDocumentLink } from "./TutorDocumentLink";
import { TutorReviewStep } from "./TutorReviewStep";
import { useTutorLocationSetup } from "./useTutorLocationSetup";
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
} from "./tutorOnboarding";

type Stage =
  "overview" | "personal" | "identity" | "compensation" | "location" | "review";
type SetupStage = Exclude<Stage, "overview" | "review">;
type OperatingCountry = "NG" | "GB" | "";
type StripeReturnOutcome = "" | "ready" | "received";
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
  accountNumber: string;
};

const stages = [
  { id: "personal", label: "Personal information", icon: UserRound },
  { id: "location", label: "Location access", icon: MapPin },
  { id: "identity", label: "Identification verification", icon: FileCheck2 },
  { id: "compensation", label: "Compensation details", icon: CircleDollarSign },
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

function normalizeRightToWorkShareCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 9);
}

function formatRightToWorkShareCode(value: string) {
  return normalizeRightToWorkShareCode(value).match(/.{1,3}/g)?.join("-") ?? "";
}

function formatDateForBackend(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

function formatDateForInput(value?: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function getMaximumTutorDob() {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  const year = cutoff.getFullYear();
  const month = String(cutoff.getMonth() + 1).padStart(2, "0");
  const day = String(cutoff.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getOperatingCountry(review: TutorOnboardingReview): OperatingCountry {
  const locationCountry = review.location?.country_code?.trim().toUpperCase();
  if (locationCountry === "NG" || locationCountry === "GB") return locationCountry;
  return "";
}

function getSavedCompensationCountry(
  compensation: TutorOnboardingReview["compensation"],
): OperatingCountry {
  if (!compensation) return "";

  const countryCode = compensation.country_code?.trim().toUpperCase();
  const namedCountry = compensation.country?.trim().toLowerCase();
  const countryFromCode = countryCode === "NG"
    ? "NG"
    : countryCode === "GB"
      ? "GB"
      : "";
  const countryFromName = namedCountry === "nigeria"
    ? "NG"
    : namedCountry === "uk"
      ? "GB"
      : "";

  if (countryFromCode && countryFromName && countryFromCode !== countryFromName) {
    return "";
  }
  return countryFromCode || countryFromName;
}

function clearStripeCallbackParameter() {
  const cleanUrl = new URL(window.location.href);
  cleanUrl.searchParams.delete("stripe");
  window.history.replaceState(
    window.history.state,
    "",
    `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`,
  );
}

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
          const selectable = done || current || index < activeIndex;
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
  const [stripeStatusChecking, setStripeStatusChecking] = useState(false);
  const [stripeStatusPending, setStripeStatusPending] = useState(false);
  const [stripeReturnOutcome, setStripeReturnOutcome] =
    useState<StripeReturnOutcome>("");
  const [stripeReturnAcknowledged, setStripeReturnAcknowledged] =
    useState(false);
  const [locationCountryError, setLocationCountryError] = useState("");
  const [unsupportedTutorLocation, setUnsupportedTutorLocation] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const [consentSubmitting, setConsentSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [personalSubmitting, setPersonalSubmitting] = useState(false);
  const [personalSaveError, setPersonalSaveError] = useState("");
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
  const [identitySaveError, setIdentitySaveError] = useState("");
  const [submittedIdentitySignature, setSubmittedIdentitySignature] =
    useState("");
  const [compensation, setCompensation] = useState<CompensationForm>({
    bankCode: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
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
  const [compensationSaveError, setCompensationSaveError] = useState("");
  const [submittedCompensationSignature, setSubmittedCompensationSignature] =
    useState("");
  const hasLoadedTutorPersonalDetails = useRef(false);
  const hasHandledStripeCallback = useRef(false);
  const firstName = personalForm.firstName ?? sessionUser?.firstName ?? "";
  const lastName = personalForm.lastName ?? sessionUser?.lastName ?? "";
  const email = personalForm.email ?? sessionUser?.email ?? "";
  const maximumTutorDob = useMemo(() => getMaximumTutorDob(), []);
  const parsedPhone = parsePhoneNumberFromString(
    personalForm.phoneNumber.trim(),
    phoneCountry,
  );
  const phoneValid = parsedPhone?.isValid() ?? false;
  const phoneCountryMismatch = Boolean(
    personalForm.country && phoneCountry !== personalForm.country,
  );
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const dobValid = Boolean(
    personalForm.dateOfBirth && personalForm.dateOfBirth <= maximumTutorDob,
  );
  const personalComplete = Boolean(
    firstName.trim() &&
    lastName.trim() &&
    dobValid &&
    emailValid &&
    phoneValid &&
    personalForm.occupation.trim() &&
    personalForm.qualification.trim() &&
    personalForm.experience.trim().length >= 10,
  );
  const personalPayload: TutorPersonalDetailsInput = {
    bio: personalForm.experience.trim(),
    country_code: `+${getCountryCallingCode(phoneCountry)}`,
    dob: formatDateForBackend(personalForm.dateOfBirth),
    email: email.trim(),
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    occupation: personalForm.occupation.trim(),
    phone_number: parsedPhone?.nationalNumber ?? "",
    qualifications: personalForm.qualification
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    ...(personalForm.otherName.trim() ? { other_names: personalForm.otherName.trim() } : {}),
  };
  const personalSignature = JSON.stringify(personalPayload);
  const expectedBackendCountry = personalForm.country === "NG"
    ? "nigeria"
    : personalForm.country === "GB"
      ? "uk"
      : "";
  const savedIdentityMatchesCountry = Boolean(
    expectedBackendCountry &&
    reviewData?.identification?.country === expectedBackendCountry,
  );
  const savedIdentityDocuments = savedIdentityMatchesCountry
    ? reviewData?.documents.filter(
        (document) => document.purpose === "identification",
      ) ?? []
    : [];
  const hasIdentityDocuments = idFiles.length > 0 || savedIdentityDocuments.length > 0;
  const identitySignature = JSON.stringify({
    country: personalForm.country,
    dbsNumber: dbsNumber.trim(),
    files: idFiles.map((file) => [file.name, file.size, file.lastModified]),
    idType,
    shareCode: normalizeRightToWorkShareCode(shareCode),
  });
  const savedIdentitySignature = JSON.stringify({
    country: personalForm.country,
    dbsNumber: dbsNumber.trim(),
    files: [],
    idType,
    shareCode: normalizeRightToWorkShareCode(shareCode),
  });
  const editingSavedIdentity = Boolean(
    submittedIdentitySignature && submittedIdentitySignature !== identitySignature,
  );
  const identityDocumentRequired =
    !hasIdentityDocuments ||
    (savedIdentityDocuments.length > 0 && editingSavedIdentity && idFiles.length === 0);
  const dbsNumberValid = /^\d{12}$/.test(dbsNumber.trim());
  const shareCodeValid = /^W[A-Z0-9]{8}$/.test(
    normalizeRightToWorkShareCode(shareCode),
  );
  const identityComplete = Boolean(
    personalForm.country &&
    idType &&
    !identityDocumentRequired &&
    idFiles.length <= 5 &&
    (personalForm.country !== "GB" || (shareCodeValid && dbsNumberValid)),
  );
  const compensationComplete =
    personalForm.country === "GB"
      ? true
      : personalForm.country === "NG" && Boolean(
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
  const hasSavedApplication = Boolean(
    reviewData?.personal_details ||
    reviewData?.identification ||
    reviewData?.compensation,
  );

  const markCompleted = (item: SetupStage) =>
    setCompleted((current) =>
      current.includes(item) ? current : [...current, item],
    );
  const unmarkCompleted = (...items: SetupStage[]) =>
    setCompleted((current) => current.filter((item) => !items.includes(item)));
  const goNext = (current: SetupStage, next: Stage) => {
    markCompleted(current);
    if (returnToReview) {
      setReviewLoading(true);
      setReviewError("");
    }
    setStage(returnToReview ? "review" : next);
    setReturnToReview(false);
  };
  const goToRequiredLocation = () => {
    setReturnToReview(false);
    setSubmissionMessage("");
    setLocationCountryError("");
    setStage("location");
  };
  const updatePersonal = <K extends keyof PersonalForm>(
    field: K,
    value: PersonalForm[K],
  ) => {
    setPersonalSaveError("");
    setPersonalForm((current) => ({ ...current, [field]: value }));
  };
  const changeCountry = (country: OperatingCountry) => {
    if (country !== personalForm.country) {
      setShareCode("");
      setDbsNumber("");
      setIdType("");
      setIdFiles([]);
      setFileError("");
      setIdentitySaveError("");
      setSubmittedIdentitySignature("");
      setCompensation({
        bankCode: "",
        bankName: "",
        accountName: "",
        accountNumber: "",
      });
      setVerifiedAccountSignature("");
      setAccountResolveError("");
      setCompensationSaveError("");
      setSubmittedCompensationSignature("");
      unmarkCompleted("identity", "compensation");
    }
    updatePersonal("country", country);
  };
  const location = useTutorLocationSetup(() => {
    setReviewLoading(true);
    setReviewError("");
    setLocationCountryError("");
    setUnsupportedTutorLocation(false);
    void getTutorOnboardingReview()
      .then((data) => {
        setReviewData(data);
        const verifiedCountry = getOperatingCountry(data);
        if (!verifiedCountry) {
          setUnsupportedTutorLocation(true);
          setLocationCountryError(
            "Tutor sign-up is coming soon to your country.",
          );
          return;
        }
        setUnsupportedTutorLocation(false);
        const countryChanged = Boolean(
          personalForm.country && personalForm.country !== verifiedCountry,
        );
        changeCountry(verifiedCountry);
        if (countryChanged) {
          markCompleted("location");
          setReturnToReview(false);
          setStage("identity");
        } else {
          goNext("location", "identity");
        }
      })
      .catch((caught: unknown) => {
        setLocationCountryError(
          caught instanceof Error
            ? caught.message
            : "Your saved location country could not be confirmed.",
        );
      })
      .finally(() => setReviewLoading(false));
  });
  const loadSavedLocation = location.loadSavedLocation;

  useEffect(() => {
    if (hasHandledStripeCallback.current) return;
    const stripeAction = new URLSearchParams(window.location.search).get("stripe");
    if (stripeAction !== "return" && stripeAction !== "refresh") return;
    hasHandledStripeCallback.current = true;
    let cancelled = false;
    let retryTimer: number | undefined;
    const callbackController = new AbortController();

    const callbackTimer = window.setTimeout(() => {
      if (stripeAction === "return") {
        setStage("review");
        setReviewLoading(true);
        setStripeStatusChecking(true);
        setStripeStatusPending(false);
        setStripeReturnOutcome("");
        setStripeReturnAcknowledged(false);
        void (async () => {
          try {
            for (let attempt = 0; attempt < 6; attempt += 1) {
              const data = await getTutorOnboardingReview(
                callbackController.signal,
              );
              if (cancelled) return;
              setReviewData(data);
              setReviewError("");

              const verifiedCountry = getOperatingCountry(data);
              if (verifiedCountry) {
                setPersonalForm((current) => ({
                  ...current,
                  country: verifiedCountry,
                }));
              }

              const stripeCompensationReady =
                verifiedCountry === "GB" &&
                getSavedCompensationCountry(data.compensation) === "GB" &&
                !data.missing_steps.includes("compensation");
              if (stripeCompensationReady) {
                setStripeStatusPending(false);
                setStripeReturnOutcome(
                  data.compensation?.stripe_payouts_enabled
                    ? "ready"
                    : "received",
                );
                clearStripeCallbackParameter();
                setReviewRefreshKey((current) => current + 1);
                return;
              }

              if (attempt < 5) {
                await new Promise<void>((resolve) => {
                  retryTimer = window.setTimeout(resolve, 2_000);
                });
              } else {
                setStripeStatusPending(true);
              }
            }
          } catch {
            if (!cancelled) setStripeStatusPending(true);
          } finally {
            if (!cancelled) {
              setStripeStatusChecking(false);
              setReviewLoading(false);
            }
          }
        })();
        return;
      }

      setStage("compensation");
      setCompensationSubmitting(true);
      setCompensationSaveError("");
      void getTutorOnboardingReview(callbackController.signal)
        .then((data) => {
          if (getOperatingCountry(data) !== "GB") {
            throw new Error(
              "Stripe onboarding can only be refreshed after confirming a United Kingdom location.",
            );
          }
          setReviewData(data);
          setPersonalForm((current) => ({ ...current, country: "GB" }));
          return saveTutorCompensation({
            country: "uk",
            refresh_url: `${window.location.origin}/tutor/onboarding?stripe=refresh`,
            return_url: `${window.location.origin}/tutor/onboarding?stripe=return`,
          });
        })
        .then((result) => {
          if (result.country !== "uk") {
            throw new Error("Stripe returned an unexpected payout response.");
          }
          window.location.assign(result.stripe_onboarding_url);
        })
        .catch((caught: unknown) => {
          if (
            cancelled ||
            (caught instanceof DOMException && caught.name === "AbortError")
          ) {
            return;
          }
          setCompensationSaveError(
            caught instanceof Error
              ? caught.message
              : "Could not refresh the Stripe onboarding link.",
          );
        })
        .finally(() => {
          if (!cancelled) setCompensationSubmitting(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      hasHandledStripeCallback.current = false;
      callbackController.abort();
      window.clearTimeout(callbackTimer);
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    let active = true;

    void fetchAuthenticatedProfile()
      .then((profile) => {
        if (!active) return;
        setAuthSession(profile);
        if (hasLoadedTutorPersonalDetails.current) return;

        const profilePhone = profile.phone_number
          ? parsePhoneNumberFromString(profile.phone_number)
          : undefined;
        if (profilePhone?.country) setPhoneCountry(profilePhone.country);

        setPersonalForm((current) => ({
          ...current,
          firstName: current.firstName ?? profile.first_name,
          lastName: current.lastName ?? profile.last_name,
          otherName: current.otherName || profile.other_names || "",
          dateOfBirth:
            current.dateOfBirth || formatDateForInput(profile.dob),
          email: current.email ?? profile.email,
          phoneNumber:
            current.phoneNumber ||
            profilePhone?.nationalNumber ||
            profile.phone_number ||
            "",
          occupation: current.occupation || profile.occupation || "",
          qualification:
            current.qualification || profile.qualifications?.join(", ") || "",
        }));
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (stage !== "overview" && stage !== "review") return;
    const controller = new AbortController();
    getTutorOnboardingReview(controller.signal)
      .then((data) => {
        hasLoadedTutorPersonalDetails.current = Boolean(data.personal_details);
        setReviewData(data);
        setReviewError("");
        const savedCountry = getOperatingCountry(data);
        if (
          savedCountry === "GB" &&
          getSavedCompensationCountry(data.compensation) === "GB" &&
          !data.missing_steps.includes("compensation")
        ) {
          setStripeStatusPending(false);
        }
        if (savedCountry) {
          setPersonalForm((current) => ({ ...current, country: savedCountry }));
        }

        if (data.personal_details) {
          const savedPhone = parsePhoneNumberFromString(data.personal_details.phone_number);
          if (savedPhone?.country) setPhoneCountry(savedPhone.country);
          setPersonalForm((current) => ({
            ...current,
            firstName: data.personal_details?.first_name ?? current.firstName,
            lastName: data.personal_details?.last_name ?? current.lastName,
            otherName: data.personal_details?.other_names ?? "",
            dateOfBirth:
              formatDateForInput(data.personal_details?.dob) || current.dateOfBirth,
            email: data.personal_details?.email ?? current.email,
            phoneNumber: savedPhone?.nationalNumber ?? data.personal_details?.phone_number ?? "",
            occupation: data.personal_details?.occupation ?? "",
            qualification: data.personal_details?.qualifications.join(", ") ?? "",
            experience: data.personal_details?.bio ?? "",
          }));
        }

        if (data.identification) {
          const identificationCountry: OperatingCountry =
            data.identification.country === "nigeria"
              ? "NG"
              : data.identification.country === "uk"
                ? "GB"
                : "";
          const savedIdType = Object.entries(identificationTypeValues)
            .find(([, value]) => value === data.identification?.id_type)?.[0] ?? data.identification.id_type;
          setIdType(savedIdType);
          setShareCode(formatRightToWorkShareCode(data.identification.employer_share_code ?? ""));
          setDbsNumber(data.identification.dbs_certificate_number ?? "");
          setSubmittedIdentitySignature(JSON.stringify({
            country: identificationCountry,
            dbsNumber: data.identification.dbs_certificate_number ?? "",
            files: [],
            idType: savedIdType,
            shareCode: normalizeRightToWorkShareCode(data.identification.employer_share_code ?? ""),
          }));
        }

        if (data.compensation) {
          const compensationCountry = getSavedCompensationCountry(
            data.compensation,
          );
          const savedCompensation: CompensationForm = {
            accountName: data.compensation.account_name ?? "",
            accountNumber: data.compensation.account_number ?? "",
            bankCode: data.compensation.bank_code ?? "",
            bankName: data.compensation.bank_name ?? "",
          };
          setCompensation(savedCompensation);
          setSubmittedCompensationSignature(JSON.stringify({ ...savedCompensation, country: compensationCountry }));
          if (savedCompensation.bankCode && savedCompensation.accountNumber && savedCompensation.accountName) {
            setVerifiedAccountSignature(`${savedCompensation.bankCode}:${savedCompensation.accountNumber}`);
          }
        }

        if (data.location) {
          loadSavedLocation(data.location);
        }

        const missingStepByStage: Record<SetupStage, string> = {
          personal: "personal_details",
          identity: "identification",
          compensation: "compensation",
          location: "location",
        };
        const stepHasSavedData: Record<SetupStage, boolean> = {
          personal: Boolean(data.personal_details),
          identity: Boolean(
            data.identification &&
            ((savedCountry === "NG" && data.identification.country === "nigeria") ||
              (savedCountry === "GB" && data.identification.country === "uk")) &&
            data.documents.some((document) => document.purpose === "identification"),
          ),
          compensation: Boolean(
            data.compensation &&
            getSavedCompensationCountry(data.compensation) === savedCountry,
          ),
          location: Boolean(data.location),
        };
        setCompleted(
          stages
            .filter((item) => stepHasSavedData[item.id] && !data.missing_steps.includes(missingStepByStage[item.id]))
            .map((item) => item.id),
        );
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
  }, [loadSavedLocation, reviewRefreshKey, stage]);

  const handleFiles = (selectedFiles?: FileList | null) => {
    setFileError("");
    setIdentitySaveError("");
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
    setStage(hasSavedApplication ? "review" : "personal");
  };
  const continuePersonal = async () => {
    setValidationVisible(true);
    setPersonalSaveError("");
    if (!personalComplete) return;
    if (submittedPersonalSignature === personalSignature) {
      setValidationVisible(false);
      goNext("personal", "location");
      return;
    }
    setPersonalSubmitting(true);
    try {
      await saveTutorPersonalDetails(personalPayload);
      setSubmittedPersonalSignature(personalSignature);
    } catch (caught) {
      setPersonalSaveError(caught instanceof Error ? caught.message : "Personal details could not be saved.");
      return;
    } finally {
      setPersonalSubmitting(false);
    }
    setValidationVisible(false);
    goNext("personal", "location");
  };
  const advanceFromIdentity = () => {
    setIdentityValidationVisible(false);
    goNext("identity", "compensation");
  };
  const continueIdentity = async () => {
    setIdentityValidationVisible(true);
    setIdentitySaveError("");
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
          employer_share_code: normalizeRightToWorkShareCode(shareCode),
          dbs_certificate_number: dbsNumber.trim(),
        } : {}),
      });
      setIdFiles([]);
      setSubmittedIdentitySignature(savedIdentitySignature);
      advanceFromIdentity();
    } catch (caught) {
      setIdentitySaveError(
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
    setCompensationSaveError("");
    unmarkCompleted("compensation");
  };
  const changeNigerianAccountNumber = (value: string) => {
    setCompensation((current) => ({
      ...current,
      accountName: "",
      accountNumber: value.replace(/\D/g, "").slice(0, 10),
    }));
    setVerifiedAccountSignature("");
    setAccountResolveError("");
    setCompensationSaveError("");
    unmarkCompleted("compensation");
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
    setCompensationSaveError("");
    if (!compensationComplete) return;
    if (submittedCompensationSignature === compensationSignature) {
      setCompensationValidationVisible(false);
      goNext("compensation", "review");
      return;
    }
    setCompensationSubmitting(true);
    try {
      const payload: TutorCompensationInput =
        personalForm.country === "GB"
          ? {
              country: "uk",
              refresh_url: `${window.location.origin}/tutor/onboarding?stripe=refresh`,
              return_url: `${window.location.origin}/tutor/onboarding?stripe=return`,
            }
          : {
              account_name: compensation.accountName,
              account_number: compensation.accountNumber,
              bank_code: compensation.bankCode,
              bank_name: compensation.bankName,
              country: "nigeria",
            };
      const result = await saveTutorCompensation(payload);
      if (result.country === "uk") {
        window.location.assign(result.stripe_onboarding_url);
        return;
      }
      setSubmittedCompensationSignature(compensationSignature);
    } catch (caught) {
      const message = caught instanceof Error
        ? caught.message
        : "Could not save compensation details.";
      setCompensationSaveError(
        personalForm.country === "NG" && /return_url|refresh_url|stripe onboarding/i.test(message)
          ? "The server routed this Nigerian payout request to Stripe. Please contact support before trying again."
          : message,
      );
      return;
    } finally {
      setCompensationSubmitting(false);
    }
    setCompensationValidationVisible(false);
    goNext("compensation", "review");
  };
  const editReview = (section: SetupStage) => {
    setReviewConfirmed(false);
    setReviewError("");
    setReturnToReview(true);
    setStage(section);
    if (section === "location") location.loadSavedLocation(reviewData?.location ?? null);
  };
  const submitReview = async () => {
    if (
      !reviewConfirmed ||
      !reviewData ||
      !canSubmitApplication ||
      reviewData.tutor_status === "pending" ||
      reviewData.tutor_status === "approved" ||
      consentSubmitting ||
      applicationSubmitted
    ) return;
    setConsentSubmitting(true);
    setSubmissionMessage("");
    try {
      const message = await submitTutorOnboardingConsent();
      setSubmissionMessage(message);
      setApplicationSubmitted(true);
      setReviewConfirmed(false);
      void fetchAuthenticatedProfile().then(setAuthSession).catch(() => undefined);
      void getTutorOnboardingReview().then(setReviewData).catch(() => undefined);
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
  const tutorStatus = reviewData?.tutor_status ?? "";
  const applicationPending =
    applicationSubmitted ||
    tutorStatus === "pending";
  const applicationApproved = tutorStatus === "approved";
  const reviewCountry = reviewData ? getOperatingCountry(reviewData) : "";
  const reviewBackendCountry = reviewCountry === "NG"
    ? "nigeria"
    : reviewCountry === "GB"
      ? "uk"
      : "";
  const reviewIdentityMatchesCountry = Boolean(
    reviewBackendCountry &&
    reviewData?.identification?.country === reviewBackendCountry &&
    reviewData.documents.some((document) => document.purpose === "identification"),
  );
  const reviewCompensationMatchesCountry = Boolean(
    reviewCountry &&
    getSavedCompensationCountry(reviewData?.compensation ?? null) === reviewCountry,
  );
  const outdatedReviewSections: Array<"identification" | "compensation"> = [];
  if (reviewData?.identification && !reviewIdentityMatchesCountry) {
    outdatedReviewSections.push("identification");
  }
  if (reviewData?.compensation && !reviewCompensationMatchesCountry) {
    outdatedReviewSections.push("compensation");
  }
  const effectiveMissingSteps = reviewData
    ? Array.from(new Set([
        ...reviewData.missing_steps,
        ...(!reviewIdentityMatchesCountry ? ["identification"] : []),
        ...(!reviewCompensationMatchesCountry ? ["compensation"] : []),
      ]))
    : [];
  const effectiveReviewData = reviewData
    ? {
        ...reviewData,
        is_complete: Boolean(
          reviewData.is_complete &&
          reviewIdentityMatchesCountry &&
          reviewCompensationMatchesCountry,
        ),
        missing_steps: effectiveMissingSteps,
      }
    : null;
  const canSubmitApplication = Boolean(
    effectiveReviewData?.is_complete && !applicationPending && !applicationApproved,
  );
  const applicationEditable = !applicationPending && !applicationApproved;
  const showingStripeReturnStatus =
    stage === "review" &&
    (stripeStatusChecking ||
      stripeStatusPending ||
      Boolean(stripeReturnOutcome && !stripeReturnAcknowledged));

  return (
    <main className="flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-white text-[#171c2a]">
      <OnboardingNavbar
        email={sessionUser?.email ?? ""}
        name={sessionUser?.firstName ?? ""}
      />
      <section className="scrollbar-hover flex min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 lg:px-[var(--dashboard-gutter)] lg:py-3">
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
              {hasSavedApplication ? "Resume application" : "Let's get started"}
            </button>
          </div>
        ) : stage === "review" ? (
          <div className="mx-auto w-full max-w-[75rem]">
            {applicationSubmitted ? (
              <div className="mx-auto flex max-w-[32rem] flex-col items-center px-4 py-12 text-center sm:py-16" role="status">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf8f0] text-[#218553] shadow-[0_10px_30px_rgba(33,133,83,0.12)]">
                  <BadgeCheck aria-hidden="true" size={32} strokeWidth={1.8} />
                </span>
                <span className="mt-5 rounded-full bg-[#eaf8f0] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#218553]">
                  Application submitted
                </span>
                <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#252c3c] sm:text-3xl">
                  Congratulations, {displayName}!
                </h1>
                <p className="mt-2 max-w-[28rem] text-sm leading-6 text-[#737d94]">
                  Your tutor application has been submitted successfully and is now awaiting review.
                </p>
                <div className="mt-6 w-full rounded-xl border border-[#dfe3ec] bg-[#f8f9fc] px-4 py-3.5 text-left">
                  <p className="text-sm font-semibold text-[#35405a]">What happens next?</p>
                  <p className="mt-1 text-xs leading-5 text-[#737d94]">
                    We’ll review your details and update your tutor status when a decision has been made. You can continue using SP Novate as a student in the meantime.
                  </p>
                </div>
              </div>
            ) : stripeStatusChecking ? (
              <div className="mx-auto flex max-w-[31rem] flex-col items-center px-4 py-16 text-center" role="status">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeedff] text-brand-primary">
                  <LoaderCircle aria-hidden="true" className="animate-spin" size={30} strokeWidth={1.8} />
                </span>
                <span className="mt-5 rounded-full bg-[#eeedff] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">Stripe</span>
                <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#252c3c]">Confirming your payout setup</h1>
                <p className="mt-2 max-w-[27rem] text-sm leading-6 text-[#737d94]">We’re checking the information you submitted to Stripe. This may take a moment.</p>
              </div>
            ) : stripeStatusPending ? (
              <div className="mx-auto flex max-w-[31rem] flex-col items-center px-4 py-16 text-center" role="status">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff4e5] text-[#b86b12]">
                  <Clock3 aria-hidden="true" size={30} strokeWidth={1.8} />
                </span>
                <span className="mt-5 rounded-full bg-[#fff4e5] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#9a5a10]">Processing</span>
                <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#252c3c]">We’re still confirming your Stripe setup</h1>
                <p className="mt-2 max-w-[27rem] text-sm leading-6 text-[#737d94]">Stripe has returned you safely. The payout update can take a little longer to reach us.</p>
              </div>
            ) : stripeReturnOutcome && !stripeReturnAcknowledged ? (
              <div className="mx-auto flex max-w-[31rem] flex-col items-center px-4 py-16 text-center" role="status">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf8f0] text-[#218553]">
                  <BadgeCheck aria-hidden="true" size={31} strokeWidth={1.8} />
                </span>
                <span className="mt-5 rounded-full bg-[#eaf8f0] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#218553]">Details received</span>
                <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#252c3c]">{stripeReturnOutcome === "ready" ? "Payout setup complete" : "Your Stripe details were received"}</h1>
                <p className="mt-2 max-w-[27rem] text-sm leading-6 text-[#737d94]">{stripeReturnOutcome === "ready" ? "Your Stripe account is ready to receive tutor payouts." : "Stripe is still confirming payout availability. You can continue reviewing your application."}</p>
              </div>
            ) : (
              <>
                {submissionMessage ? <p className={`mb-3 rounded-xl border px-4 py-3 text-sm font-medium ${applicationSubmitted ? "border-[#bde8d0] bg-[#effaf4] text-[#20784d]" : "border-[#f0d6b5] bg-[#fff9f1] text-[#8b5a20]"}`} role="status">{submissionMessage}</p> : null}
                {reviewLoading ? <div className="py-16 text-center text-sm font-medium text-[#8a93a7]">Loading your saved application…</div> : null}
                {!reviewLoading && reviewError ? <div className="flex flex-col items-center gap-3 py-16 text-center" role="alert"><p className="text-sm font-medium text-brand-danger">{reviewError}</p><button className="h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white" onClick={() => { setReviewLoading(true); setReviewError(""); setReviewRefreshKey((current) => current + 1); }} type="button">Try again</button></div> : null}
                {!reviewLoading && effectiveReviewData ? <TutorReviewStep canSubmit={canSubmitApplication} confirmed={reviewConfirmed} editable={applicationEditable} onConfirmedChange={(value) => { setReviewConfirmed(value); setSubmissionMessage(""); }} onEdit={editReview} outdatedSections={outdatedReviewSections} review={effectiveReviewData} /> : null}
              </>
            )}
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[75rem] items-start justify-center gap-8 xl:gap-16">
            <StepList
              active={stage}
              completed={completed}
              onSelect={setStage}
            />
            <section className="min-w-0 w-full max-w-[42rem]">
              {stage === "personal" ? (
                <>
                  <h1 className="text-xl font-bold text-[#252c3c]">
                    Personal information
                  </h1>
                  {personalSaveError ? <Notice className="mt-3 text-sm" role="alert">{personalSaveError}</Notice> : null}
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
                      <FieldLabel>Date of birth</FieldLabel>
                      <input
                        aria-invalid={
                          validationVisible && !dobValid
                        }
                        className={fieldClassName}
                        max={maximumTutorDob}
                        onChange={(e) =>
                          updatePersonal("dateOfBirth", e.target.value)
                        }
                        type="date"
                        value={personalForm.dateOfBirth}
                      />
                      <InlineFieldError
                        show={validationVisible && !dobValid}
                      >
                        {personalForm.dateOfBirth
                          ? "Tutors must be at least 18 years old."
                          : "Enter your date of birth."}
                      </InlineFieldError>
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
                              setPersonalSaveError("");
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
                      {phoneValid && phoneCountryMismatch ? (
                        <span className="mt-1 block text-xs font-medium text-[#9a6419]">
                          This phone code does not match your tutoring country. You can continue if the number is correct.
                        </span>
                      ) : null}
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
                      <FieldLabel>Qualifications</FieldLabel>
                      <input
                        aria-invalid={
                          validationVisible &&
                          !personalForm.qualification.trim()
                        }
                        className={fieldClassName}
                        onChange={(e) =>
                          updatePersonal("qualification", e.target.value)
                        }
                        placeholder="e.g. BSc, MSc, PhD"
                        value={personalForm.qualification}
                      />
                      <InlineFieldError
                        show={
                          validationVisible &&
                          !personalForm.qualification.trim()
                        }
                      >
                        Enter at least one qualification.
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
                  <p className="mt-1 text-sm leading-6 text-[#7d879d]">
                    Add the details and supporting documents needed to verify your identity.
                  </p>
                  {!personalForm.country ? (
                    <Notice className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm" role="alert">
                      <span>Confirm a supported location before completing identity verification.</span>
                      <button
                        className="h-9 shrink-0 rounded-full border border-current px-4 text-xs font-semibold"
                        onClick={goToRequiredLocation}
                        type="button"
                      >
                        Go to location
                      </button>
                    </Notice>
                  ) : null}
                  {personalForm.country === "GB" ? (
                    <section className="mt-5 rounded-2xl border border-[#e0e4ed] bg-[#f8f9fc] p-4 sm:p-5">
                      <div className="mb-4">
                        <h2 className="text-sm font-bold text-[#35405a]">UK verification</h2>
                        <p className="mt-1 text-xs leading-relaxed text-[#7d879d]">Provide your right to work and background-check references.</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                      <label>
                        <FieldLabel>Right to work share code</FieldLabel>
                        <input
                          aria-invalid={
                            identityValidationVisible && !shareCodeValid
                          }
                          autoComplete="off"
                          className={fieldClassName}
                          autoCapitalize="characters"
                          maxLength={11}
                          onChange={(e) => setShareCode(formatRightToWorkShareCode(e.target.value))}
                          placeholder="For example, W12-345-678"
                          spellCheck={false}
                          value={shareCode}
                        />
                        <InlineFieldError
                          show={identityValidationVisible && !shareCodeValid}
                        >
                          Enter a 9-character right to work share code beginning with W.
                        </InlineFieldError>
                        <span className="mt-1 block text-xs text-[#8a93a7]">
                          Use a share code generated for an employer to check your
                          right to work, not a right to rent share code. {" "}
                          <a
                            className="font-semibold text-brand-accent underline underline-offset-2"
                            href="https://www.gov.uk/prove-right-to-work/get-a-share-code-online"
                            rel="noreferrer"
                            target="_blank"
                          >
                            Get a share code on GOV.UK
                          </a>
                          .
                        </span>
                      </label>
                      <label>
                        <FieldLabel>DBS certificate number</FieldLabel>
                        <input
                          aria-invalid={
                            identityValidationVisible && !dbsNumberValid
                          }
                          className={fieldClassName}
                          inputMode="numeric"
                          maxLength={12}
                          onChange={(e) => setDbsNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                          placeholder="Enter the 12-digit certificate number"
                          value={dbsNumber}
                        />
                        <InlineFieldError
                          show={identityValidationVisible && !dbsNumberValid}
                        >
                          Enter the 12-digit number shown on your DBS certificate.
                        </InlineFieldError>
                        <span className="mt-1 block text-xs text-[#8a93a7]">
                          This is the certificate number at the top right of your
                          Disclosure and Barring Service certificate.
                        </span>
                      </label>
                      </div>
                    </section>
                  ) : null}
                  <section className="mt-4 rounded-2xl border border-[#e0e4ed] bg-white p-4 shadow-[0_5px_18px_rgba(31,40,74,0.04)] sm:p-5">
                    <div className="mb-4">
                      <h2 className="text-sm font-bold text-[#35405a]">Identity document</h2>
                      <p className="mt-1 text-xs leading-relaxed text-[#7d879d]">Select an ID type, then attach up to five supporting files.</p>
                    </div>
                    <div className="grid gap-4">
                    <label>
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
                    </label>
                    <label>
                      <FieldLabel>Upload ID documents</FieldLabel>
                      <span
                        className={`mt-1.5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-[#fbfcff] ${identityValidationVisible && identityDocumentRequired ? "border-brand-danger" : "border-[#cfd5e2]"}`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          handleFiles(event.dataTransfer.files);
                        }}
                      >
                        <UploadCloud className="h-6 w-6 text-[#5652d2]" />
                        <span className="mt-2 text-sm font-semibold text-[#5652d2]">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-[#9299a9]">
                          {savedIdentityDocuments.length
                            ? "Add more supporting documents if needed"
                            : "PDF, JPG, PNG or WEBP · Up to 5 files"}
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
                        show={identityValidationVisible && identityDocumentRequired}
                      >
                        {savedIdentityDocuments.length
                          ? "Upload at least one supporting document when changing your identification details."
                          : "Upload at least one identity document."}
                      </InlineFieldError>
                    </label>
                    {fileError ? (
                      <p className="text-sm text-brand-danger">{fileError}</p>
                    ) : null}
                    {savedIdentityDocuments.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#6f778c]">Previously uploaded documents ({savedIdentityDocuments.length})</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {savedIdentityDocuments.map((document) => (
                            <TutorDocumentLink document={document} key={document.document_url} />
                          ))}
                        </div>
                        <p className="text-xs leading-relaxed text-[#8a93a7]">
                          New uploads are added to these documents; they do not replace them.
                        </p>
                      </div>
                    ) : null}
                    {idFiles.length ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#6f778c]">Ready to upload ({idFiles.length}/5)</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                        {idFiles.map((file) => (
                          <TutorLocalDocumentLink
                            file={file}
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            onRemove={() => {
                                setIdFiles((current) =>
                                  current.filter(
                                    (candidate) => candidate !== file,
                                  ),
                                );
                                setIdentitySaveError("");
                            }}
                          />
                        ))}
                        </div>
                      </div>
                    ) : null}
                    </div>
                  </section>
                  {identitySaveError ? (
                    <Notice className="mt-3 text-sm" role="alert">
                      {identitySaveError}
                    </Notice>
                  ) : null}
                </>
              ) : stage === "compensation" ? (
                <>
                  <h1 className="text-xl font-bold text-[#252c3c]">
                    Payout setup
                  </h1>
                  {!personalForm.country ? (
                    <Notice className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm" role="alert">
                      <span>Confirm a supported location before setting up payouts.</span>
                      <button
                        className="h-9 shrink-0 rounded-full border border-current px-4 text-xs font-semibold"
                        onClick={goToRequiredLocation}
                        type="button"
                      >
                        Go to location
                      </button>
                    </Notice>
                  ) : null}
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {personalForm.country === "GB" ? (
                      <div className="rounded-2xl border border-[#dfe3ec] bg-[#f8f8ff] p-5 sm:col-span-2 sm:p-6">
                        <div className="flex items-start gap-4">
                          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-[0_7px_18px_rgba(36,30,125,0.18)]">
                            <CircleDollarSign aria-hidden="true" size={21} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h2 className="text-lg font-bold tracking-[-0.01em] text-[#252c3c]">
                                Set up payouts with Stripe
                              </h2>
                              <span className="rounded-full border border-[#d8dafa] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5149c8]">
                                United Kingdom
                              </span>
                            </div>
                            <p className="mt-2 max-w-[34rem] text-sm leading-6 text-[#687188]">
                              Stripe will securely verify your identity and bank details. You’ll return here when finished.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : personalForm.country === "NG" ? (
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
                    ) : null}
                  </div>
                  {compensationSaveError ? (
                    <Notice className="mt-3 text-sm" role="alert">
                      {compensationSaveError}
                    </Notice>
                  ) : null}
                </>
              ) : (
                <>
                  {unsupportedTutorLocation ? (
                    <div className="mx-auto flex max-w-[30rem] flex-col items-center px-4 py-10 text-center sm:py-16" role="status">
                      <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eeedff] text-brand-primary shadow-[0_10px_30px_rgba(64,57,189,0.12)]">
                        <Globe2 aria-hidden="true" size={30} strokeWidth={1.8} />
                      </span>
                      <span className="mt-5 rounded-full bg-[#eeedff] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">
                        Coming soon
                      </span>
                      <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-[#252c3c]">
                        Tutor sign-up is coming to your country
                      </h1>
                      <p className="mt-2 max-w-[25rem] text-sm leading-6 text-[#737d94]">
                        We’ve saved your location. For now, you can keep learning and booking tutors as a student.
                      </p>
                      <div className="mt-6">
                        <button
                          className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white"
                          onClick={() => router.push("/students/dashboard")}
                          type="button"
                        >
                          Continue as a student
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                    {locationCountryError ? (
                      <Notice className="mb-3 text-sm" role="alert">
                        {locationCountryError}
                      </Notice>
                    ) : null}
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
                        placeId={location.placeId}
                        onChangeLocation={location.goBack}
                        onPlaceQueryChange={location.changeQuery}
                        onSelectPlace={location.selectPlace}
                        placePredictions={location.predictions}
                        placeQuery={location.query}
                        requestingPlaceSearch={location.requestingSearch}
                        source={location.source}
                      />
                    )}
                    </>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </section>

      {stage !== "overview" ? (
        <footer className="shrink-0 border-t border-[#e5e8f2] bg-white px-4 py-2 sm:px-[var(--dashboard-gutter)]">
          <div className="mx-auto flex w-full max-w-[var(--dashboard-max-width)] items-center justify-between gap-2 sm:gap-3">
            <span className="w-fit shrink-0 rounded-full border border-[#6d63ee] px-2.5 py-1 text-xs font-semibold text-[#5b4ded]">
              {showingStripeReturnStatus
                ? "Stripe"
                : applicationSubmitted
                  ? "Complete"
                : stage === "review"
                  ? "Review"
                  : `Step ${stageIndex + 1}/4`}
            </span>
            <div className="flex min-w-0 items-center justify-end gap-2">
              {submissionMessage && stage !== "review" ? (
                <span className="hidden text-xs font-medium text-[#8b5a20] sm:inline">
                  {submissionMessage}
                </span>
              ) : null}
              {!showingStripeReturnStatus &&
              (stage !== "review" || (!applicationPending && !applicationApproved)) ? (
                <button
                  className="h-11 shrink-0 rounded-full border border-[#d8dde8] bg-white px-4 text-sm font-semibold sm:px-5"
                  onClick={() => {
                    if (returnToReview && stage !== "review") {
                      setReturnToReview(false);
                      setStage("review");
                    } else if (stage === "review") setStage("compensation");
                    else if (stage === "personal")
                      router.push("/students/dashboard");
                    else if (stage === "identity") setStage("location");
                    else if (stage === "compensation") setStage("identity");
                    else if (stage === "location") {
                      if (location.view === "search") location.goBack();
                      else setStage("personal");
                    }
                  }}
                  type="button"
                >
                  {stage === "personal" ? "Cancel" : "Back"}
                </button>
              ) : null}
              {stripeStatusChecking ? (
                <button
                  className="h-11 rounded-full bg-[#b8b6cf] px-6 text-sm font-semibold text-white"
                  disabled
                  type="button"
                >
                  Confirming…
                </button>
              ) : stripeStatusPending ? (
                <>
                  <button
                    className="h-11 rounded-full border border-[#d8dde8] bg-white px-4 text-sm font-semibold text-[#46506a] sm:px-5"
                    onClick={() => {
                      clearStripeCallbackParameter();
                      setStripeStatusPending(false);
                    }}
                    type="button"
                  >
                    Continue to review
                  </button>
                  <button
                    className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white"
                    onClick={() => window.location.reload()}
                    type="button"
                  >
                    Check status
                  </button>
                </>
              ) : stripeReturnOutcome && !stripeReturnAcknowledged ? (
                <button
                  className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white"
                  onClick={() => setStripeReturnAcknowledged(true)}
                  type="button"
                >
                  Continue to review
                </button>
              ) : stage === "personal" ? (
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
                  {personalForm.country === "GB"
                    ? compensationSubmitting
                      ? "Opening Stripe..."
                      : "Continue to Stripe"
                    : compensationSubmitting
                      ? "Saving..."
                      : "Continue"}
                </button>
              ) : stage === "location" ? (
                unsupportedTutorLocation ? null : location.view === "prompt" ? null : location.view === "search" ? null : (
                  <>
                    <button
                      className="h-11 min-w-0 rounded-full bg-brand-primary px-3 text-sm font-semibold text-white disabled:bg-[#b8b6cf] sm:px-5"
                      disabled={!location.ready || location.saving || reviewLoading}
                      onClick={() => void location.confirm()}
                      type="button"
                    >
                      {location.saving
                        ? "Saving..."
                        : reviewLoading
                          ? "Confirming country..."
                          : "Confirm"}
                    </button>
                  </>
                )
              ) : applicationPending || applicationApproved ? (
                <button
                  className="h-11 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white sm:px-6"
                  onClick={() => router.push(applicationApproved ? "/tutor/dashboard" : "/students/dashboard")}
                  type="button"
                >
                  <span className="sm:hidden">Dashboard</span>
                  <span className="hidden sm:inline">
                    {applicationApproved ? "Go to tutor dashboard" : "Return to student dashboard"}
                  </span>
                </button>
              ) : (
                <button
                  className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white disabled:bg-[#b8b6cf]"
                  disabled={!reviewConfirmed || !canSubmitApplication || consentSubmitting}
                  onClick={() => void submitReview()}
                  type="button"
                >
                  {consentSubmitting ? "Submitting..." : "Finish setup"}
                </button>
              )}
            </div>
          </div>
        </footer>
      ) : null}
    </main>
  );
}
