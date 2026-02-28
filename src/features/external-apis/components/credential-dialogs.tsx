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
import { saveExternalCredentials } from "@/features/external-apis/services/external-api-actions";
import { useState } from "react";

const jiraSchema = z.object({
  baseUrl: z
    .string()
    .url("กรุณาใส่ URL ที่ถูกต้อง")
    .min(1, "กรุณาใส่ Base URL"),
  email: z.string().email("กรุณาใส่อีเมลที่ถูกต้อง"),
  apiToken: z.string().min(1, "กรุณาใส่ API Token"),
});

type JiraFormData = z.infer<typeof jiraSchema>;

export function JiraCredentialDialog() {
  const [open, setOpen] = useState(false);

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
    },
  });

  const onSubmit = async (data: JiraFormData) => {
    try {
      await saveExternalCredentials("jira", data);
      setOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to save Jira credentials:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Connect Jira
        </Button>
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
            <Label htmlFor="jira-token">API Token</Label>
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
