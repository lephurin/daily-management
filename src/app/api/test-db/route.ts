import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .limit(1);
  return NextResponse.json({ data, error });
}
