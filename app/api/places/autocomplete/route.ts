import { NextResponse } from "next/server";

const GOOGLE_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";

type GoogleAutocompleteResponse = {
  error?: {
    message?: string;
  };
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {
        text?: string;
      };
    };
  }>;
};

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Address search is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  let input = "";
  try {
    const body = (await request.json()) as { input?: unknown };
    input = typeof body.input === "string" ? body.input.trim() : "";
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  if (input.length > 200) {
    return NextResponse.json({ message: "Search text is too long." }, { status: 400 });
  }

  try {
    const googleResponse = await fetch(GOOGLE_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
      },
      body: JSON.stringify({ input }),
      cache: "no-store",
    });

    const data = (await googleResponse.json()) as GoogleAutocompleteResponse;
    if (!googleResponse.ok) {
      console.error("Google Places autocomplete failed", {
        message: data.error?.message,
        status: googleResponse.status,
      });
      return NextResponse.json(
        { message: "Address suggestions are temporarily unavailable." },
        { status: 502 },
      );
    }

    const predictions = (data.suggestions ?? []).flatMap((suggestion) => {
      const placeId = suggestion.placePrediction?.placeId;
      const description = suggestion.placePrediction?.text?.text;
      return placeId && description ? [{ description, placeId }] : [];
    });

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Google Places autocomplete request failed", error);
    return NextResponse.json(
      { message: "Address suggestions are temporarily unavailable." },
      { status: 502 },
    );
  }
}
