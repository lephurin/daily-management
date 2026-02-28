export interface Member {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: "super_admin" | "user";
  createdAt: string;
}
