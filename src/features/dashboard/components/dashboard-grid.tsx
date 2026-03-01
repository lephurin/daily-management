"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useDashboardStore } from "@/features/dashboard/store/dashboard-store";
import { SortableWidget } from "./sortable-widget";
import {
  JiraWidgetPlaceholder,
  CalendarWidgetContent,
  GmailWidgetContent,
} from "./widget-placeholders";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const widgetContentMap: Record<string, React.ComponentType> = {
  "jira-widget": JiraWidgetPlaceholder,
  "calendar-widget": CalendarWidgetContent,
  "gmail-widget": GmailWidgetContent,
};

export function DashboardGrid() {
  const { widgets, reorderWidgets } = useDashboardStore();
  const visibleWidgets = widgets.filter((w) => w.visible);

  const queryClient = useQueryClient();
  const [isReloading, setIsReloading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | "failed" | null>(null);

  useEffect(() => {
    // Set initial load time on client-side to prevent hydration mismatch
    // Deferred to avoid cascading renders warning from React Compiler.
    const timer = setTimeout(() => {
      setLastUpdated(new Date());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleManualReload = async () => {
    if (isReloading) return;
    setIsReloading(true);

    try {
      // Invalidate all queries so widgets fetch fresh data
      await queryClient.invalidateQueries();

      // Check if there are any real network/server errors (ignoring unconfigured auth errors)
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
      // Add a small delay for visual feedback, then stop spinning
      setTimeout(() => {
        setIsReloading(false);
      }, 500);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderWidgets(active.id as string, over.id as string);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center gap-3">
        {lastUpdated === "failed" ? (
          <span className="text-xs text-red-500 animate-in fade-in duration-500 font-medium">
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map((w) => w.id)}
          strategy={rectSortingStrategy}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {visibleWidgets.map((widget) => {
              const Content = widgetContentMap[widget.id];
              return (
                <motion.div variants={itemVariants} key={widget.id}>
                  <SortableWidget widget={widget}>
                    {Content ? <Content /> : null}
                  </SortableWidget>
                </motion.div>
              );
            })}
          </motion.div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
