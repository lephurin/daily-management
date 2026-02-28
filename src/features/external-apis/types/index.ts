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
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
  organizer?: string;
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
