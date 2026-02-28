"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Member } from "@/features/members/types";

// Mock data - will be replaced with Supabase query
const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    avatarUrl: null,
    role: "super_admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "user1@example.com",
    name: "Regular User",
    avatarUrl: null,
    role: "user",
    createdAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "3",
    email: "user2@example.com",
    name: "Another User",
    avatarUrl: null,
    role: "user",
    createdAt: "2024-03-20T00:00:00Z",
  },
];

export function MemberDataTable() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);

  const handleRoleChange = async (
    memberId: string,
    newRole: "super_admin" | "user",
  ) => {
    // TODO: Update role in Supabase
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
    );
    console.log(`Role updated for ${memberId}: ${newRole}`);
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>ชื่อ</TableHead>
            <TableHead>อีเมล</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>วันที่สมัคร</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {member.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-medium">
                {member.name || "-"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {member.email}
              </TableCell>
              <TableCell>
                <Select
                  value={member.role}
                  onValueChange={(value: "super_admin" | "user") =>
                    handleRoleChange(member.id, value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">
                      <Badge variant="default" className="text-xs">
                        Super Admin
                      </Badge>
                    </SelectItem>
                    <SelectItem value="user">
                      <Badge variant="secondary" className="text-xs">
                        User
                      </Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(member.createdAt).toLocaleDateString("th-TH")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
