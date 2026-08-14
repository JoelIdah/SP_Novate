"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { useRef, useState } from "react";

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
  resolvingMapLocation: boolean;
  requestingPlaceSearch: boolean;
  onAddressFieldChange: (field: keyof LocationAddressForm, value: string) => void;
  onPlaceQueryChange: (value: string) => void;
  onSelectPlace: (placeId: string) => void;
  onMapLocationChange: (coordinates: LocationCoordinates) => Promise<boolean>;
};

const MAP_ZOOM = 16;
const MAP_LOGICAL_WIDTH = 640;
const MAP_LOGICAL_HEIGHT = 360;

function coordinatesFromOffset(center: LocationCoordinates, offset: { x: number; y: number }, viewport: DOMRect): LocationCoordinates {
  const sinLatitude = Math.sin((center.latitude * Math.PI) / 180);
  const centerWorldX = ((center.longitude + 180) / 360) * 256;
  const centerWorldY = (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) * 256;
  const zoomScale = 2 ** MAP_ZOOM;
  const worldX = centerWorldX + ((offset.x * MAP_LOGICAL_WIDTH) / viewport.width) / zoomScale;
  const worldY = centerWorldY + ((offset.y * MAP_LOGICAL_HEIGHT) / viewport.height) / zoomScale;
  const longitude = (worldX / 256) * 360 - 180;
  const mercator = Math.PI - (2 * Math.PI * worldY) / 256;
  const latitude = (180 / Math.PI) * Math.atan(Math.sinh(mercator));
  return { latitude, longitude };
}

function LocationMap({ coordinates, address, resolving, onLocationChange }: { coordinates: LocationCoordinates | null; address: string; resolving: boolean; onLocationChange: (coordinates: LocationCoordinates) => Promise<boolean> }) {
  const [failedMapUrl, setFailedMapUrl] = useState("");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const offsetRef = useRef(offset);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapUrl = coordinates ? `/api/places/map?latitude=${encodeURIComponent(coordinates.latitude)}&longitude=${encodeURIComponent(coordinates.longitude)}&editable=true` : "";
  const mapFailed = Boolean(mapUrl && failedMapUrl === mapUrl);

  const movePin = (nextOffset: { x: number; y: number }) => {
    offsetRef.current = nextOffset;
    setOffset(nextOffset);
  };

  const commitPin = async () => {
    const viewport = mapRef.current?.getBoundingClientRect();
    if (!coordinates || !viewport || resolving || (offsetRef.current.x === 0 && offsetRef.current.y === 0)) return;
    const nextCoordinates = coordinatesFromOffset(coordinates, offsetRef.current, viewport);
    await onLocationChange(nextCoordinates);
    movePin({ x: 0, y: 0 });
  };

  if (!coordinates || mapFailed) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-[#d7dce7] bg-[#f7f8fb] px-5 text-center text-xs font-medium text-[#8a93a7] sm:h-52">
        {mapFailed ? "The map preview is unavailable, but you can still review and confirm the address." : "A map preview is unavailable for this address."}
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${coordinates.latitude},${coordinates.longitude}`)}`;
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-[#dfe3ec] bg-[#f7f8fb]" ref={mapRef}>
      <Image alt={`Map showing ${address || "the selected address"}`} className="pointer-events-none object-cover" draggable={false} fill onError={() => setFailedMapUrl(mapUrl)} sizes="(max-width: 640px) 100vw, 620px" src={mapUrl} unoptimized />
      <button
        aria-label="Drag the pin to adjust your location"
        className="absolute left-1/2 top-1/2 z-10 -ml-5 -mt-10 cursor-grab touch-none text-[#e34e55] drop-shadow-[0_3px_2px_rgba(0,0,0,0.35)] active:cursor-grabbing disabled:cursor-wait disabled:opacity-65"
        disabled={resolving}
        onKeyDown={(event) => {
          const movement = { ArrowLeft: { x: -8, y: 0 }, ArrowRight: { x: 8, y: 0 }, ArrowUp: { x: 0, y: -8 }, ArrowDown: { x: 0, y: 8 } }[event.key];
          if (!movement) return;
          event.preventDefault();
          movePin({ x: offsetRef.current.x + movement.x, y: offsetRef.current.y + movement.y });
        }}
        onKeyUp={(event) => { if (event.key.startsWith("Arrow")) void commitPin(); }}
        onPointerDown={(event) => {
          if (resolving) return;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId) || !mapRef.current) return;
          const viewport = mapRef.current.getBoundingClientRect();
          movePin({
            x: Math.max((-viewport.width / 2) + 20, Math.min((viewport.width / 2) - 20, event.clientX - viewport.left - viewport.width / 2)),
            y: Math.max((-viewport.height / 2) + 32, Math.min((viewport.height / 2) - 12, event.clientY - viewport.top - viewport.height / 2)),
          });
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          void commitPin();
        }}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        type="button"
      >
        <MapPin aria-hidden fill="white" size={40} strokeWidth={2.5} />
      </button>
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2">
        <span className="rounded-md bg-white/95 px-2 py-1 text-[0.65rem] font-semibold text-[#4f5980] shadow-sm">{resolving ? "Checking location..." : "Drag pin to adjust"}</span>
        <a className="rounded-md bg-white/95 px-2 py-1 text-[0.65rem] font-semibold text-[#3d38c2] shadow-sm" href={googleMapsUrl} rel="noreferrer" target="_blank">View in Google Maps</a>
      </div>
    </div>
  );
}

export function StepTwoAddressConfirm({ addressForm, coordinates, mode, locationError, placePredictions, placeQuery, resolvingMapLocation, requestingPlaceSearch, onAddressFieldChange, onPlaceQueryChange, onSelectPlace, onMapLocationChange }: StepTwoAddressConfirmProps) {
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
          <LocationMap address={addressForm.address} coordinates={coordinates} onLocationChange={onMapLocationChange} resolving={resolvingMapLocation} />
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
