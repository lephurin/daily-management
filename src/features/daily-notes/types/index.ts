export interface DailyNote {
  id: string;
  userId: string;
  title: string;
  content: Record<string, unknown>; // Tiptap JSON
  plainText: string;
  noteDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface NoteRevision {
  id: string;
  noteId: string;
  userId: string;
  content: Record<string, unknown>;
  plainText: string;
  revisionNumber: number;
  createdAt: string;
}
