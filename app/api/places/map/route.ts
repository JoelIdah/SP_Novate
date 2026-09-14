import { NextResponse } from "next/server";

const GOOGLE_STATIC_MAP_URL = "https://maps.googleapis.com/maps/api/staticmap";
const GOOGLE_PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places";

function parseCoordinate(value: string | null, min: number, max: number) {
  if (value === null || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "The map preview is temporarily unavailable." }, { status: 503 });
  }

  const requestUrl = new URL(request.url);
  const latitude = parseCoordinate(requestUrl.searchParams.get("latitude"), -90, 90);
  const longitude = parseCoordinate(requestUrl.searchParams.get("longitude"), -180, 180);
  const placeId = requestUrl.searchParams.get("placeId")?.trim() ?? "";
  const hasCoordinates = latitude !== null && longitude !== null;
  if (!hasCoordinates && !placeId) {
    return NextResponse.json({ message: "A valid map location is required." }, { status: 400 });
  }

  let center = hasCoordinates ? `${latitude},${longitude}` : "";
  if (!center) {
    try {
      const detailsResponse = await fetch(
        `${GOOGLE_PLACE_DETAILS_URL}/${encodeURIComponent(placeId)}`,
        {
          cache: "no-store",
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "location",
          },
        },
      );
      const details = (await detailsResponse.json()) as {
        location?: { latitude?: number; longitude?: number };
      };
      const resolvedLatitude = details.location?.latitude;
      const resolvedLongitude = details.location?.longitude;
      if (
        !detailsResponse.ok ||
        typeof resolvedLatitude !== "number" ||
        typeof resolvedLongitude !== "number"
      ) {
        return NextResponse.json(
          { message: "Map preview is temporarily unavailable." },
          { status: 502 },
        );
      }
      center = `${resolvedLatitude},${resolvedLongitude}`;
    } catch {
      return NextResponse.json(
        { message: "Map preview is temporarily unavailable." },
        { status: 502 },
      );
    }
  }
  const googleUrl = new URL(GOOGLE_STATIC_MAP_URL);
  googleUrl.searchParams.set("center", center);
  googleUrl.searchParams.set("zoom", "16");
  googleUrl.searchParams.set("size", "640x360");
  googleUrl.searchParams.set("scale", "2");
  googleUrl.searchParams.set("maptype", "roadmap");
  googleUrl.searchParams.set("markers", `color:0x232066|${center}`);
  googleUrl.searchParams.set("key", apiKey);

  try {
    const mapResponse = await fetch(googleUrl, { cache: "no-store" });
    const contentType = mapResponse.headers.get("content-type") ?? "";
    if (!mapResponse.ok || !contentType.startsWith("image/")) {
      return NextResponse.json({ message: "Map preview is temporarily unavailable." }, { status: 502 });
    }

    return new NextResponse(mapResponse.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": contentType,
      },
      status: 200,
    });
  } catch {
    return NextResponse.json({ message: "Map preview is temporarily unavailable." }, { status: 502 });
  }
}
