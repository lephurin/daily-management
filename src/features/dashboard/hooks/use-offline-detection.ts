"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("กลับมาออนไลน์แล้ว", {
        description: "ระบบพร้อมใช้งานตามปกติ",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("ขาดการเชื่อมต่ออินเทอร์เน็ต", {
        description: "ระบบจะหยุดการส่งข้อมูลชั่วคราว",
        duration: Infinity,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
