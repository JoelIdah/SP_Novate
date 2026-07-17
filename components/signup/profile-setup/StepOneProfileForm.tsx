"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

import { FieldLabel } from "./FieldLabel";
import { isPhoneNumberValid, type ProfileFormState } from "../utils";

const fieldClassName =
  "profile-setup-field mt-[0.4em] h-8 w-full rounded-[0.5em] border border-[#d8dde8] bg-white px-[1em] text-xs font-semibold text-[#4f5980] outline-none sm:h-9 sm:text-sm";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const countryCodes = getCountries()
  .map((iso) => ({
    code: `+${getCountryCallingCode(iso)}`,
    country: regionNames.of(iso) ?? iso,
    iso,
  }))
  .sort((a, b) => a.country.localeCompare(b.country)) satisfies Array<{ code: string; country: string; iso: CountryCode }>;

type StepOneProfileFormProps = {
  greetingName: string;
  profileForm: ProfileFormState;
  onProfileFieldChange: (field: keyof ProfileFormState, value: string) => void;
};

export function StepOneProfileForm({ greetingName, profileForm, onProfileFieldChange }: StepOneProfileFormProps) {
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const countryOptionRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const typeaheadBufferRef = useRef("");
  const typeaheadResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedCountry = countryCodes.find((country) => country.iso === profileForm.phoneCountry);
  const phoneStarted = profileForm.phoneNumber.trim().length > 0;
  const phoneInvalid = phoneStarted && !isPhoneNumberValid(profileForm);

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
    <section className="mx-auto flex h-full w-full max-w-[820px] flex-col justify-center px-0 py-1 sm:px-8">
      <div className="text-center">
        <h1 className="text-[1.45rem] font-bold sm:text-[1.8rem]">Welcome {greetingName}!</h1>
        <p className="mt-1 text-xs font-medium text-[#8c93a7] sm:text-sm">We just need a few details to complete your profile.</p>
      </div>

      <form className="mx-auto mt-3 w-full max-w-[560px]" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-2">
          <label><FieldLabel>Email</FieldLabel><input className={fieldClassName} onChange={(e) => onProfileFieldChange("email", e.target.value)} type="email" value={profileForm.email} /></label>
          <label><FieldLabel>Last name</FieldLabel><input className={fieldClassName} onChange={(e) => onProfileFieldChange("lastName", e.target.value)} type="text" value={profileForm.lastName} /></label>
          <label><FieldLabel>First name</FieldLabel><input className={fieldClassName} onChange={(e) => onProfileFieldChange("firstName", e.target.value)} type="text" value={profileForm.firstName} /></label>
          <label><FieldLabel>Other name</FieldLabel><input className={fieldClassName} onChange={(e) => onProfileFieldChange("otherName", e.target.value)} placeholder="Enter your other name" type="text" value={profileForm.otherName} /></label>
        </div>

        <label className="mt-2 block">
          <FieldLabel>Phone number</FieldLabel>
          <div
            className={`profile-setup-phone-shell relative mt-[0.4em] flex h-8 w-full items-center rounded-[0.5em] border bg-white px-[1em] text-xs font-semibold text-[#4f5980] sm:h-9 sm:text-sm ${phoneInvalid ? "border-[#d04b4b]" : "border-[#d8dde8]"}`}
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
            <input className="ml-3 min-w-0 flex-1 bg-transparent text-[#4f5980] outline-none" onChange={(e) => onProfileFieldChange("phoneNumber", e.target.value)} placeholder="phone number" ref={phoneInputRef} type="tel" value={profileForm.phoneNumber} />
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
            <span className="mt-1 block text-[0.64rem] font-medium text-[#d04b4b]">
              Enter a valid phone number for {selectedCountry?.country ?? "the selected country"}.
            </span>
          ) : null}
        </label>

        <label className="mt-2 block">
          <FieldLabel>Bio</FieldLabel>
          <textarea className="profile-setup-field mt-[0.4em] h-16 w-full resize-none rounded-[0.5em] border border-[#d8dde8] bg-white px-[1em] py-2 text-xs font-semibold text-[#4f5980] outline-none sm:h-20 sm:text-sm" onChange={(e) => onProfileFieldChange("bio", e.target.value)} placeholder="Tell us about yourself..." value={profileForm.bio} />
          <span className="mt-1 block text-[0.64rem] text-[#98a0b3]">Bio must be at least 10 characters</span>
        </label>

      </form>
    </section>
  );
}

