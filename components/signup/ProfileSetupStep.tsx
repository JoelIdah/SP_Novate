"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { SetupSuccessView } from "./profile-setup/SetupSuccessView";
import { StepTwoAddressConfirm, type LocationAddressForm } from "./profile-setup/StepTwoAddressConfirm";
import { StepOneProfileForm } from "./profile-setup/StepOneProfileForm";
import { StepTwoLocationPrompt } from "./profile-setup/StepTwoLocationPrompt";
import type { SetupMode, SetupStepId, SignUpRole } from "./types";
import {
  initialProfileForm,
  type ProfileFormState,
} from "./utils";

type SetupStep = "personal" | "location";
type LocationView = "prompt" | "confirm";
const REQUIRED_GPS_ACCURACY_METERS = 50;
const LOCATION_ACQUISITION_TIMEOUT_MS = 30000;

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
    latitude?: number;
    longitude?: number;
  } | null;
};

const emptyAddressForm: LocationAddressForm = {
  address: "",
  country: "",
  postcode: "",
  state: "",
  city: "",
};
const steps: Array<{ id: SetupStep; label: string }> = [
  { id: "personal", label: "Profile set up" },
  { id: "location", label: "Location access" },
];

function toSetupStep(stepId?: SetupStepId): SetupStep {
  return stepId === "location" ? "location" : "personal";
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
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
  role: SignUpRole | null;
}) {
  const initialStep = toSetupStep(initialStepId);
  const [activeStep, setActiveStep] = useState<SetupStep>(initialStep);
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
  const [locationView, setLocationView] = useState<LocationView>("prompt");
  const [locationError, setLocationError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<LocationAddressForm>(emptyAddressForm);
  const [placeQuery, setPlaceQuery] = useState("");
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>([]);
  const locationWatchIdRef = useRef<number | null>(null);
  const locationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeStepIndex = activeStep === "location" ? 1 : 0;
  const profileValid = true;
  const greetingName = profileForm.firstName.trim() || initialProfile?.firstName?.trim() || "there";
  const userEmail = profileForm.email.trim() || "Complete your profile";

  useEffect(() => {
    if (!onStateChange) return;
    onStateChange({
      mode: setupComplete ? "success" : "form",
      stepId: activeStep,
    });
  }, [activeStep, onStateChange, setupComplete]);

  useEffect(() => {
    return () => {
      if (locationWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
      }
      if (locationTimeoutRef.current !== null) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, []);

  const updateProfileField = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const getLocationToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("sp_profile_setup_token") || localStorage.getItem("sp_access_token") || "";
  };

  const readAddressFromResponse = (
    data: LocationUpdateResponse["data"],
    fallback?: Partial<LocationAddressForm>,
  ): LocationAddressForm => ({
    address: data?.address ?? fallback?.address ?? "",
    country: data?.country ?? fallback?.country ?? "",
    postcode: data?.postcode ?? data?.postal_code ?? fallback?.postcode ?? "",
    state: data?.state ?? fallback?.state ?? "",
    city: data?.city ?? fallback?.city ?? "",
  });

  const submitLocationUpdate = async (payload: Record<string, string | number>) => {
    const token = getLocationToken();
    if (!token) {
      throw new Error("Missing auth token. Please sign in again.");
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/user/locations/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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

    if (!response.ok) {
      throw new Error(data?.message ?? "Could not save location.");
    }

    return data ?? { message: "Location saved.", data: null };
  };

  const handleAllowLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Location is not supported on this browser.");
      return;
    }

    setRequestingLocation(true);
    setLocationError("");
    setLocationStatus("");

    let submitting = false;

    const stopWatching = () => {
      if (locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
        locationWatchIdRef.current = null;
      }
      if (locationTimeoutRef.current !== null) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }
    };

    locationWatchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const accuracy = position.coords.accuracy;

        if (accuracy > REQUIRED_GPS_ACCURACY_METERS || submitting) return;

        submitting = true;
        stopWatching();

        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const result = await submitLocationUpdate({
            accuracy,
            latitude: lat,
            longitude: lon,
            source: "gps",
          });
          setAddressConfirmed(false);
          setSearchingAddress(false);
          setLocationView("confirm");
          setAddressForm(
            readAddressFromResponse(result.data, {
              address: `Lat ${lat.toFixed(5)}, Lng ${lon.toFixed(5)}`,
            }),
          );
          setLocationStatus(result.message ?? "Location saved.");
          setLocationError("");
        } catch (error) {
          setLocationStatus("");
          setLocationError(error instanceof Error ? error.message : "Could not save your location.");
        } finally {
          setRequestingLocation(false);
        }
      },
      (error) => {
        stopWatching();
        const message = error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Allow precise location and try again, or use the address search below."
          : "We couldn't get a sufficiently precise location from this device. Use the address search below instead, or enable precise location and try again.";
        setLocationError(message);
        setSearchingAddress(true);
        setRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: LOCATION_ACQUISITION_TIMEOUT_MS,
      },
    );

    locationTimeoutRef.current = setTimeout(() => {
      stopWatching();
      setLocationError(
        "We couldn't get a sufficiently precise location from this device. Use the address search below instead, or enable precise location and try again.",
      );
      setSearchingAddress(true);
      setRequestingLocation(false);
    }, LOCATION_ACQUISITION_TIMEOUT_MS);
  };

  const handleContinue = () => {
    if (!profileValid) return;
    setActiveStep("location");
    setLocationView("prompt");
  };

  const handleSkipLocation = () => {
    setSetupComplete(true);
  };

  const handleFinishSetup = () => {
    if (!addressConfirmed) return;
    setSetupComplete(true);
  };

  const handlePlaceQueryChange = async (value: string) => {
    setPlaceQuery(value);
    setLocationError("");
    setPlacePredictions([]);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!value.trim()) return;
    if (!apiKey) {
      setLocationError("Google Places search is not configured.");
      return;
    }

    setRequestingPlaceSearch(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(value.trim())}&key=${encodeURIComponent(apiKey)}`,
      );
      const data = (await response.json()) as {
        predictions?: Array<{ description?: string; place_id?: string }>;
        error_message?: string;
        status?: string;
      };

      if (!response.ok || (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS")) {
        throw new Error(data.error_message ?? "Could not search addresses.");
      }

      setPlacePredictions(
        (data.predictions ?? [])
          .filter((prediction) => prediction.description && prediction.place_id)
          .map((prediction) => ({
            description: prediction.description!,
            placeId: prediction.place_id!,
          })),
      );
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Could not search addresses.");
    } finally {
      setRequestingPlaceSearch(false);
    }
  };

  const handleSelectPlace = async (placeId: string) => {
    setRequestingPlaceSearch(true);
    setLocationError("");
    try {
      const result = await submitLocationUpdate({
        placeId,
        source: "search",
      });
      const selectedPlace = placePredictions.find((prediction) => prediction.placeId === placeId);
      setPlaceQuery(selectedPlace?.description ?? placeQuery);
      setPlacePredictions([]);
      setAddressConfirmed(false);
      setSearchingAddress(false);
      setLocationView("confirm");
      setAddressForm(
        readAddressFromResponse(result.data, {
          address: selectedPlace?.description ?? placeQuery,
        }),
      );
      setLocationStatus(result.message ?? "Location saved.");
    } catch (error) {
      setLocationStatus("");
      setLocationError(error instanceof Error ? error.message : "Could not save selected address.");
    } finally {
      setRequestingPlaceSearch(false);
    }
  };

  const currentStep = steps[activeStepIndex];
  const dashboardHref = "/students/dashboard";

  return (
    <main className="flex h-[100svh] flex-col overflow-hidden bg-white text-[#171c2a]">
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e5e8f2] bg-white px-4 shadow-[0_6px_18px_rgba(27,31,59,0.06)] sm:px-5">
        <Image alt="SP Novate" className="h-8 w-auto" height={32} priority src="/logo/logo.png" width={32} />
        <button className="flex min-w-0 max-w-[70vw] items-center gap-2 rounded-full border border-[#e1e5f0] bg-white px-2 py-1.5 text-left shadow-[0_4px_14px_rgba(27,31,59,0.06)] sm:max-w-[22rem]" type="button">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#3d38c2] text-xs font-bold text-white">
            {greetingName.charAt(0).toUpperCase()}
          </span>
          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block truncate text-xs font-bold text-[#3d38c2]">Welcome back, {greetingName}!</span>
            <span className="block truncate text-[0.66rem] font-medium text-[#28306f]">{userEmail}</span>
          </span>
          <span className="shrink-0 text-[#1d2440]">
            <ChevronDownIcon />
          </span>
        </button>
      </header>

      <section className="min-h-0 flex-1 overflow-hidden px-4 py-3 sm:px-6 sm:py-5">
        <div className="flex h-full min-h-0 items-center justify-center">
        {setupComplete ? (
          <SetupSuccessView dashboardHref={dashboardHref} />
        ) : activeStep === "personal" ? (
          <StepOneProfileForm greetingName={greetingName} onProfileFieldChange={updateProfileField} profileForm={profileForm} />
        ) : (
          <div className="w-full text-center">
            {locationView === "prompt" ? (
              <StepTwoLocationPrompt
                locationError={locationError}
                onAllowLocation={handleAllowLocation}
                onPlaceQueryChange={handlePlaceQueryChange}
                onSearchAddress={() => {
                  setSearchingAddress(true);
                  setLocationError("");
                }}
                onSelectPlace={handleSelectPlace}
                placePredictions={placePredictions}
                placeQuery={placeQuery}
                requestingPlaceSearch={requestingPlaceSearch}
                requestingLocation={requestingLocation}
                searchingAddress={searchingAddress}
              />
            ) : (
              <StepTwoAddressConfirm
                addressForm={addressForm}
                locationError={locationError}
                locationStatus={locationStatus}
                onConfirmAddress={() => setAddressConfirmed(true)}
                onPlaceQueryChange={handlePlaceQueryChange}
                onRejectAddress={() => {
                  setSearchingAddress(true);
                  setAddressConfirmed(false);
                  setLocationStatus("");
                }}
                onSelectPlace={handleSelectPlace}
                placePredictions={placePredictions}
                placeQuery={placeQuery}
                requestingPlaceSearch={requestingPlaceSearch}
                searchingAddress={searchingAddress}
              />
            )}
          </div>
        )}
        </div>
      </section>

      {!setupComplete ? (
        <footer className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-t border-[#e5e8f2] bg-white px-4 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 text-xs text-[#30384f]">
            <span className="shrink-0 rounded-full border border-[#6d63ee] bg-white px-2 py-1 font-semibold text-[#5b4ded]">
              Step {activeStepIndex + 1}/2
            </span>
            <span aria-hidden className="text-[#7c8498]">&gt;</span>
            <span className="truncate font-semibold">{currentStep.label}</span>
          </div>

          {activeStep === "personal" ? (
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button className="h-9 rounded-full border border-[#8278ef] bg-white px-4 text-sm font-semibold text-[#24206f] sm:px-5" onClick={onBack} type="button">
                Cancel
              </button>
              <button
                className="h-9 rounded-full bg-[#17135f] px-4 text-sm font-semibold text-white disabled:bg-[#b5b3cc] sm:px-6"
                disabled={!profileValid}
                onClick={handleContinue}
                type="button"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center justify-end gap-2">
              <button className="h-9 rounded-full border border-[#e0e4ed] bg-white px-4 text-sm font-semibold text-[#273044] sm:px-5" onClick={handleSkipLocation} type="button">
                Skip
              </button>
              <button
                className="h-9 rounded-full bg-[#17135f] px-4 text-sm font-semibold text-white disabled:bg-[#b8b6cf] sm:px-6"
                disabled={!addressConfirmed}
                onClick={handleFinishSetup}
                type="button"
              >
                Finish setup
              </button>
            </div>
          )}
        </footer>
      ) : null}
    </main>
  );
}
