"use server";

import { auth } from "@/lib/auth";
import type {
  JiraSprint,
  CalendarEvent,
  GmailMessage,
} from "@/features/external-apis/types";

/**
 * Get the Google access token from the current session
 */
async function getGoogleAccessToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as unknown as Record<string, unknown>;
  if (user.provider !== "google") return null;
  return (user.accessToken as string) || null;
}

/**
 * Fetch Jira Active Sprint and its issues
 */
export async function fetchJiraActiveSprint(
  baseUrl: string,
  email: string,
  apiToken: string,
  boardId: string,
): Promise<JiraSprint | null> {
  try {
    const authHeader = Buffer.from(`${email}:${apiToken}`).toString("base64");
    const headers = {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/json",
    };

    // Get active sprint
    const sprintRes = await fetch(
      `${baseUrl}/rest/agile/1.0/board/${boardId}/sprint?state=active`,
      { headers },
    );

    if (!sprintRes.ok) {
      throw new Error(`Jira API error: ${sprintRes.status}`);
    }

    const sprintData = await sprintRes.json();
    const activeSprint = sprintData.values?.[0];

    if (!activeSprint) return null;

    // Get issues in the sprint
    const issuesRes = await fetch(
      `${baseUrl}/rest/agile/1.0/sprint/${activeSprint.id}/issue?fields=summary,status,assignee,priority,updated`,
      { headers },
    );

    if (!issuesRes.ok) {
      throw new Error(`Jira API error: ${issuesRes.status}`);
    }

    const issuesData = await issuesRes.json();

    return {
      id: activeSprint.id,
      name: activeSprint.name,
      state: activeSprint.state,
      startDate: activeSprint.startDate,
      endDate: activeSprint.endDate,
      issues: issuesData.issues?.map(
        (issue: {
          id: string;
          key: string;
          fields: {
            summary: string;
            status: { name: string };
            assignee: { displayName: string } | null;
            priority: { name: string };
            updated: string;
          };
        }) => ({
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          assignee: issue.fields.assignee?.displayName || null,
          priority: issue.fields.priority.name,
          updated: issue.fields.updated,
        }),
      ),
    };
  } catch (error) {
    console.error("Failed to fetch Jira sprint:", error);
    return null;
  }
}

/**
 * Fetch Google Calendar events for today
 * Uses the OAuth access token from the current session
 */
export async function fetchGoogleCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      console.log("No Google access token available");
      return [];
    }

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    ).toISOString();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    ).toISOString();

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Calendar API error: ${res.status}`, errBody);
      return [];
    }

    const data = await res.json();

    return (
      data.items?.map(
        (event: {
          id: string;
          summary?: string;
          start: { dateTime?: string; date?: string };
          end: { dateTime?: string; date?: string };
          location?: string;
          description?: string;
          organizer?: { email: string };
        }) => ({
          id: event.id,
          title: event.summary || "(ไม่มีชื่อ)",
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
          location: event.location,
          description: event.description,
          organizer: event.organizer?.email,
        }),
      ) || []
    );
  } catch (error) {
    console.error("Failed to fetch calendar events:", error);
    return [];
  }
}

/**
 * Fetch recent Gmail messages (last 10)
 * Uses the OAuth access token from the current session
 */
export async function fetchGmailMessages(): Promise<GmailMessage[]> {
  try {
    const accessToken = await getGoogleAccessToken();
    if (!accessToken) {
      console.log("No Google access token available");
      return [];
    }

    // List recent messages
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=in:inbox`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!listRes.ok) {
      const errBody = await listRes.text();
      console.error(`Gmail API error: ${listRes.status}`, errBody);
      return [];
    }

    const listData = await listRes.json();
    const messageIds: { id: string; threadId: string }[] =
      listData.messages || [];

    if (messageIds.length === 0) return [];

    // Fetch individual message details (batch)
    const messages = await Promise.all(
      messageIds.slice(0, 10).map(async (msg) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!detailRes.ok) return null;

        const detail = await detailRes.json();
        const headers: { name: string; value: string }[] =
          detail.payload?.headers || [];

        const getHeader = (name: string) =>
          headers.find(
            (h: { name: string }) =>
              h.name.toLowerCase() === name.toLowerCase(),
          )?.value || "";

        return {
          id: detail.id,
          threadId: detail.threadId,
          subject: getHeader("Subject") || "(ไม่มีหัวข้อ)",
          from: getHeader("From"),
          date: getHeader("Date"),
          snippet: detail.snippet || "",
          isUnread: detail.labelIds?.includes("UNREAD") ?? false,
        };
      }),
    );

    return messages.filter(Boolean) as GmailMessage[];
  } catch (error) {
    console.error("Failed to fetch Gmail messages:", error);
    return [];
  }
}

/**
 * Save external API credentials (placeholder for DB integration)
 */
export async function saveExternalCredentials(
  provider: "jira",
  credentials: Record<string, string>,
) {
  // TODO: Encrypt and save to Supabase oauth_tokens table
  console.log(`Saving ${provider} credentials:`, Object.keys(credentials));
  return { success: true };
}
