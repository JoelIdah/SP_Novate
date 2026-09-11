"use client";

import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

import { FieldLabel } from "./FieldLabel";
import { isEmailValid, isPhoneNumberValid, type ProfileFormState } from "../utils";
import { SelectMenu } from "../../ui/SelectMenu";

const fieldClassName =
  "profile-setup-field mt-1.5 h-11 w-full rounded-lg border border-[#d8dde8] bg-white px-4 text-sm font-semibold text-[#4f5980] outline-none";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const countryCodes = getCountries()
  .map((iso) => ({
    code: `+${getCountryCallingCode(iso)}`,
    country: regionNames.of(iso) ?? iso,
    iso,
  }))
  .sort((a, b) => a.country.localeCompare(b.country)) satisfies Array<{ code: string; country: string; iso: CountryCode }>;

type StepOneProfileFormProps = {
  emailLocked?: boolean;
  greetingName: string;
  generalError?: string;
  profileForm: ProfileFormState;
  validationVisible?: boolean;
  fieldErrors?: Partial<Record<"email" | "firstName" | "lastName" | "otherName" | "phoneNumber", string>>;
  onProfileFieldChange: (field: keyof ProfileFormState, value: string) => void;
};

function FieldError({ children, id }: { children: string; id: string }) {
  return <span className="mt-1 block text-xs font-medium text-brand-danger" id={id} role="alert">{children}</span>;
}

