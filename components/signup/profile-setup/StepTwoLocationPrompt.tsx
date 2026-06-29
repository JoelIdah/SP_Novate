import { LocationTargetIcon } from "./icons";

type StepTwoLocationPromptProps = {
  locationError: string;
  requestingLocation: boolean;
  onAllowLocation: () => void;
};

export function StepTwoLocationPrompt({
  locationError,
  requestingLocation,
  onAllowLocation,
}: StepTwoLocationPromptProps) {
  return (
    <>
      <div className="mx-auto mb-5 w-fit">
        <LocationTargetIcon />
      </div>
      <h1 className="text-[2.2rem] font-bold tracking-[-0.02em] text-[#1d2331]">Find tutors near you</h1>
      <p className="mx-auto mt-3 max-w-[390px] text-sm font-medium leading-relaxed text-[#8c93a7]">
        Allow location access so we can show you the best tutors available in your area and help you book sessions faster.
      </p>
      <button
        className="mt-6 h-11 rounded-full bg-[#231d71] px-8 text-sm font-semibold text-white hover:bg-[#1c175f] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={requestingLocation}
        onClick={onAllowLocation}
        type="button"
      >
        {requestingLocation ? "Requesting location..." : "Allow location access"}
      </button>
      <p className="mt-4 text-sm font-medium text-[#8c93a7]">You can change this later in your settings</p>
      {locationError ? <p className="mt-3 text-sm font-medium text-[#d04b4b]">{locationError}</p> : null}
    </>
  );
}

