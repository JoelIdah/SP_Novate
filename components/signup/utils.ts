import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export type ProfileFormState = {
  email: string;
  lastName: string;
  firstName: string;
  otherName: string;
  phoneCountry: CountryCode;
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
  phoneCountry: "NG",
  countryCode: "+234",
  phoneNumber: "",
  bio: "",
};

export function isPhoneNumberValid(form: Pick<ProfileFormState, "phoneCountry" | "phoneNumber">): boolean {
  const rawPhone = form.phoneNumber.trim();
  if (!rawPhone) return false;

  const phone = parsePhoneNumberFromString(rawPhone, form.phoneCountry);
  return phone?.isValid() ?? false;
}

export function formatPhoneNumberE164(form: Pick<ProfileFormState, "phoneCountry" | "phoneNumber">): string {
  const phone = parsePhoneNumberFromString(form.phoneNumber.trim(), form.phoneCountry);
  return phone?.isValid() ? phone.number : "";
}

export function isStepOneValid(form: ProfileFormState): boolean {
  const bioValid = form.bio.trim().length >= 10;
  const countryCodeValid = form.countryCode.trim().length > 0;
  const phoneValid = isPhoneNumberValid(form);

  return (
    form.email.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.firstName.trim().length > 0 &&
    countryCodeValid &&
    phoneValid &&
    bioValid
  );
}

