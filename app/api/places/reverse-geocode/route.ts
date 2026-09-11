import { NextResponse } from "next/server";

const GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

type GoogleAddressComponent = {
  long_name?: string;
  types?: string[];
};

type GoogleGeocodingResponse = {
  error_message?: string;
  results?: Array<{
    address_components?: GoogleAddressComponent[];
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
    place_id?: string;
  }>;
  status?: string;
};

function componentValue(components: GoogleAddressComponent[], ...types: string[]) {
  for (const type of types) {
    const component = components.find((item) => item.types?.includes(type));
    if (component?.long_name?.trim()) return component.long_name.trim();
  }
  return "";
}

function parseCoordinate(value: unknown, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Current-location lookup is temporarily unavailable. Search for your address instead." }, { status: 503 });
  }

  let latitude: number | null = null;
  let longitude: number | null = null;
  try {
    const body = (await request.json()) as { latitude?: unknown; longitude?: unknown };
    latitude = parseCoordinate(body.latitude, -90, 90);
    longitude = parseCoordinate(body.longitude, -180, 180);
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (latitude === null || longitude === null) {
    return NextResponse.json({ message: "Valid GPS coordinates are required." }, { status: 400 });
  }

  const googleUrl = new URL(GOOGLE_GEOCODING_URL);
  googleUrl.searchParams.set("latlng", `${latitude},${longitude}`);
  googleUrl.searchParams.set("key", apiKey);

  try {
    const googleResponse = await fetch(googleUrl, { cache: "no-store" });
    const data = (await googleResponse.json()) as GoogleGeocodingResponse;
    const result = data.results?.[0];
    if (!googleResponse.ok || data.status !== "OK" || !result) {
      return NextResponse.json({ message: "We couldn't find an address for this location." }, { status: 502 });
    }

    const components = result.address_components ?? [];
    return NextResponse.json({
      data: {
        address: result.formatted_address?.trim() ?? "",
        country: componentValue(components, "country"),
        postcode: componentValue(components, "postal_code"),
        state: componentValue(components, "administrative_area_level_1"),
        city: componentValue(components, "locality", "postal_town", "administrative_area_level_2", "sublocality"),
        placeId: result.place_id?.trim() ?? "",
        latitude: result.geometry?.location?.lat ?? latitude,
        longitude: result.geometry?.location?.lng ?? longitude,
      },
    });
  } catch {
    return NextResponse.json({ message: "GPS address lookup is temporarily unavailable." }, { status: 502 });
  }
}
