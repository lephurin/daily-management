"use server";

// import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Save or update a daily note
 */
export async function saveDailyNote(data: {
  noteDate: string;
  title: string;
  content: Record<string, unknown>;
  plainText: string;
}) {
  // TODO: Implement with Supabase
  // const supabase = await createSupabaseServerClient();
  // const { data: result, error } = await supabase
  //   .from("daily_notes")
  //   .upsert({ ...data, user_id: session.user.id }, { onConflict: "user_id,note_date" });
  console.log("Saving daily note:", data.title, data.noteDate);
  return { success: true };
}

/**
 * Fetch daily notes for a specific date
 */
export async function fetchDailyNote(noteDate: string) {
  // TODO: Implement with Supabase
  console.log("Fetching daily note for:", noteDate);
  return null;
}

/**
 * Fetch daily notes within a date range (for export)
 */
export async function fetchDailyNotesRange(startDate: string, endDate: string) {
  // TODO: Implement with Supabase
  console.log("Fetching notes range:", startDate, "to", endDate);
  return [];
}
