import { NextResponse } from "next/server";
import { fetchGoogleCalendarEvents } from "@/features/external-apis/services/external-api-actions";

export async function GET() {
  try {
    const events = await fetchGoogleCalendarEvents();
    return NextResponse.json({ data: events });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("403")) {
        return NextResponse.json(
          { error: "Unauthorized or token expired", connectRequired: true },
          { status: 401 },
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 },
    );
  }
}
