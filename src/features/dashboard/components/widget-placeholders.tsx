"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JiraCredentialDialog } from "@/features/external-apis/components/credential-dialogs";
import type { JiraIssue } from "@/features/external-apis/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCalendarQuery,
  useGmailQuery,
  useJiraActiveSprintQuery,
} from "@/features/dashboard/hooks/api-hooks";
import { Settings } from "lucide-react";
import dayjs from "dayjs";

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
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const {
    data: sprintData,
    isLoading,
    error,
  } = useJiraActiveSprintQuery(userEmail);

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
          <svg
            className="h-8 w-8 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">Jira ยังไม่ได้เชื่อมต่อ</p>
        <JiraCredentialDialog />
      </motion.div>
    );
  } else if (error || !sprintData) {
    const displayError =
      error?.message === "NO_ACTIVE_SPRINT"
        ? "ไม่พบ Active Sprint ในขณะนี้"
        : "ดึงข้อมูลจาก Jira ไม่สำเร็จ";

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
            Jira Active Sprint
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
        <div className="flex items-center justify-between pb-2">
          <h3
            className="text-sm font-semibold truncate pr-2 flex-1"
            title={sprintData.name}
          >
            {sprintData.name}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs bg-muted px-2 py-1 rounded-full whitespace-nowrap">
              {sprintData.endDate
                ? new Date(sprintData.endDate).toLocaleDateString()
                : "Active"}
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

        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {sprintData.issues?.map((issue: JiraIssue) => (
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
                  {issue.assignee || "Unassigned"}
                </span>
                {/* <span className="text-[10px] text-muted-foreground">
                  ⏱ {new Date(issue.updated).toLocaleDateString()}
                </span> */}
              </div>
            </motion.a>
          ))}

          {(!sprintData.issues || sprintData.issues.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              ไม่มี Issue ใน Sprint นี้
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}

export function CalendarWidgetContent() {
  const { data: session } = useSession();

  const isGoogleUser = session?.user?.provider === "google";

  const {
    data: events = [],
    isLoading,
    error,
  } = useCalendarQuery(isGoogleUser);

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
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">
          ลงชื่อเข้าใช้ด้วย Google เพื่อดูปฏิทิน
        </p>
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
        <p className="text-sm text-red-500">{error.message}</p>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => window.location.reload()}
        >
          ลองใหม่
        </Button>
      </motion.div>
    );
  } else if (events.length === 0) {
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
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">ไม่มีนัดหมายวันนี้ 🎉</p>
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
        {events.map((event) => {
          const start = event.start ? dayjs(event.start).format("HH:mm") : "";
          const end = event.end ? dayjs(event.end).format("HH:mm") : "";

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
              className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer group"
            >
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {event.title?.trim() || "(ไม่มีชื่อ)"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {start || "00:00"}
                  {end && end !== start ? ` – ${end}` : ""}
                </p>
                {event.location && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    📍 {event.location}
                  </p>
                )}
              </div>
              <svg
                className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </motion.a>
          );
        })}
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}

export function GmailWidgetContent() {
  const { data: session } = useSession();

  const isGoogleUser = session?.user?.provider === "google";

  const { data: messages = [], isLoading, error } = useGmailQuery(isGoogleUser);

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
          <svg
            className="h-8 w-8 text-red-500 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">
          ลงชื่อเข้าใช้ด้วย Google เพื่อดูอีเมล
        </p>
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
        <p className="text-sm text-red-500">{error.message}</p>
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => window.location.reload()}
        >
          ลองใหม่
        </Button>
      </motion.div>
    );
  } else if (messages.length === 0) {
    content = (
      <motion.div
        key="empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center"
      >
        <p className="text-sm text-muted-foreground">ไม่มีอีเมลใหม่</p>
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
        {messages.map((msg) => (
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
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
