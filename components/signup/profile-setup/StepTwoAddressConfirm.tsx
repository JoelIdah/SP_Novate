"use client";

import Image from "next/image";
import { useState } from "react";

import { FieldLabel } from "./FieldLabel";
import { LocationTargetIcon } from "./icons";

export type LocationAddressForm = { address: string; country: string; postcode: string; state: string; city: string };
export type LocationCoordinates = { latitude: number; longitude: number };

const fieldClassName = "profile-setup-field mt-1.5 h-11 w-full rounded-lg border border-[#d8dde8] bg-white px-4 text-sm font-semibold text-[#4f5980] outline-none";

type StepTwoAddressConfirmProps = {
  addressForm: LocationAddressForm;
  coordinates: LocationCoordinates | null;
  mode: "search" | "review" | "edit";
  locationError: string;
  placePredictions: Array<{ description: string; placeId: string }>;
  placeQuery: string;
  requestingPlaceSearch: boolean;
  onAddressFieldChange: (field: keyof LocationAddressForm, value: string) => void;
  onPlaceQueryChange: (value: string) => void;
  onSelectPlace: (placeId: string) => void;
};

function LocationMap({ coordinates, address }: { coordinates: LocationCoordinates | null; address: string }) {
  const [failedMapUrl, setFailedMapUrl] = useState("");
  const mapUrl = coordinates ? `/api/places/map?latitude=${encodeURIComponent(coordinates.latitude)}&longitude=${encodeURIComponent(coordinates.longitude)}` : "";
  const mapFailed = Boolean(mapUrl && failedMapUrl === mapUrl);

  if (!coordinates || mapFailed) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-[#d7dce7] bg-[#f7f8fb] px-5 text-center text-xs font-medium text-[#8a93a7] sm:h-52">
        {mapFailed ? "The map preview is unavailable, but you can still review and confirm the address." : "A map preview is unavailable for this address."}
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${coordinates.latitude},${coordinates.longitude}`)}`;
  return (
    <a aria-label={`View ${address || "selected address"} in Google Maps`} className="group relative block h-44 overflow-hidden rounded-xl border border-[#dfe3ec] bg-[#f7f8fb] sm:h-52" href={googleMapsUrl} rel="noreferrer" target="_blank">
      <Image alt={`Map showing ${address || "the selected address"}`} className="object-cover transition-transform duration-200 group-hover:scale-[1.01]" fill onError={() => setFailedMapUrl(mapUrl)} sizes="(max-width: 640px) 100vw, 620px" src={mapUrl} unoptimized />
      <span className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-1 text-[0.65rem] font-semibold text-[#3d38c2] shadow-sm">View in Google Maps</span>
    </a>
  );
}

export function StepTwoAddressConfirm({ addressForm, coordinates, mode, locationError, placePredictions, placeQuery, requestingPlaceSearch, onAddressFieldChange, onPlaceQueryChange, onSelectPlace }: StepTwoAddressConfirmProps) {
  if (mode === "search") {
    return (
      <section className="mx-auto w-full max-w-[38.75rem] py-4 text-center">
        <div className="mx-auto mb-4 w-fit"><LocationTargetIcon /></div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">Search for your address</h1>
        <p className="mx-auto mt-2 max-w-[27rem] text-sm font-medium leading-relaxed text-[#8c93a7]">Start typing and select the closest matching address from the suggestions.</p>
        <div className="relative mx-auto mt-6 w-full text-left">
          <label className="block">
            <FieldLabel>Search address</FieldLabel>
            <input autoFocus className="mt-1.5 h-11 w-full rounded-lg border border-[#bfc6d5] bg-white px-4 text-sm font-semibold text-[#4f5980] outline-none focus:border-[#6d63ee] focus:ring-2 focus:ring-[#6d63ee]/15" onChange={(event) => onPlaceQueryChange(event.target.value)} placeholder="Start typing an address" type="search" value={placeQuery} />
          </label>
          {requestingPlaceSearch ? <p className="mt-2 text-xs font-medium text-[#8c93a7]">Searching addresses...</p> : null}
          {placePredictions.length > 0 ? (
            <div className="absolute z-20 mt-2 max-h-52 w-full overflow-y-auto rounded-[0.65rem] border border-[#d8dde8] bg-white py-1 shadow-[0_14px_34px_rgba(23,30,63,0.14)]">
              {placePredictions.map((prediction) => <button className="block w-full px-4 py-3 text-left text-xs font-semibold text-[#4f5980] hover:bg-[#f5f7fb]" key={prediction.placeId} onClick={() => onSelectPlace(prediction.placeId)} type="button">{prediction.description}</button>)}
            </div>
          ) : null}
          {locationError ? <p className="mt-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium leading-relaxed text-[#8b5a20]" role="status">{locationError}</p> : null}
        </div>
      </section>
    );
  }

  if (mode === "review") {
    return (
      <section className="mx-auto w-full max-w-[38.75rem] py-4 text-center">
        <div className="mx-auto mb-4 w-fit"><LocationTargetIcon /></div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">Is this your current address?</h1>
        <div className="mt-5 rounded-2xl border border-[#e1e5ed] bg-white p-3 text-left shadow-[0_8px_24px_rgba(31,40,74,0.04)] sm:p-4">
          <p className="text-xs font-medium text-[#8a93a7]">Address</p>
          <p className="mb-3 mt-1 text-sm font-semibold leading-relaxed text-[#35405a]">{addressForm.address}</p>
          <LocationMap address={addressForm.address} coordinates={coordinates} />
        </div>
        {locationError ? <p className="mt-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium leading-relaxed text-[#8b5a20]" role="alert">{locationError}</p> : null}
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[38.75rem] py-4 text-center">
      <div className="mx-auto mb-4 w-fit"><LocationTargetIcon /></div>
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">Edit your address</h1>
      <p className="mx-auto mt-2 max-w-[27rem] text-sm font-medium leading-relaxed text-[#8c93a7]">Update any incorrect details, then confirm your address.</p>
      <div className="mx-auto mt-5 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <label className="sm:col-span-2"><FieldLabel required>Address</FieldLabel><input autoFocus className={fieldClassName} onChange={(event) => onAddressFieldChange("address", event.target.value)} placeholder="Enter your street address" type="text" value={addressForm.address} /></label>
        <label><FieldLabel required>Country</FieldLabel><input className={fieldClassName} onChange={(event) => onAddressFieldChange("country", event.target.value)} placeholder="Country" type="text" value={addressForm.country} /></label>
        <label><FieldLabel optional>Postcode</FieldLabel><input className={fieldClassName} onChange={(event) => onAddressFieldChange("postcode", event.target.value)} placeholder="Postcode" type="text" value={addressForm.postcode} /></label>
        <label><FieldLabel required>State</FieldLabel><input className={fieldClassName} onChange={(event) => onAddressFieldChange("state", event.target.value)} placeholder="State" type="text" value={addressForm.state} /></label>
        <label><FieldLabel required>City</FieldLabel><input className={fieldClassName} onChange={(event) => onAddressFieldChange("city", event.target.value)} placeholder="City" type="text" value={addressForm.city} /></label>
      </div>
      {locationError ? <p className="mt-3 rounded-lg border border-[#f0d6b5] bg-[#fff9f1] px-3 py-2 text-xs font-medium leading-relaxed text-[#8b5a20]" role="alert">{locationError}</p> : null}
    </section>
  );
}
