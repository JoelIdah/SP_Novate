import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export type ProfileFormState = {
  email: string;
  lastName: string;
  firstName: string;
  otherName: string;
  phoneCountry: CountryCode | "";
  countryCode: string;
  phoneNumber: string;
  bio: string;
};

export type StepTwoView = "prompt" | "confirm";

export const initialProfileForm: ProfileFormState = {
  email: "",
  lastName: "",
  firstName: "",
  otherName: "",
  phoneCountry: "",
  countryCode: "",
  phoneNumber: "",
  bio: "",
};

export function isPhoneNumberValid(form: Pick<ProfileFormState, "phoneCountry" | "phoneNumber">): boolean {
  const rawPhone = form.phoneNumber.trim();
  if (!rawPhone || !form.phoneCountry) return false;

  const phone = parsePhoneNumberFromString(rawPhone, form.phoneCountry);
  return phone?.isValid() ?? false;
}

export function formatPhoneNumberE164(form: Pick<ProfileFormState, "phoneCountry" | "phoneNumber">): string {
  if (!form.phoneCountry) return "";
  const phone = parsePhoneNumberFromString(form.phoneNumber.trim(), form.phoneCountry);
  return phone?.isValid() ? phone.number : "";
}

export function isEmailValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isStepOneValid(form: ProfileFormState): boolean {
  return (
    isEmailValid(form.email) &&
    form.lastName.trim().length > 0 &&
    form.firstName.trim().length > 0 &&
    isPhoneNumberValid(form)
  );
}

