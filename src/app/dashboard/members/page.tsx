"use client";

import { MemberDataTable } from "@/features/members/components/member-data-table";
import { motion } from "framer-motion";

export default function MembersPage() {
  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="mx-auto max-w-5xl space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">จัดการสมาชิก</h2>
        <p className="text-sm text-muted-foreground">
          จัดการรายชื่อผู้ใช้และสิทธิ์การเข้าถึง (เฉพาะ Super Admin)
        </p>
      </div>
      <MemberDataTable />
    </motion.div>
  );
}
