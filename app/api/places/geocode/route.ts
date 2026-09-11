import { NextResponse } from "next/server";

const GOOGLE_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json";

type GoogleGeocodingResponse = {
  error_message?: string;
  results?: Array<{ place_id?: string }>;
  status?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Address verification is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  let address = "";
  try {
    const body = (await request.json()) as Record<string, unknown>;
    address = [body.address, body.city, body.state, body.postcode, body.country]
      .map(clean)
      .filter(Boolean)
      .join(", ");
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (address.length < 5 || address.length > 500) {
    return NextResponse.json({ message: "Enter a complete address before continuing." }, { status: 400 });
  }

  const googleUrl = new URL(GOOGLE_GEOCODING_URL);
  googleUrl.searchParams.set("address", address);
  googleUrl.searchParams.set("key", apiKey);

  try {
    const googleResponse = await fetch(googleUrl, { cache: "no-store" });
    const data = (await googleResponse.json()) as GoogleGeocodingResponse;
    const placeId = data.results?.[0]?.place_id?.trim();

    if (!googleResponse.ok || data.status !== "OK" || !placeId) {
      return NextResponse.json({ message: "We couldn't verify this address. Check the details and try again." }, { status: 422 });
    }

    return NextResponse.json({ data: { placeId } });
  } catch {
    return NextResponse.json({ message: "Address verification is temporarily unavailable." }, { status: 502 });
  }
}
