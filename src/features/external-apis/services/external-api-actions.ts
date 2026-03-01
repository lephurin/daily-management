"use server";

import { auth } from "@/lib/auth";
import { axios } from "@/lib/axios";
import type {
  JiraSprint,
  CalendarEvent,
  GmailMessage,
  JiraBoardSprintResponse,
  JiraSprintIssuesResponse,
  GoogleCalendarEventsResponse,
  GmailListResponse,
  GmailMessageDetailResponse,
} from "@/features/external-apis/types";

/**
 * Get the Google access token from the current session
 */
async function getGoogleAccessToken(): Promise<string | null> {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user;
  if (user.provider !== "google") return null;
  return user.accessToken || null;
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
    const sprintRes = (await axios.get<JiraBoardSprintResponse>(
      `${baseUrl}/rest/agile/1.0/board/${boardId}/sprint?state=active`,
      { headers },
    )) as unknown as JiraBoardSprintResponse;
    const activeSprint = sprintRes?.values?.[0];

    if (!activeSprint) return null;

    // Get issues in the sprint, filtered by assignee = current user
    const issuesRes = (await axios.get<JiraSprintIssuesResponse>(
      `${baseUrl}/rest/agile/1.0/sprint/${activeSprint.id}/issue`,
      {
        headers,
        params: {
          fields: "summary,status,assignee,priority,updated",
          jql: "assignee=currentUser()",
        },
      },
    )) as unknown as JiraSprintIssuesResponse;

    return {
      id: activeSprint.id,
      name: activeSprint.name,
      state: activeSprint.state,
      startDate: activeSprint.startDate,
      endDate: activeSprint.endDate,
      issues: (issuesRes?.issues || []).map((issue) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName || null,
        priority: issue.fields.priority?.name || "",
        updated: issue.fields.updated,
      })),
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
    // Use a wider range (+/- 12 hours) to handle timezone differences between server and client
    const startRange = new Date(
      now.getTime() - 12 * 60 * 60 * 1000,
    ).toISOString();
    const endRange = new Date(
      now.getTime() + 36 * 60 * 60 * 1000,
    ).toISOString();

    const res = (await axios.get<GoogleCalendarEventsResponse>(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startRange}&timeMax=${endRange}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )) as unknown as GoogleCalendarEventsResponse;

    return (res?.items || []).map((event) => {
      const title = event.summary?.trim() || "";
      let fallbackTitle = "(ไม่มีชื่อ)";
      if (event.hangoutLink) fallbackTitle = "Google Meet";

      // Final fallback if everything is empty
      const finalTitle = title || fallbackTitle;

      return {
        id: event.id,
        title: finalTitle,
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        location: event.location,
        description: event.description,
        organizer: event.organizer?.email,
        htmlLink: event.hangoutLink || event.htmlLink,
      };
    });
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
    const listRes = (await axios.get<GmailListResponse>(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=in:inbox`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )) as unknown as GmailListResponse;
    const messageIds = listRes?.messages || [];

    if (messageIds.length === 0) return [];

    // Fetch individual message details (batch)
    const messages = await Promise.all(
      messageIds.slice(0, 10).map(async (msg) => {
        const detailRes = (await axios.get<GmailMessageDetailResponse>(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )) as unknown as GmailMessageDetailResponse;

        const detail = detailRes || {};
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
