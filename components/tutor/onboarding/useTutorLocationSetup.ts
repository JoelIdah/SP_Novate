"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { LocationAddressForm, LocationCoordinates } from "../../signup/profile-setup/StepTwoAddressConfirm";
import { saveTutorLocation } from "./tutorOnboarding";

export type TutorLocationView = "prompt" | "search" | "review";
export type TutorLocationSummary = {
  address: LocationAddressForm;
  coordinates: LocationCoordinates | null;
};

type PlacePrediction = { description: string; placeId: string };
type PlaceResponse = { message?: string; predictions?: PlacePrediction[] };
type LocationSource = "gps" | "search";
type SavedTutorLocation = {
  accuracy?: number;
  address: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  source: string;
};

const emptyAddress: LocationAddressForm = { address: "", country: "", postcode: "", state: "", city: "" };
const GPS_TIMEOUT_MS = 10000;

export function useTutorLocationSetup(onConfirmed: (summary: TutorLocationSummary | null) => void) {
  const [view, setView] = useState<TutorLocationView>("prompt");
  const [address, setAddress] = useState<LocationAddressForm>(emptyAddress);
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [source, setSource] = useState<LocationSource>("gps");
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState("");
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [error, setError] = useState("");
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [requestingSearch, setRequestingSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const requestIdRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  const ready = source === "gps"
    ? Boolean(coordinates && gpsAccuracy !== null)
    : Boolean(placeId);

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
      setError("Current location is not available in this browser. You can search for your address instead.");
      return;
    }

    setRequestingLocation(true);
    setError("");
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    navigator.geolocation.getCurrentPosition((position) => {
      if (requestIdRef.current !== requestId) return;
      const accuracy = position.coords.accuracy;
      setRequestingLocation(false);
      if (!Number.isFinite(accuracy) || accuracy > 50) {
        setError("Your device could not provide a precise enough location. You can try again or search for your address.");
        return;
      }
      setAddress(emptyAddress);
      setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setGpsAccuracy(accuracy);
      setSource("gps");
      setView("review");
    }, (geolocationError) => {
      if (requestIdRef.current !== requestId) return;
      setRequestingLocation(false);
      setError(geolocationError.code === geolocationError.PERMISSION_DENIED
        ? "Location permission was denied. You can allow it and try again, or search for your address."
        : "We could not get your location. Try again or search for your address.");
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: GPS_TIMEOUT_MS });
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setPlaceId("");
    setAddress(emptyAddress);
    setCoordinates(null);
    setPredictions([]);
    setError("");
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
    }, 500);
  };

  const selectPlace = (selectedPlaceId: string) => {
    const prediction = predictions.find((item) => item.placeId === selectedPlaceId);
    const description = prediction?.description ?? query;
    setAddress({ ...emptyAddress, address: description });
    setCoordinates(null);
    setQuery(description);
    setPredictions([]);
    setPlaceId(selectedPlaceId);
    setGpsAccuracy(null);
    setSource("search");
    setError("");
    setView("review");
  };

  const loadSavedLocation = useCallback((savedLocation: SavedTutorLocation | null) => {
    if (!savedLocation) return;
    const savedSource: LocationSource = savedLocation.source === "gps" ? "gps" : "search";
    setAddress({ ...emptyAddress, address: savedLocation.address });
    setCoordinates({ latitude: savedLocation.latitude, longitude: savedLocation.longitude });
    setGpsAccuracy(savedSource === "gps" ? (savedLocation.accuracy ?? null) : null);
    setPlaceId(savedLocation.place_id ?? "");
    setQuery(savedLocation.address);
    setSource(savedSource);
    setView("review");
  }, []);

  const confirm = async () => {
    if (!ready || saving) return;
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, string | number> = source === "gps"
        ? { accuracy: gpsAccuracy as number, latitude: coordinates!.latitude, longitude: coordinates!.longitude, source: "gps" }
        : { placeId, source: "search" };
      await saveTutorLocation(payload);
      stopSearch();
      onConfirmed({ address, coordinates });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your tutor location.");
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    setError("");
    stopSearch();
    if (view === "review") setView("prompt");
    else if (view === "search") setView("prompt");
  };

  return {
    address, changeQuery, confirm, coordinates, error, goBack, loadSavedLocation, openSearch,
    placeId, predictions, query, ready, requestingLocation, requestingSearch, source,
    requestCurrentLocation, saving, selectPlace, view,
  };
}
