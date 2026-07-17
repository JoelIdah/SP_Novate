"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { SetupSuccessView } from "./profile-setup/SetupSuccessView";
import { StepOneProfileForm } from "./profile-setup/StepOneProfileForm";
import { StepTwoAddressConfirm } from "./profile-setup/StepTwoAddressConfirm";
import { StepTwoLocationPrompt } from "./profile-setup/StepTwoLocationPrompt";
import type { SetupMode, SetupStepId, SignUpRole } from "./types";
import {
  initialAddress,
  initialProfileForm,
  isAddressFilled,
  parseReverseGeocodeResult,
  type AddressState,
  type ProfileFormState,
} from "./utils";

type SetupStep = "personal" | "location";
type LocationView = "prompt" | "confirm";

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
  const [addressForm, setAddressForm] = useState<AddressState>(initialAddress);
  const [locationView, setLocationView] = useState<LocationView>(initialMode === "review" ? "confirm" : "prompt");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [addressConfirmed, setAddressConfirmed] = useState(false);

  const activeStepIndex = activeStep === "location" ? 1 : 0;
  const profileValid = true;
  const addressFilled = useMemo(() => isAddressFilled(addressForm), [addressForm]);
  const greetingName = profileForm.firstName.trim() || initialProfile?.firstName?.trim() || "there";
  const userEmail = profileForm.email.trim() || "Complete your profile";

  useEffect(() => {
    if (!onStateChange) return;
    onStateChange({
      mode: setupComplete ? "success" : "form",
      stepId: activeStep,
    });
  }, [activeStep, onStateChange, setupComplete]);

  const updateProfileField = (field: keyof ProfileFormState, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddressField = (field: keyof AddressState, value: string) => {
    setAddressConfirmed(false);
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAllowLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Location is not supported on this browser.");
      return;
    }

    setRequestingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`,
          );

          if (!response.ok) throw new Error("Could not fetch address details.");

          const data = await response.json();
          setCoords({ lat, lon });
          setAddressForm(parseReverseGeocodeResult(data, lat, lon));
          setAddressConfirmed(false);
          setLocationView("confirm");
        } catch (error) {
          setLocationError(error instanceof Error ? error.message : "Could not fetch your address.");
        } finally {
          setRequestingLocation(false);
        }
      },
      () => {
        setLocationError("Location permission was denied or unavailable.");
        setRequestingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 },
    );
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
              <StepTwoLocationPrompt locationError={locationError} onAllowLocation={handleAllowLocation} requestingLocation={requestingLocation} />
            ) : (
              <StepTwoAddressConfirm
                addressConfirmed={addressConfirmed}
                addressForm={addressForm}
                isAddressFilled={addressFilled}
                onAddressFieldChange={updateAddressField}
                onConfirmAddress={() => setAddressConfirmed(true)}
                onRejectAddress={() => {
                  setAddressConfirmed(false);
                  setLocationView("prompt");
                }}
              />
            )}
            <div className="sr-only">Coordinates: {coords ? `${coords.lat},${coords.lon}` : "not set"}</div>
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
