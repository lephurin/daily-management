"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, Settings2 } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { DashboardWidget } from "./dashboard-widget";
import { ManageWidgetsPanel } from "./manage-widgets-panel";
import { JiraWidgetPlaceholder } from "./jira-widget";
import { CalendarWidgetContent } from "./calendar-widget";
import { GmailWidgetContent } from "./gmail-widget";
import { SlackWidgetContent } from "./slack-widget";

import { useTranslations } from "next-intl";
import { useDashboardPersistence } from "../hooks/use-dashboard-persistence";

const widgetContentMap: Record<string, React.ComponentType> = {
  "jira-widget": JiraWidgetPlaceholder,
  "calendar-widget": CalendarWidgetContent,
  "gmail-widget": GmailWidgetContent,
  "slack-widget": SlackWidgetContent,
};

export function DashboardGrid() {
  useDashboardPersistence();
  const t = useTranslations("DashboardGrid");
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
    <div className="space-y-4 relative">
      <div className="flex items-center justify-end pr-2 pt-2 gap-2">
        {lastUpdated === "failed" ? (
          <span className="text-xs text-destructive animate-in fade-in duration-500 font-medium bg-card/50 backdrop-blur py-1 px-2 rounded-md">
            {t("updateFailed")}
          </span>
        ) : lastUpdated ? (
          <span className="text-xs text-muted-foreground animate-in fade-in duration-500 bg-card/50 backdrop-blur py-1 px-2 rounded-md">
            {t("lastUpdated", {
              date: dayjs(lastUpdated).format("MMMM D, YYYY HH:mm"),
            })}
          </span>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          onClick={handleManualReload}
          disabled={isReloading}
          className="gap-2 bg-card/50 backdrop-blur"
        >
          <RefreshCw
            className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`}
          />
          {isReloading ? t("reloading") : t("reload")}
        </Button>
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <ManageWidgetsPanel
              trigger={
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Settings2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
              }
            />
            <TooltipContent side="left" className="mr-2 font-medium">
              <p>{t("manageLayout")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
