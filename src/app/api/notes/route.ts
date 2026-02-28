import { NextResponse } from "next/server";
import {
  fetchDailyNote,
  fetchDailyNotesRange,
  saveDailyNote,
} from "@/features/daily-notes/services/daily-notes-actions";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (date) {
      const note = await fetchDailyNote(date);
      return NextResponse.json({ data: note });
    }

    if (from && to) {
      const notes = await fetchDailyNotesRange(from, to);
      return NextResponse.json({ data: notes });
    }

    return NextResponse.json(
      { error: "Missing required query parameters: ?date or ?from&to" },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch daily notes" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await saveDailyNote(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save daily note" },
      { status: 500 },
    );
  }
}
