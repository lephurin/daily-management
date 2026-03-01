"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useDashboardStore, WidgetConfig } from "../store/dashboard-store";

const STORAGE_KEY_PREFIX = "dashboard-layout-";

export function useDashboardPersistence() {
  const { data: session } = useSession();
  const { widgets, setWidgets } = useDashboardStore();
  const userId = session?.user?.id;
  const isInitialLoad = useRef(true);

  // Load from localStorage on mount/userId change
  useEffect(() => {
    if (!userId) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const savedLayout = localStorage.getItem(storageKey);

    if (savedLayout) {
      try {
        const parsedLayout = JSON.parse(savedLayout) as WidgetConfig[];
        if (Array.isArray(parsedLayout) && parsedLayout.length > 0) {
          setWidgets(parsedLayout);
        }
      } catch (error) {
        console.error(
          "Failed to parse dashboard layout from localStorage:",
          error,
        );
      }
    }

    isInitialLoad.current = false;
  }, [userId, setWidgets]);

  // Save to localStorage on widget changes
  useEffect(() => {
    if (!userId || isInitialLoad.current) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(widgets));
  }, [widgets, userId]);
}
