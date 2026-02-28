"use client";

import { useState } from "react";
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

export function JiraCredentialDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    baseUrl: "",
    email: "",
    apiToken: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveExternalCredentials("jira", formData);
      setOpen(false);
      setFormData({ baseUrl: "", email: "", apiToken: "" });
    } catch (error) {
      console.error("Failed to save Jira credentials:", error);
    } finally {
      setLoading(false);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jira-url">Jira Base URL</Label>
            <Input
              id="jira-url"
              placeholder="https://your-domain.atlassian.net"
              value={formData.baseUrl}
              onChange={(e) =>
                setFormData({ ...formData, baseUrl: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jira-email">Email</Label>
            <Input
              id="jira-email"
              type="email"
              placeholder="your-email@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jira-token">API Token</Label>
            <Input
              id="jira-token"
              type="password"
              placeholder="Your Jira API Token"
              value={formData.apiToken}
              onChange={(e) =>
                setFormData({ ...formData, apiToken: e.target.value })
              }
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
