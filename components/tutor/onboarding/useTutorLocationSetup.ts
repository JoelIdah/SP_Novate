"use client";

import { useEffect, useRef, useState } from "react";

import type { LocationAddressForm, LocationCoordinates } from "../../signup/profile-setup/StepTwoAddressConfirm";
import { saveTutorLocation } from "./tutorOnboardingApi";

export type TutorLocationView = "prompt" | "search" | "review" | "edit";
export type TutorLocationSummary = {
  address: LocationAddressForm;
  coordinates: LocationCoordinates | null;
};

type PlacePrediction = { description: string; placeId: string };
type PlaceData = {
  address?: string;
  country?: string;
  postcode?: string;
  postal_code?: string;
  state?: string;
  city?: string;
  placeId?: string;
  latitude?: number;
  longitude?: number;
};
type PlaceResponse = { message?: string; data?: PlaceData | null; predictions?: PlacePrediction[] };
type LocationSource = "gps" | "search" | "manual";

const emptyAddress: LocationAddressForm = { address: "", country: "", postcode: "", state: "", city: "" };
const GPS_TIMEOUT_MS = 10000;

function firstNonEmpty(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim())?.trim() ?? "";
}

function readAddress(data?: PlaceData | null, fallback?: Partial<LocationAddressForm>): LocationAddressForm {
  return {
    address: firstNonEmpty(data?.address, fallback?.address),
    country: firstNonEmpty(data?.country, fallback?.country),
    postcode: firstNonEmpty(data?.postcode, data?.postal_code, fallback?.postcode),
    state: firstNonEmpty(data?.state, fallback?.state),
    city: firstNonEmpty(data?.city, fallback?.city),
  };
}

function readCoordinates(data?: PlaceData | null): LocationCoordinates | null {
  return typeof data?.latitude === "number" && typeof data.longitude === "number"
    ? { latitude: data.latitude, longitude: data.longitude }
    : null;
}

