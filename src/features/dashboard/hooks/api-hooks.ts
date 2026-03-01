import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CalendarEvent,
  GmailMessage,
  JiraSprint,
  JiraActiveSprint,
} from "@/features/external-apis/types";
import { axios } from "@/lib/axios";
import { decryptData } from "@/lib/encryption";
import { toast } from "sonner";
import { ActionResponse } from "@/types/api";
import {
  UserProfile,
  ProfileUpdateResult,
} from "@/features/user-profile/types";
import { DailyNote, SaveDailyNoteRequest } from "@/features/daily-notes/types";

export function useCalendarQuery(enabled: boolean) {
  return useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const resp = await axios.get<CalendarEvent[]>("/api/calendar");
      return resp.data as CalendarEvent[];
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}

export function useGmailQuery(enabled: boolean) {
  return useQuery<GmailMessage[]>({
    queryKey: ["gmail-messages"],
    queryFn: async () => {
      const resp = await axios.get<GmailMessage[]>("/api/gmail");
      return resp.data as GmailMessage[];
    },
    enabled,
    refetchOnWindowFocus: false,
  });
}

export function useProfileQuery() {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const resp = await axios.get<UserProfile>("/api/profile");
      return resp.data as UserProfile;
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse<ProfileUpdateResult>, Error, FormData>({
    mutationFn: async (formData: FormData) =>
      axios.post("/api/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        toast.success("บันทึกโปรไฟล์สำเร็จ!");
      } else {
        toast.error("บันทึกไม่สำเร็จ", {
          description: result.error || "เกิดข้อผิดพลาด",
        });
      }
    },
    onError: (error: Error) => {
      toast.error("บันทึกไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาด",
      });
    },
  });
}

export function useDailyNoteQuery(date: string) {
  return useQuery<DailyNote | null>({
    queryKey: ["daily-note", date],
    queryFn: async () => {
      const resp = await axios.get<DailyNote | null>(`/api/notes?date=${date}`);
      return resp.data as DailyNote | null;
    },
  });
}

export function useDailyNotesHistoryQuery(
  from: string,
  to: string,
  enabled: boolean,
) {
  return useQuery<DailyNote[]>({
    queryKey: ["daily-notes-history", from, to],
    queryFn: async () => {
      const resp = await axios.get<DailyNote[]>(
        `/api/notes?from=${from}&to=${to}`,
      );
      return resp.data as DailyNote[];
    },
    enabled,
  });
}

export function useSaveDailyNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, Error, SaveDailyNoteRequest>({
    mutationFn: async (data) => axios.post("/api/notes", data),
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

export function useJiraActiveSprintQuery(userId?: string | null) {
  return useQuery<JiraActiveSprint>({
    queryKey: ["jira-active-sprint", userId],
    queryFn: async (): Promise<JiraActiveSprint> => {
      // Note: This runs on the client so localStorage is available.
      if (!userId) throw new Error("CREDENTIALS_NOT_FOUND");
      const encryptedStr = localStorage.getItem(`jira_credentials_${userId}`);
      if (!encryptedStr) throw new Error("CREDENTIALS_NOT_FOUND");

      const decryptedStr = decryptData(encryptedStr);
      if (!decryptedStr) throw new Error("DECRYPT_FAILED");

      const creds = JSON.parse(decryptedStr);
      if (!creds.baseUrl || !creds.email || !creds.apiToken || !creds.boardId) {
        throw new Error("INVALID_CREDENTIALS");
      }

      const response = await axios.post<JiraSprint>(
        "/api/active-sprint",
        creds,
      );

      // The interceptor returns the ApiResponse object { data: JiraSprint, error?: string }
      const sprintData = response.data as JiraSprint;
      return { ...sprintData, baseUrl: creds.baseUrl as string };
    },
    refetchOnWindowFocus: false,
  });
}
