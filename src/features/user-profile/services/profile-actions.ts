"use server";

import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Fetch user profile from Supabase
 */
export async function fetchUserProfile() {
  const session = await auth();
  if (!session?.user?.email) return null;

  try {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.email)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Fetch profile error:", error);
      return null;
    }

    return (
      data || {
        user_id: session.user.email,
        name: session.user.name || "",
        position: "",
        avatar_url: session.user.image || null,
      }
    );
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    return null;
  }
}

/**
 * Save or update user profile
 */
export async function saveUserProfile(profileData: {
  name: string;
  position: string;
}) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { error } = await supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: session.user.email,
        name: profileData.name,
        position: profileData.position,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Save profile error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to save profile:", err);
    return { success: false, error: "Failed to save" };
  }
}
