import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using service_role key.
 * Bypasses RLS – use ONLY in server actions where the user
 * is already authenticated via NextAuth.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key",
);
