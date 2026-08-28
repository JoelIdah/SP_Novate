"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

import { FieldLabel } from "./FieldLabel";
import { isEmailValid, isPhoneNumberValid, type ProfileFormState } from "../utils";

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
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryOptionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const typeaheadBufferRef = useRef("");
  const typeaheadResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedCountry = countryCodes.find((country) => country.iso === profileForm.phoneCountry);
  const phoneStarted = Boolean(
    profileForm.phoneCountry || profileForm.phoneNumber.trim(),
  );
  const countryMissing = !profileForm.phoneCountry;
  const phoneInvalid = phoneStarted && !isPhoneNumberValid(profileForm);
  const emailInvalid = validationVisible && !isEmailValid(profileForm.email);
  const firstNameMissing = validationVisible && !profileForm.firstName.trim();
  const lastNameMissing = validationVisible && !profileForm.lastName.trim();

  const resetTypeaheadSoon = () => {
    if (typeaheadResetRef.current) {
      clearTimeout(typeaheadResetRef.current);
    }

    typeaheadResetRef.current = setTimeout(() => {
      typeaheadBufferRef.current = "";
      typeaheadResetRef.current = null;
    }, 800);
  };

  const jumpToCountry = (searchText: string) => {
    const normalizedSearch = searchText.toLocaleLowerCase();
    const match = countryCodes.find((country) => country.country.toLocaleLowerCase().startsWith(normalizedSearch));
    if (!match) return;

    setCountryMenuOpen(true);
    window.requestAnimationFrame(() => {
      countryOptionRefs.current[match.iso]?.scrollIntoView({ block: "nearest" });
      countryOptionRefs.current[match.iso]?.focus();
    });
  };

  const handleCountryKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setCountryMenuOpen(false);
      return;
    }

    if (event.key.length === 1 && /^[a-z]$/i.test(event.key)) {
      event.preventDefault();
      typeaheadBufferRef.current = `${typeaheadBufferRef.current}${event.key}`.toLocaleLowerCase();
      jumpToCountry(typeaheadBufferRef.current);
      resetTypeaheadSoon();
    }
  };

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
          <div
            className={`profile-setup-phone-shell relative mt-1.5 flex h-11 w-full items-center rounded-lg border bg-white px-4 text-sm font-semibold text-[#4f5980] ${phoneInvalid ? "border-brand-danger" : "border-[#d8dde8]"}`}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setCountryMenuOpen(false);
              }
            }}
          >
            <button
              aria-expanded={countryMenuOpen}
              aria-label="Select country code"
              className="flex h-full max-w-[44%] shrink-0 items-center gap-1.5 truncate bg-transparent pr-3 text-left font-semibold text-[#4f5980] outline-none"
              onClick={() => setCountryMenuOpen((open) => !open)}
              onKeyDown={handleCountryKeyDown}
              type="button"
            >
              <span className={`truncate ${selectedCountry ? "" : "text-[#98a0b3]"}`}>{selectedCountry?.country ?? "Country code"}</span>
              {selectedCountry ? <span className="shrink-0">({selectedCountry.code})</span> : null}
              <svg aria-hidden className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
              </svg>
            </button>
            <span className="text-[#c5cada]">|</span>
            <input aria-describedby={phoneInvalid ? "phone-error" : undefined} aria-invalid={phoneInvalid} aria-label="Phone number" autoComplete="tel-national" className="ml-3 min-w-0 flex-1 bg-transparent text-[#4f5980] outline-none" onChange={(e) => onProfileFieldChange("phoneNumber", e.target.value)} placeholder="Phone number" ref={phoneInputRef} type="tel" value={profileForm.phoneNumber} />
            {countryMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+0.35rem)] z-20 max-h-52 w-72 overflow-y-auto rounded-[0.65rem] border border-[#d8dde8] bg-white py-1 shadow-[0_14px_34px_rgba(23,30,63,0.16)]" onKeyDown={handleCountryKeyDown}>
                {countryCodes.map((country) => (
                  <button
                    key={country.iso}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs font-semibold hover:bg-[#f5f7fb] ${
                      country.iso === selectedCountry?.iso ? "bg-[#f1f3ff] text-[#231d71]" : "text-[#4f5980]"
                    }`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onProfileFieldChange("countryCode", country.code);
                      onProfileFieldChange("phoneCountry", country.iso);
                      setCountryMenuOpen(false);
                      window.requestAnimationFrame(() => {
                        phoneInputRef.current?.focus();
                      });
                    }}
                    ref={(node) => {
                      countryOptionRefs.current[country.iso] = node;
                    }}
                    type="button"
                  >
                    <span className="truncate">{country.country}</span>
                    <span className="shrink-0 text-[#7b84a0]">{country.code}</span>
                  </button>
                ))}
              </div>
            ) : null}
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

