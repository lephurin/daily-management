"use client";

import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/features/dashboard/hooks/api-hooks";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "กรุณาใส่ชื่อ")
    .max(100, "ชื่อยาวไม่เกิน 100 ตัวอักษร"),
  position: z.string().max(100, "ตำแหน่งยาวไม่เกิน 100 ตัวอักษร").optional(),
  email: z.string().email(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function UserProfileForm() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profileData, isLoading: profileLoading } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, ...formState },
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      position: "",
      email: "",
    },
  });

  const watchedName = watch("name");

  useEffect(() => {
    if (profileData?.data) {
      reset({
        name: profileData.data.name || "",
        position: profileData.data.position || "",
        email: profileData.data.user_id || "",
      });
      if (profileData.data.avatar_url)
        setAvatarUrl(profileData.data.avatar_url);
    }
  }, [profileData, reset]);

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
    const url = URL.createObjectURL(blob);
    setAvatarUrl(url);
  };

  const onSubmit = async (data: ProfileFormData) => {
    updateProfile.mutate(
      { name: data.name, position: data.position || "" },
      {
        onSuccess: () => {
          toast.success("บันทึกโปรไฟล์สำเร็จ!");
        },
        onError: (error: Error) => {
          toast.error("บันทึกไม่สำเร็จ", {
            description: error.message || "เกิดข้อผิดพลาด",
          });
        },
      },
    );
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  if (profileLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center py-20">
          <div className="flex flex-col gap-6 w-full max-w-md">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle>โปรไฟล์ผู้ใช้</CardTitle>
            <CardDescription>จัดการข้อมูลส่วนตัวของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {watchedName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="cursor-pointer"
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
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label htmlFor="position">ตำแหน่งงาน</Label>
                <Input
                  id="position"
                  placeholder="เช่น Frontend Developer, Product Manager"
                  {...register("position")}
                />
                {errors.position && (
                  <p className="text-xs text-red-500">
                    {errors.position.message}
                  </p>
                )}
              </div>

              {/* Email (readonly) */}
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" {...register("email")} disabled />
              </div>

              <Button
                type="submit"
                disabled={updateProfile.isPending || formState.isSubmitting}
                className="w-full cursor-pointer"
              >
                {updateProfile.isPending || formState.isSubmitting
                  ? "กำลังบันทึก..."
                  : "บันทึกโปรไฟล์"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
