export interface Member {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: "super_admin" | "user";
  createdAt: string;
}

export interface UpdateMemberRoleRequest {
  memberId: string;
  newRole: "super_admin" | "user";
}
