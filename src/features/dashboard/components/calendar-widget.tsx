"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useCalendarQuery } from "@/features/dashboard/hooks/api-hooks";
import { Calendar, ExternalLink, Filter, Coffee } from "lucide-react";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import Lottie from "lottie-react";
import emptyAnimation from "@/assets/animations/empty-box.json";

// Simple animation variants for staggered lists
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
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function CalendarWidgetContent() {
  const t = useTranslations("Widgets.calendar");
  const { data: session } = useSession();

  const isGoogleUser = session?.user?.provider === "google";

  const {
    data: events = [],
    isLoading,
    error,
  } = useCalendarQuery(isGoogleUser);

  const todayEvents = useMemo(() => {
    const todayStart = dayjs().startOf("day").valueOf();
    const todayEnd = dayjs().endOf("day").valueOf();

    return events.filter((event) => {
      if (!event.start) return false;
      const tStart = dayjs(event.start).valueOf();
      const tEnd = event.end ? dayjs(event.end).valueOf() : tStart;

      return tStart <= todayEnd && tEnd >= todayStart;
    });
  }, [events]);

  const uniqueCalendars = useMemo(() => {
    const map = new Map<string, string>();
    events.forEach((e) => {
      if (e.calendarName) {
        map.set(e.calendarName, e.color || "#ccc");
      }
    });
    return Array.from(map.entries()).map(([name, color]) => ({ name, color }));
  }, [events]);

  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);

  const toggleCalendar = (calName: string) => {
    setSelectedCalendars((prev) =>
      prev.includes(calName)
        ? prev.filter((name) => name !== calName)
        : [...prev, calName],
    );
  };

  const filteredTodayEvents = useMemo(() => {
    if (selectedCalendars.length === 0) return todayEvents;
    return todayEvents.filter(
      (e) => e.calendarName && selectedCalendars.includes(e.calendarName),
    );
  }, [todayEvents, selectedCalendars]);

  let content;

  if (!isGoogleUser) {
    content = (
      <motion.div
        key="not-google"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center"
      >
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm text-muted-foreground">{t("notConnected")}</p>
      </motion.div>
    );
  } else if (isLoading) {
    content = (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-4 p-1"
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
            <Skeleton className="mt-0.5 h-2 w-2 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </motion.div>
    );
  } else if (error) {
    content = (
      <motion.div
        key="error"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center"
      >
        <p className="text-sm text-red-500">{error?.message}</p>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => window.location.reload()}
        >
          {t("retry")}
        </Button>
      </motion.div>
    );
  } else if (todayEvents.length === 0) {
    content = (
      <motion.div
        key="empty"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="flex min-h-[220px] flex-col items-center justify-center gap-1.5 p-6 text-center"
      >
        <div className="relative mb-3">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-400/20 dark:bg-blue-400/10" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-100 to-blue-50 border border-blue-200 shadow-inner dark:from-blue-900/40 dark:to-blue-800/20 dark:border-blue-800/50">
            <Coffee className="h-7 w-7 text-blue-500 dark:text-blue-400 opacity-80" />
          </div>
        </div>
        <p className="text-sm font-medium text-foreground">
          {t("noEvents") || "You're all clear!"}
        </p>
        <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
          No events scheduled. Enjoy the free time or focus on your tasks!
        </p>
      </motion.div>
    );
  } else {
    content = (
      <motion.div
        key="content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        className="space-y-2 p-1"
      >
        <div className="flex items-center gap-4 px-2 pb-2 text-[10px] text-muted-foreground border-b border-border/50 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            <span>{t("statusPast")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>{t("statusCurrent")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>{t("statusUpcoming")}</span>
          </div>
        </div>

        {uniqueCalendars.length > 0 && (
          <div className="flex items-center gap-1.5 px-1 mb-3 pb-1 scrollbar-none overflow-visible">
            <div
              className="flex items-center justify-center text-muted-foreground shrink-0 mr-1 bg-secondary/30 rounded-full p-1.5"
              title={t("filterTitle")}
            >
              <Filter className="h-3 w-3" />
            </div>
            {uniqueCalendars.map((cal) => {
              const isSelected = selectedCalendars.includes(cal.name);
              return (
                <button
                  key={cal.name}
                  onClick={() => toggleCalendar(cal.name)}
                  className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full border transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                    isSelected
                      ? "shadow-sm font-medium"
                      : "bg-secondary/20 border-border/60 text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:border-border"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: cal.color,
                          color: cal.color,
                          backgroundColor: `${cal.color}1A`,
                        }
                      : {}
                  }
                >
                  {cal.name}
                </button>
              );
            })}
          </div>
        )}

        {filteredTodayEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-6 text-center min-h-[160px]"
          >
            <div className="opacity-70 mb-2">
              <Lottie animationData={emptyAnimation} loop={true} />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {t("noResults")}
            </p>
          </motion.div>
        )}

        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {filteredTodayEvents.map((event) => {
            const isAllDay = event.start && !event.start.includes("T");
            const start = event.start ? dayjs(event.start).format("HH:mm") : "";
            const end = event.end ? dayjs(event.end).format("HH:mm") : "";

            const nowMs = dayjs().valueOf();
            const startMs = dayjs(event.start).valueOf();
            const endMs = event.end ? dayjs(event.end).valueOf() : startMs;

            let dotColor = "bg-blue-500";
            if (endMs < nowMs && !isAllDay) {
              dotColor = "bg-gray-400";
            } else if (startMs <= nowMs && nowMs <= endMs && !isAllDay) {
              dotColor = "bg-green-500";
            }

            return (
              <motion.a
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                layout
                key={event.id}
                href={
                  event.htmlLink ||
                  `https://calendar.google.com/calendar/r/eventedit/${event.id}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer group"
              >
                <div className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium transition-colors">
                    {event.title?.trim() || t("noTitle")}
                  </p>
                  {event.calendarName && (
                    <div className="mt-1 flex items-center">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded border"
                        style={{
                          borderColor: event.color || "var(--border)",
                          color: event.color || "var(--muted-foreground)",
                          backgroundColor: event.color
                            ? `${event.color}1A`
                            : "transparent",
                        }}
                      >
                        {event.calendarName}
                      </span>
                    </div>
                  )}
                  {isAllDay ? (
                    <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      All Day
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {start || "00:00"}
                      {end && end !== start ? ` – ${end}` : ""}
                    </p>
                  )}
                  {event.location && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      📍 {event.location}
                    </p>
                  )}
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
