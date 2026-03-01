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
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
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
