import { NextResponse } from "next/server";
import { fetchSlackTodayMessages } from "@/features/external-apis/services/external-api-actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Missing required Slack component (token)" },
        { status: 400 },
      );
    }

    const todayMessages = await fetchSlackTodayMessages(token);

    return NextResponse.json({ data: todayMessages });
  } catch (error) {
    console.error("Failed to fetch Slack messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch Slack data" },
      { status: 500 },
    );
  }
}
