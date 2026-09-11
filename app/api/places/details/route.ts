import { NextResponse } from "next/server";

const GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places";

type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type GooglePlaceResponse = {
  addressComponents?: GoogleAddressComponent[];
  error?: { message?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
};

function componentValue(components: GoogleAddressComponent[], ...types: string[]) {
  for (const type of types) {
    const component = components.find((item) => item.types?.includes(type));
    if (component?.longText?.trim()) return component.longText.trim();
  }
  return "";
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "We couldn’t load this address. Please try again." }, { status: 503 });
  }

  let placeId = "";
  try {
    const body = (await request.json()) as { placeId?: unknown };
    placeId = typeof body.placeId === "string" ? body.placeId.trim() : "";
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!placeId || placeId.length > 300) {
    return NextResponse.json({ message: "A valid place ID is required." }, { status: 400 });
  }

  try {
    const googleResponse = await fetch(`${GOOGLE_PLACES_URL}/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "formattedAddress,addressComponents,location",
      },
      cache: "no-store",
    });
    const data = (await googleResponse.json()) as GooglePlaceResponse;

    if (!googleResponse.ok) {
      console.error("Google Place Details failed", {
        message: data.error?.message,
        status: googleResponse.status,
      });
      return NextResponse.json({ message: "Address details are temporarily unavailable." }, { status: 502 });
    }

    const components = data.addressComponents ?? [];
    return NextResponse.json({
      data: {
        address: data.formattedAddress?.trim() ?? "",
        country: componentValue(components, "country"),
        postcode: componentValue(components, "postal_code"),
        state: componentValue(components, "administrative_area_level_1"),
        city: componentValue(components, "locality", "postal_town", "administrative_area_level_2", "sublocality"),
        latitude: data.location?.latitude,
        longitude: data.location?.longitude,
      },
    });
  } catch (error) {
    console.error("Google Place Details request failed", error);
    return NextResponse.json({ message: "Address details are temporarily unavailable." }, { status: 502 });
  }
}
