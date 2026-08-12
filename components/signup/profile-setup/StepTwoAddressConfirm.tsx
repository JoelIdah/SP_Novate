import { FieldLabel } from "./FieldLabel";
import { LocationTargetIcon } from "./icons";

export type LocationAddressForm = {
  address: string;
  country: string;
  postcode: string;
  state: string;
  city: string;
};

const fieldClassName =
  "profile-setup-field mt-[0.4em] h-10 w-full rounded-[0.5em] border border-[#d8dde8] bg-white px-[1em] text-sm font-semibold text-[#4f5980] outline-none";

type StepTwoAddressConfirmProps = {
  addressForm: LocationAddressForm;
  locationError: string;
  locationStatus: string;
  placePredictions: Array<{ description: string; placeId: string }>;
  placeQuery: string;
  requestingPlaceSearch: boolean;
  searchingAddress: boolean;
  onRejectAddress: () => void;
  onConfirmAddress: () => void;
  onPlaceQueryChange: (value: string) => void;
  onSelectPlace: (placeId: string) => void;
};

export function StepTwoAddressConfirm({
  addressForm,
  locationError,
  locationStatus,
  placePredictions,
  placeQuery,
  requestingPlaceSearch,
  searchingAddress,
  onRejectAddress,
  onConfirmAddress,
  onPlaceQueryChange,
  onSelectPlace,
}: StepTwoAddressConfirmProps) {
  return (
    <>
      <div className="mx-auto mb-5 w-fit">
        <LocationTargetIcon />
      </div>
      <h1 className="text-[2.2rem] font-bold tracking-[-0.02em] text-[#1d2331]">Confirm address</h1>
      <p className="mx-auto mt-3 max-w-[390px] text-sm font-medium leading-relaxed text-[#8c93a7]">
        Please confirm if this address is your actual location
      </p>

      {searchingAddress ? (
        <div className="mx-auto mt-5 w-full max-w-[620px] text-left">
          <label className="block text-xs font-semibold text-[#5d6479]">
            Search address
            <input
              className={fieldClassName}
              onChange={(event) => onPlaceQueryChange(event.target.value)}
              placeholder="Start typing your address"
              type="text"
              value={placeQuery}
            />
          </label>
          {requestingPlaceSearch ? <p className="mt-2 text-xs font-medium text-[#8c93a7]">Searching...</p> : null}
          {placePredictions.length > 0 ? (
            <div className="mt-2 max-h-36 overflow-y-auto rounded-[0.65rem] border border-[#d8dde8] bg-white py-1 shadow-[0_14px_34px_rgba(23,30,63,0.12)]">
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

      <div className="mx-auto mt-6 grid max-w-[620px] grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <label className="sm:col-span-2"><FieldLabel>Address</FieldLabel><input className={fieldClassName} readOnly type="text" value={addressForm.address} /></label>
        <label><FieldLabel>Country</FieldLabel><input className={fieldClassName} readOnly type="text" value={addressForm.country} /></label>
        <label><FieldLabel>Postcode</FieldLabel><input className={fieldClassName} readOnly type="text" value={addressForm.postcode} /></label>
        <label><FieldLabel>State</FieldLabel><input className={fieldClassName} readOnly type="text" value={addressForm.state} /></label>
        <label><FieldLabel>City</FieldLabel><input className={fieldClassName} readOnly type="text" value={addressForm.city} /></label>
      </div>

      <div className="mx-auto mt-6 flex max-w-[620px] flex-wrap items-center justify-end gap-3">
        <button
          className="h-10 rounded-full border border-[#d8dde8] bg-white px-5 text-sm font-semibold text-[#273044] hover:bg-[#f8fafc]"
          onClick={onRejectAddress}
          type="button"
        >
          No, it is not
        </button>
        <button
          className="h-10 rounded-full bg-[#231d71] px-6 text-sm font-semibold text-white hover:bg-[#1c175f]"
          onClick={onConfirmAddress}
          type="button"
        >
          Yes this is my address
        </button>
      </div>

      {locationStatus ? <p className="mt-3 text-sm font-semibold text-[#247f57]">{locationStatus}</p> : null}
      {locationError ? <p className="mt-3 text-sm font-medium text-[#d04b4b]">{locationError}</p> : null}
    </>
  );
}
