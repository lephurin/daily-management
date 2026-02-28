"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { JiraCredentialDialog } from "@/features/external-apis/components/credential-dialogs";
import {
  fetchGoogleCalendarEvents,
  fetchGmailMessages,
} from "@/features/external-apis/services/external-api-actions";
import type {
  CalendarEvent,
  GmailMessage,
} from "@/features/external-apis/types";

export function JiraWidgetPlaceholder() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
        <svg
          className="h-8 w-8 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">Jira ยังไม่ได้เชื่อมต่อ</p>
      <JiraCredentialDialog />
    </div>
  );
}

export function CalendarWidgetContent() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isGoogleUser =
    (session?.user as unknown as Record<string, unknown>)?.provider ===
    "google";

  useEffect(() => {
    if (!isGoogleUser) {
      setLoading(false);
      return;
    }
    fetchGoogleCalendarEvents()
      .then((data) => {
        setEvents(data);
        setError(null);
      })
      .catch(() => setError("ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoading(false));
  }, [isGoogleUser]);

  // Not logged in with Google
  if (!isGoogleUser) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">
          ลงชื่อเข้าใช้ด้วย Google เพื่อดูปฏิทิน
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          ลองใหม่
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">ไม่มีนัดหมายวันนี้ 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-1">
      {events.map((event) => {
        const start = event.start
          ? new Date(event.start).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        const end = event.end
          ? new Date(event.end).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        return (
          <div
            key={event.id}
            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
          >
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {start}
                {end ? ` – ${end}` : ""}
              </p>
              {event.location && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  📍 {event.location}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GmailWidgetContent() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isGoogleUser =
    (session?.user as unknown as Record<string, unknown>)?.provider ===
    "google";

  useEffect(() => {
    if (!isGoogleUser) {
      setLoading(false);
      return;
    }
    fetchGmailMessages()
      .then((data) => {
        setMessages(data);
        setError(null);
      })
      .catch(() => setError("ไม่สามารถโหลดข้อมูลได้"))
      .finally(() => setLoading(false));
  }, [isGoogleUser]);

  // Not logged in with Google
  if (!isGoogleUser) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
          <svg
            className="h-8 w-8 text-red-500 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">
          ลงชื่อเข้าใช้ด้วย Google เพื่อดูอีเมล
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          ลองใหม่
        </Button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-muted-foreground">ไม่มีอีเมลใหม่</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-1">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`rounded-lg border p-3 transition-colors hover:bg-accent/50 ${
            msg.isUnread
              ? "border-l-2 border-l-red-500 bg-red-50/30 dark:bg-red-950/10"
              : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className={`truncate text-sm ${msg.isUnread ? "font-semibold" : "font-medium"}`}
            >
              {msg.subject}
            </p>
            {msg.isUnread && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {msg.from}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {msg.snippet}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DailyNotesWidgetPlaceholder() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/30">
        <svg
          className="h-8 w-8 text-amber-600 dark:text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">
        เริ่มเขียนบันทึกประจำวันของคุณ
      </p>
      <Button variant="outline" size="sm">
        เขียนบันทึก
      </Button>
    </div>
  );
}

export function AiChatbotWidgetPlaceholder() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
        <svg
          className="h-8 w-8 text-purple-600 dark:text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">
        ถามอะไรก็ได้กับ AI Assistant
      </p>
      <Button variant="outline" size="sm">
        เริ่มสนทนา
      </Button>
    </div>
  );
}
