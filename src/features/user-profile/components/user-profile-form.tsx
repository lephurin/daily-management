"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageCropDialog } from "./image-crop-dialog";

export function UserProfileForm() {
  const [name, setName] = useState("Dev User");
  const [email] = useState("dev@localhost");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (blob: Blob) => {
    // TODO: Upload to Supabase Storage
    const url = URL.createObjectURL(blob);
    setAvatarUrl(url);
    console.log("Avatar cropped, size:", blob.size);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save profile to Supabase
      console.log("Saving profile:", { name, avatarUrl });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>โปรไฟล์ผู้ใช้</CardTitle>
          <CardDescription>จัดการข้อมูลส่วนตัวของคุณ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                เปลี่ยนรูปโปรไฟล์
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG ขนาดไม่เกิน 5MB
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input id="email" value={email} disabled />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
          </Button>
        </CardContent>
      </Card>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
