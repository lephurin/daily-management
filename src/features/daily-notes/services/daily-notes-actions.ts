"use server";

import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Save or update a daily note (upsert by user email + date)
 */
export async function saveDailyNote(data: {
  noteDate: string;
  title: string;
  content: Record<string, unknown>;
  plainText: string;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.email; // use email as user identifier

  try {
    const { error } = await supabaseAdmin.from("daily_notes").upsert(
      {
        user_id: userId,
        note_date: data.noteDate,
        title: data.title,
        content: data.content,
        plain_text: data.plainText,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,note_date" },
    );

    if (error) {
      console.error("Supabase upsert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to save daily note:", err);
    return { success: false, error: "Failed to save" };
  }
}

/**
 * Fetch daily note for a specific date
 */
export async function fetchDailyNote(noteDate: string) {
  const session = await auth();
  if (!session?.user?.email) return null;

  const userId = session.user.email;

  try {
    const { data, error } = await supabaseAdmin
      .from("daily_notes")
      .select("*")
      .eq("user_id", userId)
      .eq("note_date", noteDate)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Supabase fetch error:", error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error("Failed to fetch daily note:", err);
    return null;
  }
}

/**
 * Fetch daily notes within a date range (for export)
 */
export async function fetchDailyNotesRange(startDate: string, endDate: string) {
  const session = await auth();
  if (!session?.user?.email) return [];

  const userId = session.user.email;

  try {
    const { data, error } = await supabaseAdmin
      .from("daily_notes")
      .select("*")
      .eq("user_id", userId)
      .gte("note_date", startDate)
      .lte("note_date", endDate)
      .order("note_date", { ascending: true });

    if (error) {
      console.error("Supabase fetch range error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Failed to fetch daily notes range:", err);
    return [];
  }
}
