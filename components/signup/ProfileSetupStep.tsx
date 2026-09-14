"use client";

import { useEffect, useRef, useState } from "react";

import {
  setAuthSession,
  waitForAuthenticationRedirect,
} from "../auth/authSession";
import { fetchAuthenticatedProfile } from "../auth/profile";
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
import { Button } from "../ui/Button";
import type { SetupMode, SetupStepId } from "./types";
import {
  initialProfileForm,
  formatPhoneNumberE164,
  isStepOneValid,
  type ProfileFormState,
} from "./utils";

type SetupStep = "personal" | "location";
type LocationView = "prompt" | "search" | "review";
type LocationSource = "gps" | "search";
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
type ProfileField = "email" | "firstName" | "lastName" | "otherName" | "phoneNumber";

function profileFieldForMessage(message: string): ProfileField | null {
  const value = message.toLowerCase();
  if (value.includes("phone") || value.includes("mobile")) return "phoneNumber";
  if (value.includes("email")) return "email";
  if (value.includes("first name") || value.includes("first_name")) return "firstName";
  if (value.includes("last name") || value.includes("last_name")) return "lastName";
  if (value.includes("other name") || value.includes("other_names")) return "otherName";
  return null;
}

const emptyAddressForm: LocationAddressForm = {
  address: "",
  country: "",
  postcode: "",
  state: "",
  city: "",
};

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
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationView, setLocationView] = useState<LocationView>("prompt");
  const [locationSource, setLocationSource] =
    useState<LocationSource>("gps");
  const [locationError, setLocationError] = useState("");
  const [profileValidationVisible, setProfileValidationVisible] =
    useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileSaveError] = useState("");
  const [profileFieldErrors, setProfileFieldErrors] = useState<Partial<Record<ProfileField, string>>>({});
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
  const locationReady = locationSource === "gps"
    ? Boolean(mapCoordinates && gpsAccuracy !== null)
    : Boolean(selectedPlaceId);
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
    setProfileSaveError("");
    const errorField = field === "phoneCountry" || field === "countryCode" ? "phoneNumber" : field;
    if (errorField in profileFieldErrors) {
      setProfileFieldErrors((current) => ({ ...current, [errorField]: undefined }));
    }
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

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
      setLocationError("Current location is not available in this browser. You can search for your address instead.");
      return;
    }

    setRequestingLocation(true);
    setSelectedPlaceId("");
    setGpsAccuracy(null);
    setLocationError("");
    const requestId = locationRequestIdRef.current + 1;
    locationRequestIdRef.current = requestId;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (locationRequestIdRef.current !== requestId) return;
        const accuracy = position.coords.accuracy;
        if (!Number.isFinite(accuracy) || accuracy > 50) {
          setRequestingLocation(false);
          setLocationError("Your device could not provide a precise enough location. You can try again or search for your address.");
          return;
        }
        setLocationSource("gps");
        setLocationView("review");
        setAddressForm(emptyAddressForm);
        setMapCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGpsAccuracy(accuracy);
        setLocationError("");
        setRequestingLocation(false);
      },
      (error) => {
        if (locationRequestIdRef.current !== requestId) return;
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Search for your address instead."
            : "We couldn't get your location. Search for your address instead.";
        setRequestingLocation(false);
        setLocationError(message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: GPS_BROWSER_TIMEOUT_MS,
      },
    );
  };

  const handleContinue = async () => {
    setProfileValidationVisible(true);
    setProfileSaveError("");
    setProfileFieldErrors({});
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
            phone_number: formatPhoneNumberE164(profileForm),
          }),
        });
      const result = (await response
        .json()
        .catch(() => null)) as ProfileSetupResponse | null;
      if (response.status === 401) await waitForAuthenticationRedirect();
      if (!response.ok) {
        const message = result?.message ?? "Could not complete profile setup.";
        const field = profileFieldForMessage(message);
        if (field) {
          setProfileFieldErrors({ [field]: message });
          window.requestAnimationFrame(() => {
            document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
          });
          return;
        }
        throw new Error(message);
      }
      const profile = await fetchAuthenticatedProfile();
      setAuthSession(profile);
      markProfileDetailsSubmitted();
      setActiveStep("location");
      setLocationView("prompt");
      setProfileValidationVisible(false);
    } catch (error) {
      setProfileSaveError(
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
    if (!locationReady || savingLocation) return;
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
      } else {
        if (!selectedPlaceId) {
          throw new Error("Please search for and select your address again.");
        }
        payload = { placeId: selectedPlaceId, source: "search" };
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
    }, 500);
  };

  const handleSelectPlace = (placeId: string) => {
    setLocationError("");
    const selectedPlace = placePredictions.find(
      (prediction) => prediction.placeId === placeId,
    );
    const description = selectedPlace?.description ?? placeQuery;
    setPlaceQuery(description);
    setPlacePredictions([]);
    setLocationSource("search");
    setSelectedPlaceId(placeId);
    setGpsAccuracy(null);
    setAddressForm({ ...emptyAddressForm, address: description });
    setMapCoordinates(null);
    setLocationView("review");
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
              fieldErrors={profileFieldErrors}
              generalError={profileError}
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
                  placeId={selectedPlaceId}
                  onChangeLocation={handleLocationBack}
                  onPlaceQueryChange={handlePlaceQueryChange}
                  onSelectPlace={handleSelectPlace}
                  placePredictions={placePredictions}
                  placeQuery={placeQuery}
                  requestingPlaceSearch={requestingPlaceSearch}
                  source={locationSource}
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
                      : locationSource === "search"
                          ? "Back to address search"
                          : "Back to location options"}
                  </span>
                </button>
              ) : null}
            </div>

            {displayedStep === "personal" ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:justify-end">
                  <Button
                    disabled={profileSubmitting}
                    onClick={onBack}
                    size="lg"
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="px-6 disabled:bg-[#b8b6cf] disabled:opacity-100"
                    disabled={profileSubmitting}
                    onClick={() => void handleContinue()}
                    size="lg"
                    variant="primary"
                  >
                    {profileSubmitting ? "Saving..." : "Continue"}
                  </Button>
                </div>
              </div>
            ) : locationView === "prompt" ? (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:justify-end">
                <Button
                  onClick={handleSkipLocation}
                  size="lg"
                  variant="secondary"
                >
                  Skip
                </Button>
                <Button
                  className="px-6 disabled:bg-[#b8b6cf] disabled:opacity-100"
                  disabled
                  size="lg"
                  variant="primary"
                >
                  Finish setup
                </Button>
              </div>
            ) : locationView === "search" ? (
              <div className="flex shrink-0 justify-end">
                <Button
                  onClick={handleSkipLocation}
                  size="lg"
                  variant="secondary"
                >
                  Skip
                </Button>
              </div>
            ) : (
              <div className="flex shrink-0 justify-end">
                <button
                  className="h-11 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white disabled:bg-[#b8b6cf]"
                  disabled={!locationReady || savingLocation}
                  onClick={() => void handleFinishSetup()}
                  type="button"
                >
                  {savingLocation ? "Saving..." : "Confirm location"}
                </button>
              </div>
            )}
          </div>
        </footer>
      ) : null}
    </main>
  );
}
