import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CalendarEvent,
  GmailMessage,
} from "@/features/external-apis/types";

// Polling interval in milliseconds
const POLLING_INTERVAL = 10000;

export function useCalendarQuery(enabled: boolean) {
  return useQuery<{ data: CalendarEvent[] }>({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const res = await fetch("/api/calendar");
      if (!res.ok) {
        throw new Error("Failed to fetch calendar");
      }
      return res.json();
    },
    enabled,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useGmailQuery(enabled: boolean) {
  return useQuery<{ data: GmailMessage[] }>({
    queryKey: ["gmail-messages"],
    queryFn: async () => {
      const res = await fetch("/api/gmail");
      if (!res.ok) {
        throw new Error("Failed to fetch gmail messages");
      }
      return res.json();
    },
    enabled,
    refetchInterval: POLLING_INTERVAL,
  });
}

export function useProfileQuery() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      return res.json();
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; position: string }) => {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to update profile");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useDailyNoteQuery(date: string) {
  return useQuery({
    queryKey: ["daily-note", date],
    queryFn: async () => {
      const res = await fetch(`/api/notes?date=${date}`);
      if (!res.ok) {
        throw new Error("Failed to fetch daily note");
      }
      return res.json();
    },
  });
}

export function useDailyNotesHistoryQuery(
  from: string,
  to: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["daily-notes-history", from, to],
    queryFn: async () => {
      const res = await fetch(`/api/notes?from=${from}&to=${to}`);
      if (!res.ok) {
        throw new Error("Failed to fetch history");
      }
      return res.json();
    },
    enabled,
  });
}

export function useSaveDailyNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      noteDate: string;
      title: string;
      content: Record<string, unknown>;
      plainText: string;
    }) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to save daily note");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["daily-note", variables.noteDate],
      });
      queryClient.invalidateQueries({
        queryKey: ["daily-notes-history"],
      });
    },
  });
}
