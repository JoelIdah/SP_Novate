"use client";

import Image from "next/image";
import { useState } from "react";

import { FieldLabel } from "./FieldLabel";
import { Notice } from "../../ui/Notice";
import { LocationTargetIcon } from "./icons";

export type LocationAddressForm = {
  address: string;
  country: string;
  postcode: string;
  state: string;
  city: string;
};
export type LocationCoordinates = { latitude: number; longitude: number };

type StepTwoAddressConfirmProps = {
  addressForm: LocationAddressForm;
  coordinates: LocationCoordinates | null;
  mode: "search" | "review";
  locationError: string;
  placeId?: string;
  placePredictions: Array<{ description: string; placeId: string }>;
  placeQuery: string;
  requestingPlaceSearch: boolean;
  source: "gps" | "search";
  onChangeLocation?: () => void;
  onPlaceQueryChange: (value: string) => void;
  onSelectPlace: (placeId: string) => void;
};

export function StepTwoAddressConfirm({
  addressForm,
  coordinates,
  mode,
  locationError,
  placeId,
  placePredictions,
  placeQuery,
  requestingPlaceSearch,
  source,
  onChangeLocation,
  onPlaceQueryChange,
  onSelectPlace,
}: StepTwoAddressConfirmProps) {
  const [failedMapUrl, setFailedMapUrl] = useState("");

  if (mode === "search") {
    return (
      <section className="mx-auto w-full max-w-[38.75rem] py-4 text-center">
        <div className="mx-auto mb-4 w-fit"><LocationTargetIcon /></div>
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">Search for your address</h1>
        <p className="mx-auto mt-2 max-w-[27rem] text-sm font-medium leading-relaxed text-[#8c93a7]">Start typing and select an address from the suggestions.</p>
        <div className="mx-auto mt-6 w-full text-left">
          <label className="block">
            <FieldLabel>Search address</FieldLabel>
            <input autoComplete="street-address" autoFocus className="mt-1.5 h-11 w-full rounded-lg border border-[#bfc6d5] bg-white px-4 text-sm font-semibold text-[#4f5980] outline-none focus:border-[#6d63ee] focus:ring-2 focus:ring-[#6d63ee]/15" onChange={(event) => onPlaceQueryChange(event.target.value)} placeholder="Start typing an address" type="search" value={placeQuery} />
          </label>
          {requestingPlaceSearch ? <p className="mt-2 text-xs font-medium text-[#8c93a7]">Searching addresses...</p> : null}
          {placePredictions.length > 0 ? (
            <div className="mt-2 w-full rounded-[0.65rem] border border-[#d8dde8] bg-white py-1 shadow-[0_14px_34px_rgba(23,30,63,0.14)]">
              {placePredictions.map((prediction) => <button className="block w-full px-4 py-3 text-left text-xs font-semibold text-[#4f5980] hover:bg-[#f5f7fb]" key={prediction.placeId} onClick={() => onSelectPlace(prediction.placeId)} type="button">{prediction.description}</button>)}
            </div>
          ) : null}
          {locationError ? <Notice className="mt-3 text-xs" role="alert">{locationError}</Notice> : null}
        </div>
      </section>
    );
  }

  const usingGps = source === "gps";
  const mapUrl = coordinates
    ? `/api/places/map?latitude=${encodeURIComponent(coordinates.latitude)}&longitude=${encodeURIComponent(coordinates.longitude)}`
    : placeId
      ? `/api/places/map?placeId=${encodeURIComponent(placeId)}`
      : "";
  const mapFailed = Boolean(mapUrl && failedMapUrl === mapUrl);
  const map = mapUrl && !mapFailed ? (
    <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-xl border border-[#dfe3ec] bg-[#f5f7fb]">
      <Image
        alt={`Map showing ${addressForm.address || "the selected location"}`}
        className="object-cover"
        fill
        onError={() => setFailedMapUrl(mapUrl)}
        sizes="(max-width: 640px) calc(100vw - 3.5rem), 590px"
        src={mapUrl}
        unoptimized
      />
    </div>
  ) : (
    <div className="mt-3 flex aspect-[16/9] items-center justify-center rounded-xl border border-dashed border-[#d7dce7] bg-[#f7f8fb] px-5 text-center text-xs font-medium text-[#8a93a7]">
      The map preview is unavailable. You can still confirm the selected location.
    </div>
  );
  return (
    <section className="mx-auto w-full max-w-[38.75rem] py-4 text-center">
      <div className="mx-auto mb-4 w-fit"><LocationTargetIcon /></div>
      <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1d2331] sm:text-3xl">{usingGps ? "Location found" : "Confirm this address"}</h1>
      <p className="mx-auto mt-2 max-w-[27rem] text-sm font-medium leading-relaxed text-[#8c93a7]">
        {usingGps ? "Your device location is ready to be saved." : "We’ll verify this address when you continue."}
      </p>
      <div className="mt-5 rounded-2xl border border-[#e1e5ed] bg-white p-3 text-left shadow-[0_8px_24px_rgba(31,40,74,0.04)] sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-[#8a93a7]">
            {usingGps ? "Selected location" : "Selected address"}
          </p>
          {onChangeLocation ? (
            <button
              className="shrink-0 text-xs font-semibold text-brand-accent hover:underline"
              onClick={onChangeLocation}
              type="button"
            >
              Change
            </button>
          ) : null}
        </div>
        {addressForm.address ? (
          <p className="mt-1 text-sm font-semibold leading-relaxed text-[#35405a]">{addressForm.address}</p>
        ) : null}
        {map}
      </div>
      {locationError ? <Notice className="mt-3 text-xs" role="alert">{locationError}</Notice> : null}
    </section>
  );
}
