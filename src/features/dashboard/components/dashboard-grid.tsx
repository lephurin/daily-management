"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { DashboardWidget } from "./dashboard-widget";
import { ManageWidgetsPanel } from "./manage-widgets-panel";
import {
  JiraWidgetPlaceholder,
  CalendarWidgetContent,
  GmailWidgetContent,
} from "./widget-placeholders";

const widgetContentMap: Record<string, React.ComponentType> = {
  "jira-widget": JiraWidgetPlaceholder,
  "calendar-widget": CalendarWidgetContent,
  "gmail-widget": GmailWidgetContent,
};

export function DashboardGrid() {
  const { widgets } = useDashboardStore();
  const visibleWidgets = widgets.filter((w) => w.visible);

  const queryClient = useQueryClient();
  const [isReloading, setIsReloading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | "failed" | null>(null);

  useEffect(() => {
    // Set initial load time on client-side to prevent hydration mismatch
    const timer = setTimeout(() => {
      setLastUpdated(new Date());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleManualReload = async () => {
    if (isReloading) return;
    setIsReloading(true);

    try {
      await queryClient.invalidateQueries();
      const activeQueries = queryClient
        .getQueryCache()
        .getAll()
        .filter((q) => q.isActive());
      const hasRealErrors = activeQueries.some((q) => {
        if (q.state.status !== "error") return false;
        const msg = (q.state.error as Error)?.message || "";
        const isAuthError =
          msg.includes("CREDENTIALS") ||
          msg.includes("DECRYPT") ||
          msg.includes("Unauthorized");
        return !isAuthError;
      });

      if (!hasRealErrors) {
        setLastUpdated(new Date());
      } else {
        setLastUpdated("failed");
      }
    } finally {
      setTimeout(() => {
        setIsReloading(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-3 rounded-lg border shadow-sm">
        <ManageWidgetsPanel />
        <div className="flex items-center gap-3">
          {lastUpdated === "failed" ? (
            <span className="text-xs text-destructive animate-in fade-in duration-500 font-medium">
              โหลดข้อมูลล่าสุดไม่สำเร็จ
            </span>
          ) : lastUpdated ? (
            <span className="text-xs text-muted-foreground animate-in fade-in duration-500">
              อัปเดตล่าสุด: {dayjs(lastUpdated).format("MMMM D, YYYY HH:mm")}
            </span>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualReload}
            disabled={isReloading}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`}
            />
            {isReloading ? "กำลังโหลด..." : "โหลดข้อมูลใหม่"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 grid-flow-dense pb-8">
        {visibleWidgets.map((widget) => {
          const Content = widgetContentMap[widget.id];
          return (
            <DashboardWidget key={widget.id} widget={widget}>
              {Content ? <Content /> : null}
            </DashboardWidget>
          );
        })}
      </div>
    </div>
  );
}
