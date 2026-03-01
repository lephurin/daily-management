import { NextResponse } from "next/server";
import { fetchJiraActiveSprint } from "@/features/external-apis/services/external-api-actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { baseUrl, email, apiToken, boardId } = body;

    if (!baseUrl || !email || !apiToken || !boardId) {
      return NextResponse.json(
        {
          error:
            "Missing required Jira credentials (baseUrl, email, apiToken, boardId)",
        },
        { status: 400 },
      );
    }

    const activeSprint = await fetchJiraActiveSprint(
      baseUrl,
      email,
      apiToken,
      boardId,
    );

    if (!activeSprint) {
      return NextResponse.json(
        { error: "NO_ACTIVE_SPRINT", message: "ไม่พบ Active Sprint" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: activeSprint });
  } catch (error) {
    console.error("Failed to fetch Jira active sprint:", error);
    return NextResponse.json(
      { error: "Failed to fetch Jira sprint data" },
      { status: 500 },
    );
  }
}
