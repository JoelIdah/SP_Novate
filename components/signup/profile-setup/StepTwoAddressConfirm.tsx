import { FieldLabel } from "./FieldLabel";
import { LocationTargetIcon } from "./icons";
import type { AddressState } from "../utils";

type StepTwoAddressConfirmProps = {
  addressConfirmed: boolean;
  addressForm: AddressState;
  isAddressFilled: boolean;
  onAddressFieldChange: (field: keyof AddressState, value: string) => void;
  onRejectAddress: () => void;
  onConfirmAddress: () => void;
};

export function StepTwoAddressConfirm({
  addressConfirmed,
  addressForm,
  isAddressFilled,
  onAddressFieldChange,
  onRejectAddress,
  onConfirmAddress,
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

      <div className="mx-auto mt-6 grid max-w-[620px] grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <label className="sm:col-span-2"><FieldLabel>Address</FieldLabel><input className="mt-1.5 h-10 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onAddressFieldChange("address", e.target.value)} type="text" value={addressForm.address} /></label>
        <label><FieldLabel>Country</FieldLabel><input className="mt-1.5 h-10 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onAddressFieldChange("country", e.target.value)} type="text" value={addressForm.country} /></label>
        <label><FieldLabel>Postcode</FieldLabel><input className="mt-1.5 h-10 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onAddressFieldChange("postcode", e.target.value)} type="text" value={addressForm.postcode} /></label>
        <label><FieldLabel>State</FieldLabel><input className="mt-1.5 h-10 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onAddressFieldChange("state", e.target.value)} type="text" value={addressForm.state} /></label>
        <label><FieldLabel>City</FieldLabel><input className="mt-1.5 h-10 w-full rounded-lg border border-[#d8dde8] bg-white px-3 text-sm text-[#37405a] outline-none focus:border-[#b7bfd3]" onChange={(e) => onAddressFieldChange("city", e.target.value)} type="text" value={addressForm.city} /></label>
      </div>

      <div className="mx-auto mt-6 flex max-w-[620px] flex-wrap items-center justify-end gap-3">
        <button
          className="h-10 rounded-full border border-[#d8dde8] bg-white px-5 text-sm font-semibold text-[#6f778c] hover:bg-[#f8fafc]"
          onClick={onRejectAddress}
          type="button"
        >
          No, it is not
        </button>
        <button
          className={`h-10 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-55 ${
            addressConfirmed ? "bg-[#231d71] shadow-[0_10px_24px_rgba(35,29,113,0.35)]" : "bg-[#6c68c0] hover:bg-[#5954b3]"
          }`}
          disabled={!isAddressFilled}
          onClick={onConfirmAddress}
          type="button"
        >
          Yes this is my address
        </button>
      </div>
    </>
  );
}
