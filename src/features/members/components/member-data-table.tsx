"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import type { Member, UpdateMemberRoleRequest } from "@/features/members/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axios } from "@/lib/axios";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

export function MemberDataTable() {
  const t = useTranslations("Members");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await axios.get<Member[]>("/api/members");
      return response.data as Member[];
    },
  });

  const { mutate: updateRole, isPending } = useMutation({
    mutationFn: async ({ memberId, newRole }: UpdateMemberRoleRequest) => {
      await axios.patch(`/api/members/${encodeURIComponent(memberId)}`, {
        newRole,
      });
    },
    onSuccess: () => {
      toast.success(t("toast.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: () => {
      toast.error(t("toast.updateError"));
    },
  });

  const handleRoleChange = (
    memberId: string,
    newRole: "super_admin" | "user",
  ) => {
    updateRole({ memberId, newRole });
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>{t("table.name")}</TableHead>
            <TableHead>{t("table.email")}</TableHead>
            <TableHead>{t("table.role")}</TableHead>
            <TableHead>{t("table.joinedAt")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full mt-2" />
                <Skeleton className="h-8 w-full mt-2" />
              </TableCell>
            </TableRow>
          ) : members?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t("table.noData")}
              </TableCell>
            </TableRow>
          ) : (
            members?.map((member: Member) => (
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
                    disabled={isPending}
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
                  {new Date(member.createdAt).toLocaleDateString(
                    locale === "th" ? "th-TH" : "en-US",
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
