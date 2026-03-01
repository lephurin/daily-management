"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { encryptData, decryptData } from "@/lib/encryption";
import { useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ExternalLink } from "lucide-react";

const jiraSchema = z.object({
  baseUrl: z
    .string()
    .url("กรุณาใส่ URL ที่ถูกต้อง (ต้องมี https://)")
    .min(1, "กรุณาใส่ Base URL"),
  email: z.string().email("กรุณาใส่อีเมลที่ถูกต้อง"),
  apiToken: z.string().min(1, "กรุณาใส่ API Token"),
  boardId: z.string().min(1, "กรุณาใส่ Board ID"),
});

type JiraFormData = z.infer<typeof jiraSchema>;

export function JiraCredentialDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JiraFormData>({
    resolver: zodResolver(jiraSchema),
    defaultValues: {
      baseUrl: "",
      email: "",
      apiToken: "",
      boardId: "",
    },
  });

  useEffect(() => {
    if (open && userEmail) {
      const encryptedData = localStorage.getItem(
        `jira_credentials_${userEmail}`,
      );
      if (encryptedData) {
        try {
          const decryptedStr = decryptData(encryptedData);
          if (decryptedStr) {
            const parsed = JSON.parse(decryptedStr);
            reset(parsed);
          }
        } catch (error) {
          console.error("Failed to parse existing jira credentials", error);
        }
      }
    }
  }, [open, reset, userEmail]);

  const onSubmit = async (data: JiraFormData) => {
    try {
      const jsonString = JSON.stringify(data);
      const encryptedData = encryptData(jsonString);

      if (userEmail) {
        localStorage.setItem(`jira_credentials_${userEmail}`, encryptedData);
      }

      toast.success("เชื่อมต่อสำเร็จ", {
        description: "บันทึกข้อมูล Jira API เรียบร้อยแล้ว",
      });

      setOpen(false);

      // Invalidate the query to refresh the widget
      queryClient.invalidateQueries({ queryKey: ["jira-active-sprint"] });
    } catch (error) {
      console.error("Failed to save Jira credentials:", error);
      toast.error("ข้อผิดพลาด", {
        description: "ไม่สามารถบันทึกข้อมูลได้",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            Connect Jira
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Jira</DialogTitle>
          <DialogDescription>
            กรอกข้อมูล Jira API เพื่อเชื่อมต่อกับ Active Sprint
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jira-url">Jira Base URL</Label>
            <Input
              id="jira-url"
              placeholder="https://your-domain.atlassian.net"
              {...register("baseUrl")}
            />
            {errors.baseUrl && (
              <p className="text-xs text-red-500">{errors.baseUrl.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="jira-email">Email</Label>
            <Input
              id="jira-email"
              type="email"
              placeholder="your-email@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="jira-token">API Token</Label>
              <a
                href="https://id.atlassian.com/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                title="รับ API Token"
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <Input
              id="jira-token"
              type="password"
              placeholder="Your Jira API Token"
              {...register("apiToken")}
            />
            {errors.apiToken && (
              <p className="text-xs text-red-500">{errors.apiToken.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="jira-board">Board ID</Label>
            <Input
              id="jira-board"
              type="text"
              placeholder="e.g. 1"
              {...register("boardId")}
            />
            {errors.boardId && (
              <p className="text-xs text-red-500">{errors.boardId.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
