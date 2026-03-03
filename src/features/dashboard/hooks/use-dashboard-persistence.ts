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
  const { layouts, setLayouts } = useDashboardStore();
  const userId = session?.user?.id;
  const isInitialLoad = useRef(true);

  // Load from localStorage on mount/userId change
  useEffect(() => {
    if (!userId) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const savedLayout = localStorage.getItem(storageKey);

    if (savedLayout) {
      try {
        const parsedData = JSON.parse(savedLayout);

        // Handle migration from legacy format (Array) to new format (Object with views)
        let parsedDesktop: WidgetConfig[] = DEFAULT_WIDGETS;
        let parsedMobile: WidgetConfig[] = DEFAULT_WIDGETS;

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          parsedDesktop = parsedData;
          parsedMobile = [...parsedData]; // Deep copy for mobile
        } else if (
          parsedData &&
          typeof parsedData === "object" &&
          parsedData.desktop &&
          parsedData.mobile
        ) {
          parsedDesktop = parsedData.desktop;
          parsedMobile = parsedData.mobile;
        }

        const mergeWithDefaults = (layout: WidgetConfig[]) => {
          const mergedLayout = [...layout];
          DEFAULT_WIDGETS.forEach((defaultWidget) => {
            const exists = mergedLayout.some((w) => w.id === defaultWidget.id);
            if (!exists) {
              mergedLayout.push(defaultWidget);
            }
          });

          // Override local titles with DEFAULT_WIDGETS titles
          return mergedLayout.map((widget) => {
            const defaultEquivalent = DEFAULT_WIDGETS.find(
              (dw) => dw.id === widget.id,
            );
            return defaultEquivalent
              ? { ...widget, title: defaultEquivalent.title }
              : widget;
          });
        };

        setLayouts({
          desktop: mergeWithDefaults(parsedDesktop),
          mobile: mergeWithDefaults(parsedMobile),
        });
      } catch (error) {
        console.error(
          "Failed to parse dashboard layout from localStorage:",
          error,
        );
      }
    }

    isInitialLoad.current = false;
  }, [userId, setLayouts]);

  // Save to localStorage on widget changes
  useEffect(() => {
    if (!userId || isInitialLoad.current) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(layouts));
  }, [layouts, userId]);
}
