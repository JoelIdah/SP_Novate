import { LocationTargetIcon } from "./icons";

type StepTwoLocationPromptProps = {
  locationError: string;
  placePredictions: Array<{ description: string; placeId: string }>;
  placeQuery: string;
  requestingPlaceSearch: boolean;
  requestingLocation: boolean;
  onAllowLocation: () => void;
  onPlaceQueryChange: (value: string) => void;
  onSearchAddress: () => void;
  onSelectPlace: (placeId: string) => void;
  searchingAddress: boolean;
};

const searchFieldClassName =
  "mt-2 h-10 w-full rounded-[0.5rem] border border-[#d8dde8] bg-white px-4 text-sm font-semibold text-[#4f5980] outline-none focus:border-[#7770df]";

export function StepTwoLocationPrompt({
  locationError,
  placePredictions,
  placeQuery,
  requestingPlaceSearch,
  requestingLocation,
  onAllowLocation,
  onPlaceQueryChange,
  onSearchAddress,
  onSelectPlace,
  searchingAddress,
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
      {locationError ? <p className="mt-3 text-sm font-medium text-[#d04b4b]">{locationError}</p> : null}

      {!searchingAddress ? (
        <button
          className="mt-4 text-sm font-semibold text-[#3d38c2] underline-offset-4 hover:underline"
          onClick={onSearchAddress}
          type="button"
        >
          Search your address instead
        </button>
      ) : null}

      {searchingAddress ? (
        <div className="relative mx-auto mt-4 w-full max-w-[520px] text-left">
          <label className="block text-xs font-semibold text-[#5d6479]">
            Search address
            <input
              autoFocus
              className={searchFieldClassName}
              onChange={(event) => onPlaceQueryChange(event.target.value)}
              placeholder="Start typing your address"
              type="text"
              value={placeQuery}
            />
          </label>
          {requestingPlaceSearch ? <p className="mt-2 text-xs font-medium text-[#8c93a7]">Searching...</p> : null}
          {placePredictions.length > 0 ? (
            <div className="absolute z-10 mt-2 max-h-40 w-full overflow-y-auto rounded-[0.65rem] border border-[#d8dde8] bg-white py-1 shadow-[0_14px_34px_rgba(23,30,63,0.12)]">
              {placePredictions.map((prediction) => (
                <button
                  className="block w-full px-3 py-2 text-left text-xs font-semibold text-[#4f5980] hover:bg-[#f5f7fb]"
                  key={prediction.placeId}
                  onClick={() => onSelectPlace(prediction.placeId)}
                  type="button"
                >
                  {prediction.description}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-sm font-medium text-[#8c93a7]">You can change this later in your settings</p>
    </>
  );
}

