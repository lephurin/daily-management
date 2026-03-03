"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  useDashboardStore,
  WidgetConfig,
  DEFAULT_WIDGETS,
} from "../store/dashboard-store";

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
          // Merge parsed layout with DEFAULT_WIDGETS to support newly added widgets
          let mergedLayout = [...parsedLayout];
          DEFAULT_WIDGETS.forEach((defaultWidget) => {
            const exists = mergedLayout.some((w) => w.id === defaultWidget.id);
            if (!exists) {
              mergedLayout.push(defaultWidget);
            }
          });

          // Override local titles with DEFAULT_WIDGETS titles
          // to push static changes (like "Slack Unread" -> "Slack Today")
          mergedLayout = mergedLayout.map((widget) => {
            const defaultEquivalent = DEFAULT_WIDGETS.find(
              (dw) => dw.id === widget.id,
            );
            return defaultEquivalent
              ? { ...widget, title: defaultEquivalent.title }
              : widget;
          });

          setWidgets(mergedLayout);
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
