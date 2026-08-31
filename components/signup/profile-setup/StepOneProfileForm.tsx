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
  profileForm: ProfileFormState;
  validationVisible?: boolean;
  onProfileFieldChange: (field: keyof ProfileFormState, value: string) => void;
};

function FieldError({ children, id }: { children: string; id: string }) {
  return <span className="mt-1 block text-xs font-medium text-brand-danger" id={id} role="alert">{children}</span>;
}

export function StepOneProfileForm({ emailLocked = false, greetingName, profileForm, validationVisible = false, onProfileFieldChange }: StepOneProfileFormProps) {
  const selectedCountry = countryCodes.find((country) => country.iso === profileForm.phoneCountry);
  const phoneStarted = Boolean(
    profileForm.phoneCountry || profileForm.phoneNumber.trim(),
  );
  const countryMissing = !profileForm.phoneCountry;
  const phoneInvalid = phoneStarted && !isPhoneNumberValid(profileForm);
  const emailInvalid = validationVisible && !isEmailValid(profileForm.email);
  const firstNameMissing = validationVisible && !profileForm.firstName.trim();
  const lastNameMissing = validationVisible && !profileForm.lastName.trim();

  return (
    <section className="mx-auto w-full max-w-[35rem] py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">Welcome, {greetingName}!</h1>
        <p className="mt-2 text-sm font-medium text-[#7d869c]">Tell us a little about yourself to complete your student profile.</p>
      </div>

      <form className="mx-auto mt-6 w-full" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <FieldLabel required>First name</FieldLabel>
            <input aria-describedby={firstNameMissing ? "first-name-error" : undefined} aria-invalid={firstNameMissing} autoComplete="given-name" className={`${fieldClassName} ${firstNameMissing ? "border-brand-danger" : ""}`} onChange={(e) => onProfileFieldChange("firstName", e.target.value)} placeholder="Enter your first name" type="text" value={profileForm.firstName} />
            {firstNameMissing ? <FieldError id="first-name-error">Enter your first name.</FieldError> : null}
          </label>
          <label>
            <FieldLabel required>Last name</FieldLabel>
            <input aria-describedby={lastNameMissing ? "last-name-error" : undefined} aria-invalid={lastNameMissing} autoComplete="family-name" className={`${fieldClassName} ${lastNameMissing ? "border-brand-danger" : ""}`} onChange={(e) => onProfileFieldChange("lastName", e.target.value)} placeholder="Enter your last name" type="text" value={profileForm.lastName} />
            {lastNameMissing ? <FieldError id="last-name-error">Enter your last name.</FieldError> : null}
          </label>
          <label>
            <FieldLabel optional>Other name</FieldLabel>
            <input autoComplete="additional-name" className={fieldClassName} onChange={(e) => onProfileFieldChange("otherName", e.target.value)} placeholder="Enter your other name" type="text" value={profileForm.otherName} />
          </label>
          <label>
            <FieldLabel required>Email</FieldLabel>
            <input aria-describedby={emailInvalid ? "email-error" : undefined} aria-invalid={emailInvalid} autoComplete="email" className={`${fieldClassName} ${emailLocked ? "cursor-not-allowed bg-[#f5f7fb] text-[#737b8f]" : ""} ${emailInvalid ? "border-brand-danger" : ""}`} onChange={(e) => onProfileFieldChange("email", e.target.value)} readOnly={emailLocked} type="email" value={profileForm.email} />
            {emailInvalid ? <FieldError id="email-error">Enter a valid email address.</FieldError> : null}
          </label>
        </div>

        <label className="mt-3 block">
          <FieldLabel optional>Phone number</FieldLabel>
          <div className={`profile-setup-phone-shell mt-1.5 flex h-11 w-full rounded-lg border bg-white focus-within:border-[#6d63ee] ${phoneInvalid ? "border-brand-danger" : "border-[#d8dde8]"}`}>
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
            <input aria-describedby={phoneInvalid ? "phone-error" : undefined} aria-invalid={phoneInvalid} aria-label="Phone number" autoComplete="tel-national" className="min-w-0 flex-1 rounded-r-lg px-3.5 text-sm text-[#4f5980] outline-none" onChange={(e) => onProfileFieldChange("phoneNumber", e.target.value)} placeholder="Phone number" type="tel" value={profileForm.phoneNumber} />
          </div>
          {phoneInvalid ? (
            <span className="mt-1 block text-xs font-medium text-brand-danger" id="phone-error" role="alert">
              {countryMissing
                ? "Select a country code."
                : `Enter a valid phone number for ${selectedCountry?.country ?? "the selected country"}.`}
            </span>
          ) : null}
        </label>

        <label className="mt-3 block">
          <FieldLabel optional>Bio</FieldLabel>
          <textarea className="profile-setup-field mt-1.5 h-24 w-full resize-none rounded-lg border border-[#d8dde8] bg-white px-4 py-3 text-sm font-semibold text-[#4f5980] outline-none" onChange={(e) => onProfileFieldChange("bio", e.target.value)} placeholder="Tell tutors what you would like to learn..." value={profileForm.bio} />
        </label>

      </form>
    </section>
  );
}

