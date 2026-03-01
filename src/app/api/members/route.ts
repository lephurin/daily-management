import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const session = await auth();

  // Route protection
  const role = session?.user?.role;
  if (!session || role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, name, avatar_url, role, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch members error:", error);
      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 },
      );
    }

    // Map DB fields to our frontend Member interface
    const members = (data || []).map((row) => ({
      id: row.user_id, // Map email as ID for now since auth.users isn't exposed and email is primary
      email: row.user_id,
      name: row.name,
      avatarUrl: row.avatar_url,
      role: row.role || "user", // fallback if null
      createdAt: row.created_at,
    }));

    return NextResponse.json({ data: members });
  } catch (err) {
    console.error("Members GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
