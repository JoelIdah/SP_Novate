import { LocationTargetIcon } from "./icons";

type StepTwoLocationPromptProps = {
  locationError: string;
  requestingLocation: boolean;
  onAllowLocation: () => void;
  onEnterAddress: () => void;
  variant?: "student" | "tutor";
};

export function StepTwoLocationPrompt({
  locationError,
  requestingLocation,
  onAllowLocation,
  onEnterAddress,
  variant = "student",
}: StepTwoLocationPromptProps) {
  const tutor = variant === "tutor";
  return (
    <section className="mx-auto w-full max-w-[32rem] py-4 text-center">
      <div className="mx-auto mb-5 w-fit">
        <LocationTargetIcon />
      </div>
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">{tutor ? "Allow students to find you easily" : "Find tutors near you"}</h1>
      <p className="mx-auto mt-3 max-w-[25rem] text-sm font-medium leading-relaxed text-[#8c93a7]">
        {tutor ? "Share your tutoring location so nearby students can discover and book you." : "Use your current location for better tutor recommendations. You can also search for an address."}
      </p>

      <div className="mx-auto mt-6 flex w-full max-w-[18rem] flex-col gap-3">
        <button
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#231d71] px-8 text-sm font-semibold text-white hover:bg-[#1c175f] disabled:cursor-wait disabled:opacity-70"
          disabled={requestingLocation}
          onClick={onAllowLocation}
          type="button"
        >
          {requestingLocation ? "Finding your location..." : tutor ? "Allow location access" : "Use my current location"}
        </button>
        <button
          className="h-11 rounded-full border border-[#d8dde8] bg-white px-6 text-sm font-semibold text-[#3d38c2] hover:bg-[#f8f9fb]"
          onClick={onEnterAddress}
          type="button"
        >
          Search for an address
        </button>
      </div>

      {requestingLocation ? <p className="mt-4 text-xs font-medium text-[#7d869c]">This may take a few seconds. You can enter an address instead at any time.</p> : null}
      {locationError ? <p className="mx-auto mt-4 max-w-[28rem] text-sm font-medium text-[#d04b4b]" role="alert">{locationError}</p> : null}
      <p className="mt-4 text-sm font-medium text-[#8c93a7]">You can add or change this later in your settings.</p>
    </section>
  );
}
