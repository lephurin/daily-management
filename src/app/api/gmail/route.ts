import { NextResponse } from "next/server";
import { fetchGmailMessages } from "@/features/external-apis/services/external-api-actions";

export async function GET() {
  try {
    const messages = await fetchGmailMessages();
    return NextResponse.json({ data: messages });
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
      { error: "Failed to fetch gmail messages" },
      { status: 500 },
    );
  }
}