export function StepOneProfileForm({ emailLocked = false, fieldErrors = {}, generalError = "", greetingName, profileForm, validationVisible = false, onProfileFieldChange }: StepOneProfileFormProps) {
  const selectedCountry = countryCodes.find((country) => country.iso === profileForm.phoneCountry);
  const countryMissing = !profileForm.phoneCountry;
  const phoneInvalid = validationVisible && !isPhoneNumberValid(profileForm);
  const emailInvalid = validationVisible && !isEmailValid(profileForm.email);
  const firstNameMissing = validationVisible && !profileForm.firstName.trim();
  const lastNameMissing = validationVisible && !profileForm.lastName.trim();

  return (
    <section className="mx-auto w-full max-w-[35rem] py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">Welcome, {greetingName}!</h1>
        <p className="mt-2 text-sm font-medium text-[#7d869c]">Tell us a little about yourself to complete your profile.</p>
      </div>

      {generalError ? (
        <div className="mt-5 rounded-lg border border-[#f0d2ce] bg-[#fff7f5] px-3.5 py-2.5 text-sm font-medium text-brand-danger" role="alert">
          {generalError}
        </div>
      ) : null}

      <form className={`mx-auto w-full ${generalError ? "mt-4" : "mt-6"}`} onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <FieldLabel required>First name</FieldLabel>
            <input aria-describedby={firstNameMissing || fieldErrors.firstName ? "first-name-error" : undefined} aria-invalid={firstNameMissing || Boolean(fieldErrors.firstName)} autoComplete="given-name" className={`${fieldClassName} ${firstNameMissing || fieldErrors.firstName ? "border-brand-danger" : ""}`} onChange={(e) => onProfileFieldChange("firstName", e.target.value)} placeholder="Enter your first name" type="text" value={profileForm.firstName} />
            {fieldErrors.firstName || firstNameMissing ? <FieldError id="first-name-error">{fieldErrors.firstName || "Enter your first name."}</FieldError> : null}
          </label>
          <label>
            <FieldLabel required>Last name</FieldLabel>
            <input aria-describedby={lastNameMissing || fieldErrors.lastName ? "last-name-error" : undefined} aria-invalid={lastNameMissing || Boolean(fieldErrors.lastName)} autoComplete="family-name" className={`${fieldClassName} ${lastNameMissing || fieldErrors.lastName ? "border-brand-danger" : ""}`} onChange={(e) => onProfileFieldChange("lastName", e.target.value)} placeholder="Enter your last name" type="text" value={profileForm.lastName} />
            {fieldErrors.lastName || lastNameMissing ? <FieldError id="last-name-error">{fieldErrors.lastName || "Enter your last name."}</FieldError> : null}
          </label>
          <label>
            <FieldLabel optional>Other name</FieldLabel>
            <input aria-describedby={fieldErrors.otherName ? "other-name-error" : undefined} aria-invalid={Boolean(fieldErrors.otherName)} autoComplete="additional-name" className={`${fieldClassName} ${fieldErrors.otherName ? "border-brand-danger" : ""}`} onChange={(e) => onProfileFieldChange("otherName", e.target.value)} placeholder="Enter your other name" type="text" value={profileForm.otherName} />
            {fieldErrors.otherName ? <FieldError id="other-name-error">{fieldErrors.otherName}</FieldError> : null}
          </label>
          <label>
            <FieldLabel required>Email</FieldLabel>
            <input aria-describedby={emailInvalid || fieldErrors.email ? "email-error" : undefined} aria-invalid={emailInvalid || Boolean(fieldErrors.email)} autoComplete="email" className={`${fieldClassName} ${emailLocked ? "cursor-not-allowed bg-[#f5f7fb] text-[#737b8f]" : ""} ${emailInvalid || fieldErrors.email ? "border-brand-danger" : ""}`} onChange={(e) => onProfileFieldChange("email", e.target.value)} readOnly={emailLocked} type="email" value={profileForm.email} />
            {fieldErrors.email || emailInvalid ? <FieldError id="email-error">{fieldErrors.email || "Enter a valid email address."}</FieldError> : null}
          </label>
        </div>

        <label className="mt-3 block">
          <FieldLabel required>Phone number</FieldLabel>
          <div className={`profile-setup-phone-shell mt-1.5 flex h-11 w-full rounded-lg border bg-white focus-within:border-[#6d63ee] ${phoneInvalid || fieldErrors.phoneNumber ? "border-brand-danger" : "border-[#d8dde8]"}`}>
            <SelectMenu
              ariaLabel="Phone country code"
              buttonClassName="!h-[2.65rem] !rounded-r-none !border-0 !bg-[#f7f8fc] !px-2.5 !text-xs !shadow-none focus:!ring-0"
              className="w-[8rem] shrink-0"
              onChange={(value) => {
                const country = countryCodes.find((candidate) => candidate.iso === value);
                onProfileFieldChange("phoneCountry", value);
                onProfileFieldChange("countryCode", country?.code ?? "");
              }}
              options={countryCodes.map((country) => ({
                label: `${country.iso} ${country.code} - ${country.country}`,
                value: country.iso,
              }))}
              placeholder="Code"
              searchable
              searchPlaceholder="Search countries"
              value={profileForm.phoneCountry}
            />
            <input aria-describedby={phoneInvalid || fieldErrors.phoneNumber ? "phone-error" : undefined} aria-invalid={phoneInvalid || Boolean(fieldErrors.phoneNumber)} aria-label="Phone number" autoComplete="tel-national" className="min-w-0 flex-1 rounded-r-lg px-3.5 text-sm text-[#4f5980] outline-none" onChange={(e) => onProfileFieldChange("phoneNumber", e.target.value)} placeholder="Phone number" type="tel" value={profileForm.phoneNumber} />
          </div>
          {fieldErrors.phoneNumber || phoneInvalid ? (
            <span className="mt-1 block text-xs font-medium text-brand-danger" id="phone-error" role="alert">
              {fieldErrors.phoneNumber || (countryMissing
                ? "Select a country code."
                : `Enter a valid phone number for ${selectedCountry?.country ?? "the selected country"}.`)}
            </span>
          ) : null}
        </label>

        <label className="mt-3 block">
          <FieldLabel>Bio</FieldLabel>
          <textarea className="profile-setup-field mt-1.5 h-24 w-full resize-none rounded-lg border border-[#d8dde8] bg-white px-4 py-3 text-sm font-semibold text-[#4f5980] outline-none" onChange={(e) => onProfileFieldChange("bio", e.target.value)} placeholder="Tell tutors what you would like to learn..." value={profileForm.bio} />
        </label>

      </form>
    </section>
  );
}
