"use client";

import { useEffect, useRef, useState } from "react";

import {
  setAuthSession,
  waitForAuthenticationRedirect,
} from "../auth/authSession";
import { fetchAuthenticatedProfile } from "../auth/profileApi";
import { OnboardingNavbar } from "./OnboardingNavbar";
import {
  markProfileDetailsSubmitted,
  useProfileDetailsSubmitted,
} from "./profileSetupSession";
import { SetupSuccessView } from "./profile-setup/SetupSuccessView";
import {
  StepTwoAddressConfirm,
  type LocationAddressForm,
  type LocationCoordinates,
} from "./profile-setup/StepTwoAddressConfirm";
import { StepOneProfileForm } from "./profile-setup/StepOneProfileForm";
import { StepTwoLocationPrompt } from "./profile-setup/StepTwoLocationPrompt";
import type { SetupMode, SetupStepId } from "./types";
import {
  initialProfileForm,
  formatPhoneNumberE164,
  isStepOneValid,
  type ProfileFormState,
} from "./utils";

type SetupStep = "personal" | "location";
type LocationView = "prompt" | "search" | "review" | "edit";
type LocationSource = "gps" | "search" | "manual";
const GPS_BROWSER_TIMEOUT_MS = 10000;

type PlacePrediction = {
  description: string;
  placeId: string;
};
type LocationUpdateResponse = {
  message?: string;
  data?: {
    address?: string;
    country?: string;
    postcode?: string;
    postal_code?: string;
    state?: string;
    city?: string;
    placeId?: string;
    latitude?: number;
    longitude?: number;
  } | null;
};
type ProfileSetupResponse = {
  message?: string;
};

const emptyAddressForm: LocationAddressForm = {
  address: "",
  country: "",
  postcode: "",
  state: "",
  city: "",
};

function isAddressComplete(address: LocationAddressForm): boolean {
  return Boolean(
    address.address.trim() &&
    address.country.trim() &&
    address.state.trim() &&
    address.city.trim(),
  );
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  return values.find((value) => value?.trim())?.trim() ?? "";
}

function readCoordinates(
  data?: LocationUpdateResponse["data"],
  fallback?: LocationCoordinates,
): LocationCoordinates | null {
  const latitude = data?.latitude ?? fallback?.latitude;
  const longitude = data?.longitude ?? fallback?.longitude;
  return typeof latitude === "number" && typeof longitude === "number"
    ? { latitude, longitude }
    : null;
}
const steps: Array<{ id: SetupStep; label: string }> = [
  { id: "personal", label: "Profile setup" },
  { id: "location", label: "Location access" },
];

function toSetupStep(stepId?: SetupStepId): SetupStep {
  return stepId === "location" ? "location" : "personal";
}

