"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useGmailQuery } from "@/features/dashboard/hooks/api-hooks";
import { Search, ExternalLink, Mail } from "lucide-react";
import dayjs from "dayjs";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
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

export function GmailWidgetContent() {
  const t = useTranslations("Widgets.gmail");
  const { data: session } = useSession();

  const isGoogleUser = session?.user?.provider === "google";

  const { data: messages = [], isLoading, error } = useGmailQuery(isGoogleUser);

  const [searchTerm, setSearchTerm] = useState("");

  const todayMessages = useMemo(() => {
    if (!messages) return [];
    const todayStart = dayjs().startOf("day").valueOf();
    const todayEnd = dayjs().endOf("day").valueOf();

    return messages.filter((msg) => {
      if (!msg.date) return false;
      const msgTime = dayjs(msg.date).valueOf();
      return msgTime >= todayStart && msgTime <= todayEnd;
    });
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (!todayMessages) return [];
    if (!searchTerm.trim()) return todayMessages;

    const lowerTerm = searchTerm.toLowerCase();
    return todayMessages.filter(
      (msg) =>
        msg.subject?.toLowerCase().includes(lowerTerm) ||
        msg.from?.toLowerCase().includes(lowerTerm) ||
        msg.snippet?.toLowerCase().includes(lowerTerm),
    );
  }, [todayMessages, searchTerm]);

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
                  ? "border-l-2 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/10"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`truncate text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1 ${msg.isUnread ? "font-bold text-foreground" : "font-normal text-muted-foreground"}`}
                >
                  {msg.subject}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  {msg.isUnread && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                  )}
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-6 text-center min-h-[160px]"
            >
              <div className="opacity-70 mb-2">
                <Lottie animationData={emptyAnimation} loop={true} />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {searchTerm ? t("noResults") : t("noEmails")}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
