import { NextResponse } from "next/server";

const GOOGLE_STATIC_MAP_URL = "https://maps.googleapis.com/maps/api/staticmap";

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
  if (latitude === null || longitude === null) {
    return NextResponse.json({ message: "Valid map coordinates are required." }, { status: 400 });
  }

  const center = `${latitude},${longitude}`;
  const googleUrl = new URL(GOOGLE_STATIC_MAP_URL);
  googleUrl.searchParams.set("center", center);
  googleUrl.searchParams.set("zoom", "16");
  googleUrl.searchParams.set("size", "640x360");
  googleUrl.searchParams.set("scale", "2");
  googleUrl.searchParams.set("maptype", "roadmap");
  if (requestUrl.searchParams.get("editable") !== "true") {
    googleUrl.searchParams.set("markers", `color:0x232066|${center}`);
  }
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
