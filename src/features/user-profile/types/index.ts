export interface UserProfile {
  id: string;
  user_id: string; // email identifier
  name: string;
  position: string;
  avatar_url: string | null;
  role?: "super_admin" | "user";
  pdpa_consented?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  name: string;
  position?: string;
  file?: File;
}

export type ProfileUpdateResult = { url?: string };
