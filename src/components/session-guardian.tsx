"use client";

import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function SessionGuardian() {
  const { data: session } = useSession();

  // Check if the auth token refresh failed
  const error = session?.user?.error;
  const isExpired = error === "RefreshAccessTokenError";

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Dialog open={isExpired} onOpenChange={() => {}}>
      {/* onOpenChange is empty to prevent dismissing the modal by clicking outside or pressing Escape */}
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        {/* [&>button]:hidden hides the default Shadcn close 'X' button */}
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-center">เซสชันหมดอายุ</DialogTitle>
          <DialogDescription className="text-center">
            ระยะเวลาการใช้งานของคุณหมดอายุแล้ว
            หรือไม่สามารถดำเนินการต่ออายุบัญชีได้ กรุณาเข้าสู่ระบบใหม่อีกครั้ง
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleLogout} className="w-full sm:w-auto">
            เข้าสู่ระบบใหม่
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
