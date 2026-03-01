export interface JiraCredentials {
  baseUrl: string; // e.g. https://your-domain.atlassian.net
  email: string;
  apiToken: string;
}

export interface ExternalApiStatus {
  provider: "jira" | "google_calendar" | "google_gmail";
  connected: boolean;
  lastSyncAt?: string;
  error?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  assignee: string | null;
  priority: string;
  updated: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: string;
  startDate: string;
  endDate: string;
  issues: JiraIssue[];
  baseUrl?: string;
}

export interface JiraActiveSprint extends JiraSprint {
  baseUrl: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  organizer?: string;
  htmlLink?: string;
  calendarName?: string;
  color?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  isUnread: boolean;
}

// Raw API Response Interfaces
export interface JiraBoardSprintResponse {
  values: {
    id: number;
    name: string;
    state: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface JiraSprintIssuesResponse {
  issues: {
    id: string;
    key: string;
    fields: {
      summary: string;
      status: { name: string };
      assignee: { displayName: string } | null;
      priority: { name: string | null } | null;
      updated: string;
    };
  }[];
}

export interface GoogleCalendarListResponse {
  items: {
    id: string;
    summary: string;
    backgroundColor?: string;
    primary?: boolean;
    selected?: boolean;
  }[];
}

export interface GoogleCalendarEventsResponse {
  items: {
    id: string;
    summary?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    location?: string;
    description?: string;
    organizer?: { email: string };
    htmlLink?: string;
    hangoutLink?: string;
  }[];
}

export interface GmailListResponse {
  messages: { id: string; threadId: string }[];
}

export interface GmailMessageDetailResponse {
  id: string;
  threadId: string;
  snippet?: string;
  labelIds?: string[];
  payload?: {
    headers: { name: string; value: string }[];
  };
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}
