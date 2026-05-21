export type ProfileFormState = {
  email: string;
  lastName: string;
  firstName: string;
  otherName: string;
  phoneNumber: string;
  bio: string;
  password: string;
  confirmPassword: string;
};

export type AddressState = {
  address: string;
  country: string;
  postcode: string;
  state: string;
  city: string;
};

export type StepTwoView = "prompt" | "confirm";

export const initialProfileForm: ProfileFormState = {
  email: "Oluyinka@gmail.com",
  lastName: "Alabi",
  firstName: "Oluyinka",
  otherName: "",
  phoneNumber: "",
  bio: "",
  password: "",
  confirmPassword: "",
};

export const initialAddress: AddressState = {
  address: "",
  country: "",
  postcode: "",
  state: "",
  city: "",
};

export function isStepOneValid(form: ProfileFormState): boolean {
  const bioValid = form.bio.trim().length >= 10;
  const passwordValid = form.password.length >= 8;
  const confirmValid = form.password === form.confirmPassword;
  const phoneValid = form.phoneNumber.trim().length >= 7;

  return (
    form.email.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.firstName.trim().length > 0 &&
    phoneValid &&
    bioValid &&
    passwordValid &&
    confirmValid
  );
}

export function isAddressFilled(address: AddressState): boolean {
  return (
    address.address.trim().length > 0 &&
    address.country.trim().length > 0 &&
    address.postcode.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.city.trim().length > 0
  );
}

type ReverseGeocodeAddress = {
  house_number?: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  country?: string;
  postcode?: string;
  state?: string;
  region?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
};

type ReverseGeocodeResponse = {
  address?: ReverseGeocodeAddress;
  display_name?: string;
};

export function parseReverseGeocodeResult(
  data: ReverseGeocodeResponse,
  latitude: number,
  longitude: number,
): AddressState {
  const address = data.address ?? {};
  const lineOne =
    [address.house_number, address.road].filter(Boolean).join(" ") ||
    address.suburb ||
    address.neighbourhood ||
    data.display_name ||
    `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`;

  return {
    address: lineOne,
    country: address.country ?? "",
    postcode: address.postcode ?? "",
    state: address.state ?? address.region ?? "",
    city: address.city ?? address.town ?? address.village ?? address.county ?? "",
  };
}

