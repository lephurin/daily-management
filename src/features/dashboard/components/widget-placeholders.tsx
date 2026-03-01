"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { JiraCredentialDialog } from "@/features/external-apis/components/credential-dialogs";
import type { JiraIssue } from "@/features/external-apis/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCalendarQuery,
  useGmailQuery,
  useJiraActiveSprintQuery,
} from "@/features/dashboard/hooks/api-hooks";
import {
  Settings,
  Search,
  Calendar,
  Check,
  ExternalLink,
  Mail,
  Ghost,
  Filter,
} from "lucide-react";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

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

export function JiraWidgetPlaceholder() {
  const t = useTranslations("Widgets.jira");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    data: sprintData,
    isLoading,
    error,
  } = useJiraActiveSprintQuery(userId);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredIssues = useMemo(() => {
    const issues = sprintData?.issues || [];
    if (!searchTerm.trim()) return issues;

    const lowerTerm = searchTerm.toLowerCase();
    return issues.filter(
      (issue) =>
        issue.key.toLowerCase().includes(lowerTerm) ||
        issue.summary.toLowerCase().includes(lowerTerm) ||
        issue.status.toLowerCase().includes(lowerTerm),
    );
  }, [sprintData?.issues, searchTerm]);

  const isCredentialsError =
    error?.message === "CREDENTIALS_NOT_FOUND" ||
    error?.message === "DECRYPT_FAILED" ||
    error?.message === "INVALID_CREDENTIALS";

  let content;

  if (isLoading) {
    content = (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-3 p-1"
      >
        <Skeleton className="h-6 w-1/2 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-3">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </motion.div>
    );
  } else if (isCredentialsError) {
    content = (
      <motion.div
        key="no-creds"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center"
      >
        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
          <Ghost className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm text-muted-foreground">{t("notConnected")}</p>
        <JiraCredentialDialog />
      </motion.div>
    );
  } else if (error || !sprintData) {
    const displayError =
      error?.message === "NO_ACTIVE_SPRINT"
        ? t("noActiveSprint")
        : t("fetchFailed");

    content = (
      <motion.div
        key="error"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        className="space-y-3 p-1 flex flex-col min-h-[200px]"
      >
        <div className="flex items-center justify-between pb-2">
          <h3 className="text-sm font-semibold truncate pr-2 flex-1">
            {t("sprintTitle")}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <JiraCredentialDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">{displayError}</p>
        </div>
      </motion.div>
    );
  } else {
    // Has data
    content = (
      <motion.div
        key="content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        className="space-y-3 p-1"
      >
        <div className="flex items-center justify-between pb-2 gap-2">
          <h3
            className="text-sm font-semibold truncate flex-1"
            title={sprintData.name}
          >
            {sprintData.name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs bg-muted px-2 py-1 rounded-full whitespace-nowrap">
              {sprintData.endDate
                ? new Date(sprintData.endDate).toLocaleDateString()
                : t("active")}
            </span>
            <JiraCredentialDialog
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>

        <div className="relative mb-2 px-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9 h-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {filteredIssues.map((issue: JiraIssue) => (
            <motion.a
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              layout
              key={issue.id}
              href={
                sprintData.baseUrl
                  ? `${sprintData.baseUrl}/browse/${issue.key}`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-1 rounded-lg border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-2 justify-between">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0 group-hover:underline">
                  {issue.key}
                </span>
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground shrink-0 border">
                  {issue.status}
                </span>
              </div>
              <p className="text-sm font-medium line-clamp-2 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {issue.summary}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {issue.assignee || t("unassigned")}
                </span>
                {/* <span className="text-[10px] text-muted-foreground">
                  ⏱ {new Date(issue.updated).toLocaleDateString()}
                </span> */}
              </div>
            </motion.a>
          ))}

          {filteredIssues.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchTerm ? t("noResults") : t("noIssues")}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}

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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center"
      >
        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
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
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("noResults")}
          </p>
        )}

        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {filteredTodayEvents.map((event) => {
            const start = event.start ? dayjs(event.start).format("HH:mm") : "";
            const end = event.end ? dayjs(event.end).format("HH:mm") : "";

            const nowMs = dayjs().valueOf();
            const startMs = dayjs(event.start).valueOf();
            const endMs = event.end ? dayjs(event.end).valueOf() : startMs;

            let dotColor = "bg-blue-500";
            if (endMs < nowMs) {
              dotColor = "bg-gray-400";
            } else if (startMs <= nowMs && nowMs <= endMs) {
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    {start || "00:00"}
                    {end && end !== start ? ` – ${end}` : ""}
                  </p>
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

export function GmailWidgetContent() {
  const t = useTranslations("Widgets.gmail");
  const { data: session } = useSession();

  const isGoogleUser = session?.user?.provider === "google";

  const { data: messages = [], isLoading, error } = useGmailQuery(isGoogleUser);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    if (!searchTerm.trim()) return messages;

    const lowerTerm = searchTerm.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.subject?.toLowerCase().includes(lowerTerm) ||
        msg.from?.toLowerCase().includes(lowerTerm) ||
        msg.snippet?.toLowerCase().includes(lowerTerm),
    );
  }, [messages, searchTerm]);

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
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
          <Mail className="h-8 w-8 text-red-500 dark:text-red-400" />
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
        className="space-y-3 p-1"
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="mt-2 h-3 w-1/3" />
            <Skeleton className="mt-2 h-3 w-full" />
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
  } else {
    content = (
      <motion.div
        key="content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0 }}
        className="space-y-1 p-1"
      >
        <div className="relative mb-2 px-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9 h-9 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
          {filteredMessages.map((msg) => (
            <motion.a
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              layout
              key={msg.id}
              href={`https://mail.google.com/mail/u/0/#inbox/${msg.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`block rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer group ${
                msg.isUnread
                  ? "border-l-2 border-l-red-500 bg-red-50/30 dark:bg-red-950/10"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`truncate text-sm group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors ${msg.isUnread ? "font-semibold" : "font-medium"}`}
                >
                  {msg.subject}
                </p>
                {msg.isUnread && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {msg.from}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {msg.snippet}
              </p>
            </motion.a>
          ))}

          {filteredMessages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {searchTerm ? t("noResults") : t("noEmails")}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
