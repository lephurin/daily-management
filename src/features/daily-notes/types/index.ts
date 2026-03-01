export interface DailyNote {
  id: string;
  user_id: string;
  title: string;
  content: Record<string, unknown>;
  plain_text: string;
  note_date: string; // ISO Date YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface SaveDailyNoteRequest {
  noteDate: string;
  title: string;
  content: Record<string, unknown>;
  plainText: string;
}

export interface DailyNoteRevision {
  id: string;
  note_id: string;
  content: Record<string, unknown>;
  plain_text: string;
  revision_number: number;
  created_at: string;
}