export function ProfileSetupStep({
  initialMode = "form",
  initialStepId,
  initialProfile,
  onBack,
  onStateChange,
}: {
  initialMode?: SetupMode;
  initialStepId?: SetupStepId;
  initialProfile?: { email?: string; firstName?: string; lastName?: string };
  onBack: () => void;
  onStateChange?: (state: { mode: SetupMode; stepId: SetupStepId }) => void;
}) {
  const initialStep = toSetupStep(initialStepId);
  const [activeStep, setActiveStep] = useState<SetupStep>(initialStep);
  const profileDetailsSubmitted = useProfileDetailsSubmitted();
  const [setupComplete, setSetupComplete] = useState(initialMode === "success");
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => {
    return {
      ...initialProfileForm,
      email: initialProfile?.email ?? initialProfileForm.email,
      firstName: initialProfile?.firstName ?? initialProfileForm.firstName,
      lastName: initialProfile?.lastName ?? initialProfileForm.lastName,
    };
  });
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [requestingPlaceSearch, setRequestingPlaceSearch] = useState(false);
  const [resolvingMapLocation, setResolvingMapLocation] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationView, setLocationView] = useState<LocationView>("prompt");
  const [locationSource, setLocationSource] =
    useState<LocationSource>("manual");
  const [locationError, setLocationError] = useState("");
  const [profileValidationVisible, setProfileValidationVisible] =
    useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileApiError, setProfileApiError] = useState("");
  const [addressForm, setAddressForm] =
    useState<LocationAddressForm>(emptyAddressForm);
  const [mapCoordinates, setMapCoordinates] =
    useState<LocationCoordinates | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>(
    [],
  );
  const locationRequestIdRef = useRef(0);
  const placeSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const placeSearchAbortRef = useRef<AbortController | null>(null);

  const displayedStep: SetupStep = profileDetailsSubmitted
    ? "location"
    : activeStep;
  const activeStepIndex = displayedStep === "location" ? 1 : 0;
  const profileValid = isStepOneValid(profileForm);
  const addressComplete = isAddressComplete(addressForm);
  const greetingName =
    profileForm.firstName.trim() ||
    initialProfile?.firstName?.trim() ||
    "there";
  const userEmail = profileForm.email.trim();

  useEffect(() => {
    if (!onStateChange) return;
    onStateChange({
      mode: setupComplete ? "success" : "form",
      stepId: displayedStep,
    });
  }, [displayedStep, onStateChange, setupComplete]);

  useEffect(() => {
    return () => {
      locationRequestIdRef.current += 1;
      if (placeSearchTimeoutRef.current !== null) {
        clearTimeout(placeSearchTimeoutRef.current);
      }
      placeSearchAbortRef.current?.abort();
    };
  }, []);

  const updateProfileField = (field: keyof ProfileFormState, value: string) => {
    setProfileApiError("");
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const readAddressFromResponse = (
    data: LocationUpdateResponse["data"],
    fallback?: Partial<LocationAddressForm>,
  ): LocationAddressForm => ({
    address: firstNonEmpty(data?.address, fallback?.address),
    country: firstNonEmpty(data?.country, fallback?.country),
    postcode: firstNonEmpty(
      data?.postcode,
      data?.postal_code,
      fallback?.postcode,
    ),
    state: firstNonEmpty(data?.state, fallback?.state),
    city: firstNonEmpty(data?.city, fallback?.city),
  });

  const submitLocationUpdate = async (
    payload: Record<string, string | number>,
  ) => {
    const response = await fetch("/api/user/locations/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

    const raw = await response.text();
    let data: LocationUpdateResponse | null = null;
    if (raw) {
      try {
        data = JSON.parse(raw) as LocationUpdateResponse;
      } catch {
        data = null;
      }
    }

    if (response.status === 401) return waitForAuthenticationRedirect();
    if (!response.ok) {
      throw new Error(data?.message ?? "Could not save location.");
    }

    return data ?? { message: "Location saved.", data: null };
  };

  const fetchPlaceDetails = async (
    placeId: string,
  ): Promise<LocationUpdateResponse["data"]> => {
    const response = await fetch("/api/places/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId }),
    });
    const result = (await response.json()) as LocationUpdateResponse;
    if (!response.ok)
      throw new Error(result.message ?? "Could not retrieve address details.");
    return result.data ?? null;
  };

  const fetchGpsAddress = async (
    coordinates: LocationCoordinates,
  ): Promise<LocationUpdateResponse["data"]> => {
    const response = await fetch("/api/places/reverse-geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coordinates),
    });
    const result = (await response.json()) as LocationUpdateResponse;
    if (!response.ok)
      throw new Error(result.message ?? "Could not retrieve your GPS address.");
    return result.data ?? null;
  };

  const fetchPlaceIdForManualAddress = async () => {
    const response = await fetch("/api/places/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });
    const result = (await response.json()) as LocationUpdateResponse;
    if (!response.ok || !result.data?.placeId) {
      throw new Error(
        result.message ?? "Could not verify the entered address.",
      );
    }
    return result.data.placeId;
  };

  const updateAddressField = (
    field: keyof LocationAddressForm,
    value: string,
  ) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
    setLocationSource("manual");
    setSelectedPlaceId("");
    setGpsAccuracy(null);
    setMapCoordinates(null);
    setLocationError("");
  };

  const stopLocationRequest = () => {
    locationRequestIdRef.current += 1;
  };

  const stopPlaceSearchRequest = () => {
    if (placeSearchTimeoutRef.current !== null) {
      clearTimeout(placeSearchTimeoutRef.current);
      placeSearchTimeoutRef.current = null;
    }
    placeSearchAbortRef.current?.abort();
    placeSearchAbortRef.current = null;
    setRequestingPlaceSearch(false);
    setPlacePredictions([]);
  };

  const openAddressSearch = (errorMessage = "") => {
    stopLocationRequest();
    setRequestingLocation(false);
    setSelectedPlaceId("");
    setGpsAccuracy(null);
    setMapCoordinates(null);
    setLocationView("search");
    setLocationError(errorMessage);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
    });
  };

  const handleAllowLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      openAddressSearch(
        "Location is not supported on this browser. Search for your address instead.",
      );
      return;
    }

    setRequestingLocation(true);
    setSelectedPlaceId("");
    setGpsAccuracy(null);
    setLocationError("");
    const requestId = locationRequestIdRef.current + 1;
    locationRequestIdRef.current = requestId;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (locationRequestIdRef.current !== requestId) return;
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          if (!Number.isFinite(accuracy) || accuracy > 50) {
            openAddressSearch(
              "Your location wasn't precise enough. Search for your address instead.",
            );
            return;
          }
          const coordinates = { latitude: lat, longitude: lon };
          const result = await fetchGpsAddress(coordinates);
          if (locationRequestIdRef.current !== requestId) return;
          const resolvedAddress = readAddressFromResponse(result, {
            address: `Lat ${lat.toFixed(5)}, Lng ${lon.toFixed(5)}`,
          });
          if (!isAddressComplete(resolvedAddress)) {
            openAddressSearch(
              "We found your location but couldn't identify a complete address. Search for it below.",
            );
            return;
          }
          setLocationSource("gps");
          setLocationView("review");
          setAddressForm(resolvedAddress);
          setMapCoordinates(coordinates);
          setGpsAccuracy(accuracy);
          setPlaceQuery(resolvedAddress.address);
          setLocationError("");
        } catch (error) {
          if (locationRequestIdRef.current !== requestId) return;
          openAddressSearch(
            error instanceof Error
              ? error.message
              : "We couldn't retrieve an address for your location. Search for it instead.",
          );
        } finally {
          if (locationRequestIdRef.current === requestId)
            setRequestingLocation(false);
        }
      },
      (error) => {
        if (locationRequestIdRef.current !== requestId) return;
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Search for your address instead."
            : "We couldn't get your location. Search for your address instead.";
        openAddressSearch(message);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 300000,
        timeout: GPS_BROWSER_TIMEOUT_MS,
      },
    );
  };

  const handleContinue = async () => {
    setProfileValidationVisible(true);
    setProfileApiError("");
    if (!profileValid) {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }
    setProfileSubmitting(true);
    try {
      const response = await fetch("/api/auth/profile-setup", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bio: profileForm.bio.trim() || undefined,
            email: profileForm.email.trim(),
            first_name: profileForm.firstName.trim(),
            last_name: profileForm.lastName.trim(),
            other_names: profileForm.otherName.trim() || undefined,
            phone_number: formatPhoneNumberE164(profileForm) || undefined,
          }),
        });
      const result = (await response
        .json()
        .catch(() => null)) as ProfileSetupResponse | null;
      if (response.status === 401) await waitForAuthenticationRedirect();
      if (!response.ok) {
        throw new Error(result?.message ?? "Could not complete profile setup.");
      }
      const profile = await fetchAuthenticatedProfile();
      setAuthSession(profile);
      markProfileDetailsSubmitted();
      setActiveStep("location");
      setLocationView("prompt");
      setProfileValidationVisible(false);
    } catch (error) {
      setProfileApiError(
        error instanceof Error
          ? error.message
          : "Could not complete profile setup.",
      );
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleSkipLocation = () => {
    stopLocationRequest();
    stopPlaceSearchRequest();
    setSetupComplete(true);
  };

  const handleFinishSetup = async () => {
    if (!addressComplete || savingLocation || resolvingMapLocation) return;
    stopLocationRequest();
    stopPlaceSearchRequest();
    setSavingLocation(true);
    setLocationError("");
    try {
      let payload: Record<string, string | number>;
      if (locationSource === "gps") {
        if (!mapCoordinates || gpsAccuracy === null) {
          throw new Error("Please request your current location again.");
        }
        payload = {
          accuracy: gpsAccuracy,
          latitude: mapCoordinates.latitude,
          longitude: mapCoordinates.longitude,
          source: "gps",
        };
      } else if (locationSource === "search") {
        if (!selectedPlaceId) {
          throw new Error("Please search for and select your address again.");
        }
        payload = { placeId: selectedPlaceId, source: "search" };
      } else {
        const verifiedPlaceId = await fetchPlaceIdForManualAddress();
        setSelectedPlaceId(verifiedPlaceId);
        payload = { placeId: verifiedPlaceId, source: "search" };
      }
      await submitLocationUpdate(payload);
      setSetupComplete(true);
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : "Could not save the reviewed address.",
      );
    } finally {
      setSavingLocation(false);
    }
  };

  const handleLocationBack = () => {
    stopLocationRequest();
    stopPlaceSearchRequest();
    setRequestingLocation(false);
    setLocationError("");

    if (locationView === "edit") {
      setLocationView(addressComplete ? "review" : "search");
      return;
    }

    if (locationView === "review") {
      setLocationView(locationSource === "search" ? "search" : "prompt");
      return;
    }

    if (locationView === "search") {
      setLocationView("prompt");
      return;
    }

    setActiveStep("personal");
  };

  const handleEditAddress = () => {
    setLocationView("edit");
    setLocationError("");
  };

  const handlePlaceQueryChange = (value: string) => {
    setSelectedPlaceId("");
    setGpsAccuracy(null);
    if (
      value !== placeQuery &&
      Object.values(addressForm).some((field) => field.trim())
    ) {
      setAddressForm(emptyAddressForm);
      setMapCoordinates(null);
    }
    setPlaceQuery(value);
    setLocationError("");
    setPlacePredictions([]);

    if (placeSearchTimeoutRef.current !== null) {
      clearTimeout(placeSearchTimeoutRef.current);
    }
    placeSearchAbortRef.current?.abort();

    const input = value.trim();
    if (input.length < 3) {
      setRequestingPlaceSearch(false);
      return;
    }

    setRequestingPlaceSearch(true);
    placeSearchTimeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      placeSearchAbortRef.current = controller;

      try {
        const response = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          message?: string;
          predictions?: PlacePrediction[];
        };

        if (!response.ok) {
          throw new Error(data.message ?? "Could not search addresses.");
        }

        setPlacePredictions(data.predictions ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setLocationError(
          error instanceof Error
            ? error.message
            : "Could not search addresses.",
        );
      } finally {
        if (placeSearchAbortRef.current === controller) {
          placeSearchAbortRef.current = null;
          setRequestingPlaceSearch(false);
        }
      }
    }, 350);
  };

  const handleSelectPlace = async (placeId: string) => {
    setRequestingPlaceSearch(true);
    setLocationError("");
    try {
      const selectedPlace = placePredictions.find(
        (prediction) => prediction.placeId === placeId,
      );
      const details = await fetchPlaceDetails(placeId);
      const detailsAddress = readAddressFromResponse(details, {
        address: selectedPlace?.description ?? placeQuery,
      });
      setPlaceQuery(selectedPlace?.description ?? placeQuery);
      setPlacePredictions([]);
      setLocationSource("search");
      setSelectedPlaceId(placeId);
      setGpsAccuracy(null);
      setAddressForm(detailsAddress);
      setMapCoordinates(readCoordinates(details));
      setLocationView(isAddressComplete(detailsAddress) ? "review" : "edit");
      setLocationError("");
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : "Could not retrieve the selected address.",
      );
    } finally {
      setRequestingPlaceSearch(false);
    }
  };

  const handleMapLocationChange = async (coordinates: LocationCoordinates) => {
    setResolvingMapLocation(true);
    setLocationError("");
    try {
      const result = await fetchGpsAddress(coordinates);
      const resolvedAddress = readAddressFromResponse(result);
      const placeId = result?.placeId?.trim() ?? "";
      if (!isAddressComplete(resolvedAddress) || !placeId) {
        throw new Error(
          "We couldn't verify an address at that map position. Try a nearby point.",
        );
      }

      setAddressForm(resolvedAddress);
      setMapCoordinates(coordinates);
      setGpsAccuracy(null);
      setSelectedPlaceId(placeId);
      setLocationSource("search");
      setPlaceQuery(resolvedAddress.address);
      return true;
    } catch (error) {
      setLocationError(
        error instanceof Error
          ? error.message
          : "Could not update the map location.",
      );
      return false;
    } finally {
      setResolvingMapLocation(false);
    }
  };

  const currentStep = steps[activeStepIndex];
  const dashboardHref = "/students/dashboard";

  return (
    <main className="flex h-[100svh] flex-col overflow-hidden bg-white text-[#171c2a]">
      <OnboardingNavbar email={userEmail} name={profileForm.firstName} />

      <section className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 sm:px-6 sm:py-5">
        <div className="flex min-h-full w-full items-center justify-center">
          {setupComplete ? (
            <SetupSuccessView dashboardHref={dashboardHref} />
          ) : displayedStep === "personal" ? (
            <StepOneProfileForm
              emailLocked={Boolean(initialProfile?.email?.trim())}
              greetingName={greetingName}
              onProfileFieldChange={updateProfileField}
              profileForm={profileForm}
              validationVisible={profileValidationVisible}
            />
          ) : (
            <div className="w-full text-center">
              {locationView === "prompt" ? (
                <StepTwoLocationPrompt
                  locationError={locationError}
                  onAllowLocation={handleAllowLocation}
                  onEnterAddress={() => openAddressSearch()}
                  requestingLocation={requestingLocation}
                />
              ) : (
                <StepTwoAddressConfirm
                  addressForm={addressForm}
                  coordinates={mapCoordinates}
                  locationError={locationError}
                  mode={locationView}
                  onAddressFieldChange={updateAddressField}
                  onPlaceQueryChange={handlePlaceQueryChange}
                  onSelectPlace={handleSelectPlace}
                  placePredictions={placePredictions}
                  placeQuery={placeQuery}
                  resolvingMapLocation={resolvingMapLocation}
                  requestingPlaceSearch={requestingPlaceSearch}
                  onMapLocationChange={handleMapLocationChange}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {!setupComplete ? (
        <footer className="shrink-0 border-t border-[#e5e8f2] bg-white px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:px-[var(--dashboard-gutter)]">
          <div className="mx-auto flex w-full max-w-[var(--dashboard-max-width)] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 text-xs text-[#30384f]">
              <span className="shrink-0 rounded-full border border-[#6d63ee] bg-white px-2 py-1 font-semibold text-[#5b4ded]">
                Step {activeStepIndex + 1}/2
              </span>
              <span aria-hidden className="text-[#7c8498]">
                ›
              </span>
              <span className="truncate font-semibold">
                {currentStep.label}
              </span>
              {displayedStep === "location" && locationView !== "prompt" ? (
                <button
                  className="ml-1 shrink-0 font-semibold text-brand-accent underline-offset-4 hover:underline"
                  onClick={handleLocationBack}
                  type="button"
                >
                  ← <span className="sm:hidden">Back</span>
                  <span className="hidden sm:inline">
                    {locationView === "search"
                      ? "Back to location options"
                      : locationView === "edit"
                        ? "Back to address review"
                        : locationSource === "search"
                          ? "Back to address search"
                          : "Back to location options"}
                  </span>
                </button>
              ) : null}
            </div>

            {displayedStep === "personal" ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                {profileApiError ? (
                  <p
                    className="max-w-md text-sm font-medium text-brand-danger"
                    role="alert"
                  >
                    {profileApiError}
                  </p>
                ) : null}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:justify-end">
                  <button
                    className="h-11 rounded-full border border-[#d8dde8] bg-white px-5 text-sm font-semibold text-[#3f4759] hover:bg-[#f8f9fb]"
                    disabled={profileSubmitting}
                    onClick={onBack}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white hover:bg-[#1c175f] disabled:cursor-not-allowed disabled:bg-[#b8b6cf]"
                    disabled={profileSubmitting}
                    onClick={() => void handleContinue()}
                    type="button"
                  >
                    {profileSubmitting ? "Saving..." : "Continue"}
                  </button>
                </div>
              </div>
            ) : locationView === "prompt" ? (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:justify-end">
                <button
                  className="h-11 rounded-full border border-[#d8dde8] bg-white px-5 text-sm font-semibold text-[#3f4759] hover:bg-[#f8f9fb]"
                  onClick={handleSkipLocation}
                  type="button"
                >
                  Skip
                </button>
                <button
                  className="h-11 rounded-full bg-brand-primary px-6 text-sm font-semibold text-white disabled:bg-[#b8b6cf]"
                  disabled
                  type="button"
                >
                  Finish setup
                </button>
              </div>
            ) : locationView === "search" ? (
              <div className="flex shrink-0 justify-end">
                <button
                  className="h-11 rounded-full border border-[#d8dde8] bg-white px-5 text-sm font-semibold text-[#3f4759] hover:bg-[#f8f9fb]"
                  onClick={handleSkipLocation}
                  type="button"
                >
                  Skip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:justify-end">
                <button
                  className="h-11 rounded-full border border-[#d8dde8] bg-white px-4 text-xs font-semibold text-[#3f4759] hover:bg-[#f8f9fb] sm:px-5 sm:text-sm"
                  onClick={
                    locationView === "edit"
                      ? handleLocationBack
                      : handleEditAddress
                  }
                  type="button"
                >
                  {locationView === "edit"
                    ? "Cancel"
                    : "No, this is not my address"}
                </button>
                <button
                  className="h-11 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:bg-[#b8b6cf]"
                  disabled={
                    !addressComplete || savingLocation || resolvingMapLocation
                  }
                  onClick={() => void handleFinishSetup()}
                  type="button"
                >
                  {resolvingMapLocation
                    ? "Checking..."
                    : savingLocation
                      ? "Saving..."
                      : "Yes, this is my address"}
                </button>
              </div>
            )}
          </div>
        </footer>
      ) : null}
    </main>
  );
}
