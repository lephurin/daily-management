"use client";

import { UserProfileForm } from "@/features/user-profile/components/user-profile-form";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="mx-auto max-w-4xl space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          จัดการโปรไฟล์และการตั้งค่าบัญชี
        </p>
      </div>
      <UserProfileForm />
    </motion.div>
  );
}
