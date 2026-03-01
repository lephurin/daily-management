"use server";

import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ActionResponse } from "@/types/api";
import { UserProfile, ProfileUpdateResult } from "../types";

/**
 * Fetch user profile from Supabase
 */
export async function fetchUserProfile(): Promise<UserProfile | null> {
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    return null;
  }
}

/**
 * Unified Profile Update: Handles metadata (name, position) and optional image upload via FormData
 */
export async function updateUserProfile(
  formData: FormData,
): Promise<ActionResponse<ProfileUpdateResult>> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const position = formData.get("position") as string;
  const file = formData.get("file") as File | null;

  try {
    let publicUrl = null;

    // Handle File Upload if present
    if (file && file.size > 0) {
      // 1MB size limit
      if (file.size > 1024 * 1024) {
        return { success: false, error: "ขนาดไฟล์ต้องไม่เกิน 1MB" };
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.email}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return { success: false, error: "อัพโหลดรูปภาพไม่สำเร็จ" };
      }

      const {
        data: { publicUrl: newUrl },
      } = supabaseAdmin.storage.from("avatars").getPublicUrl(filePath);
      publicUrl = newUrl;
    }

    // Update Profile Metadata
    const updatePayload: Partial<UserProfile> & { user_id: string } = {
      user_id: session.user.email,
      name: name || "",
      position: position || "",
      updated_at: new Date().toISOString(),
    };

    // Only update avatar_url if a new one was uploaded
    if (publicUrl) {
      updatePayload.avatar_url = publicUrl;
    }

    const { error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .upsert(updatePayload, { onConflict: "user_id" });

    if (updateError) {
      console.error("Update profile error:", updateError);
      return { success: false, error: "บันทึกข้อมูลไม่สำเร็จ" };
    }

    return { success: true, data: { url: publicUrl || undefined } };
  } catch (err) {
    console.error("Unified update error:", err);
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึก" };
  }
}

/**
 * Update user PDPA consent status
 */
export async function updatePdpaConsent(
  agreed: boolean,
): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { error } = await supabaseAdmin.from("user_profiles").upsert(
      {
        user_id: session.user.email,
        pdpa_consented: agreed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Save consent error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to save consent:", err);
    return { success: false, error: "Failed to save" };
  }
}