export function useTutorLocationSetup(onConfirmed: (summary: TutorLocationSummary | null) => void) {
  const [view, setView] = useState<TutorLocationView>("prompt");
  const [address, setAddress] = useState<LocationAddressForm>(emptyAddress);
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [source, setSource] = useState<LocationSource>("manual");
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState("");
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [error, setError] = useState("");
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [requestingSearch, setRequestingSearch] = useState(false);
  const [resolvingMap, setResolvingMap] = useState(false);
  const [saving, setSaving] = useState(false);
  const requestIdRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const complete = Boolean(address.address.trim() && address.country.trim() && address.state.trim() && address.city.trim());

  useEffect(() => () => {
    requestIdRef.current += 1;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchAbortRef.current?.abort();
  }, []);

  const stopSearch = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = null;
    searchAbortRef.current?.abort();
    searchAbortRef.current = null;
    setRequestingSearch(false);
    setPredictions([]);
  };

  const fetchPlace = async (path: string, body: Record<string, unknown>) => {
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = (await response.json()) as PlaceResponse;
    if (!response.ok) throw new Error(result.message ?? "Could not retrieve location details.");
    return result;
  };

  const reverseGeocode = async (nextCoordinates: LocationCoordinates) => {
    const result = await fetchPlace("/api/places/reverse-geocode", nextCoordinates);
    return result.data ?? null;
  };

  const openSearch = (message = "") => {
    requestIdRef.current += 1;
    setRequestingLocation(false);
    setPlaceId("");
    setGpsAccuracy(null);
    setCoordinates(null);
    setView("search");
    setError(message);
  };

  const requestCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      openSearch("Location is not supported on this browser. Search for your address instead.");
      return;
    }

    setRequestingLocation(true);
    setError("");
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    navigator.geolocation.getCurrentPosition(async (position) => {
      if (requestIdRef.current !== requestId) return;
      const nextCoordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      const accuracy = position.coords.accuracy;
      if (!Number.isFinite(accuracy) || accuracy > 50) {
        openSearch("Your location was not precise enough. Search for your address instead.");
        return;
      }
      try {
        const data = await reverseGeocode(nextCoordinates);
        const resolved = readAddress(data);
        if (!resolved.address || !resolved.country || !resolved.state || !resolved.city) {
          openSearch("We found your location but could not identify a complete address. Search for it instead.");
          return;
        }
        setAddress(resolved);
        setCoordinates(nextCoordinates);
        setGpsAccuracy(accuracy);
        setSource("gps");
        setQuery(resolved.address);
        setView("review");
      } catch (caught) {
        openSearch(caught instanceof Error ? caught.message : "Could not retrieve your address.");
      } finally {
        if (requestIdRef.current === requestId) setRequestingLocation(false);
      }
    }, (geolocationError) => {
      if (requestIdRef.current !== requestId) return;
      openSearch(geolocationError.code === geolocationError.PERMISSION_DENIED
        ? "Location permission was denied. Search for your address instead."
        : "We could not get your location. Search for your address instead.");
    }, { enableHighAccuracy: false, maximumAge: 300000, timeout: GPS_TIMEOUT_MS });
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setPlaceId("");
    setPredictions([]);
    setError("");
    if (Object.values(address).some((field) => field.trim())) {
      setAddress(emptyAddress);
      setCoordinates(null);
    }
    stopSearch();
    const input = value.trim();
    if (input.length < 3) return;
    setRequestingSearch(true);
    searchTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      searchAbortRef.current = controller;
      try {
        const response = await fetch("/api/places/autocomplete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input }), signal: controller.signal });
        const result = (await response.json()) as PlaceResponse;
        if (!response.ok) throw new Error(result.message ?? "Could not search addresses.");
        setPredictions(result.predictions ?? []);
      } catch (caught) {
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(caught instanceof Error ? caught.message : "Could not search addresses.");
      } finally {
        if (searchAbortRef.current === controller) {
          searchAbortRef.current = null;
          setRequestingSearch(false);
        }
      }
    }, 350);
  };

  const selectPlace = async (selectedPlaceId: string) => {
    setRequestingSearch(true);
    setError("");
    try {
      const prediction = predictions.find((item) => item.placeId === selectedPlaceId);
      const result = await fetchPlace("/api/places/details", { placeId: selectedPlaceId });
      const resolved = readAddress(result.data, { address: prediction?.description ?? query });
      setAddress(resolved);
      setCoordinates(readCoordinates(result.data));
      setQuery(prediction?.description ?? query);
      setPredictions([]);
      setPlaceId(selectedPlaceId);
      setGpsAccuracy(null);
      setSource("search");
      setView(resolved.address && resolved.country && resolved.state && resolved.city ? "review" : "edit");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not retrieve the selected address.");
    } finally {
      setRequestingSearch(false);
    }
  };

  const changeAddress = (field: keyof LocationAddressForm, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
    setSource("manual");
    setPlaceId("");
    setGpsAccuracy(null);
    setCoordinates(null);
    setError("");
  };

  const moveMap = async (nextCoordinates: LocationCoordinates) => {
    setResolvingMap(true);
    setError("");
    try {
      const data = await reverseGeocode(nextCoordinates);
      const resolved = readAddress(data);
      const verifiedPlaceId = data?.placeId?.trim() ?? "";
      if (!resolved.address || !resolved.country || !resolved.state || !resolved.city || !verifiedPlaceId) {
        throw new Error("We could not verify an address at that map position.");
      }
      setAddress(resolved);
      setCoordinates(nextCoordinates);
      setPlaceId(verifiedPlaceId);
      setGpsAccuracy(null);
      setSource("search");
      setQuery(resolved.address);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the map location.");
      return false;
    } finally {
      setResolvingMap(false);
    }
  };

  const confirm = async () => {
    if (!complete || saving || resolvingMap) return;
    setSaving(true);
    setError("");
    try {
      let payload: Record<string, string | number>;
      let confirmedCoordinates = coordinates;
      if (source === "gps") {
        if (!coordinates || gpsAccuracy === null) throw new Error("Please request your current location again.");
        payload = { accuracy: gpsAccuracy, latitude: coordinates.latitude, longitude: coordinates.longitude, source: "gps" };
      } else {
        let verifiedPlaceId = placeId;
        if (!verifiedPlaceId) {
          const result = await fetchPlace("/api/places/geocode", address);
          verifiedPlaceId = result.data?.placeId?.trim() ?? "";
          const verifiedCoordinates = readCoordinates(result.data);
          if (verifiedCoordinates) {
            confirmedCoordinates = verifiedCoordinates;
            setCoordinates(verifiedCoordinates);
          }
        }
        if (!verifiedPlaceId) throw new Error("Could not verify this address. Please search for it again.");
        payload = { placeId: verifiedPlaceId, source: "search" };
        setPlaceId(verifiedPlaceId);
      }
      await saveTutorLocation(payload);
      stopSearch();
      onConfirmed({ address, coordinates: confirmedCoordinates });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your tutor location.");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    setError("");
    stopSearch();
    if (view === "edit") setView(complete ? "review" : "search");
    else if (view === "review") setView(source === "search" ? "search" : "prompt");
    else if (view === "search") setView("prompt");
  };

  return {
    address, changeAddress, changeQuery, complete, confirm, coordinates, error, goBack,
    moveMap, openEdit: () => setView("edit"), openSearch, predictions, query,
    requestingLocation, requestingSearch, requestCurrentLocation, resolvingMap, saving,
    selectPlace, setView, view,
  };
}
