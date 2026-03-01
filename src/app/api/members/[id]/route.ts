import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();

  // Route protection
  const role = session?.user?.role;
  if (!session || role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    // The ID in our system is currently the email (user_id)
    const emailStr = decodeURIComponent(id);

    const body = await request.json();
    const { newRole } = body;

    if (newRole !== "user" && newRole !== "super_admin") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Update the user profile role
    const { error } = await supabaseAdmin
      .from("user_profiles")
      .update({ role: newRole })
      .eq("user_id", emailStr);

    if (error) {
      console.error("Update role error:", error);
      return NextResponse.json(
        { error: "Failed to update role" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "Role updated" });
  } catch (err) {
    console.error("Members PATCH error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
