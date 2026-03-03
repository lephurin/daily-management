"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { SlackCredentialDialog } from "@/features/external-apis/components/credential-dialogs";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Search, ExternalLink, Slack } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import Lottie from "lottie-react";
import emptyAnimation from "@/assets/animations/empty-box.json";
import { useSlackTodayQuery } from "../hooks/api-hooks";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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

export function SlackWidgetContent() {
  const t = useTranslations("Widgets.slack");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: messages = [],
    isLoading,
    isError,
  } = useSlackTodayQuery(hasCredentials ? userId : null);

  // Simulated query check
  useEffect(() => {
    const checkCreds = () => {
      if (userId) {
        const creds = localStorage.getItem(`slack_credentials_${userId}`);
        setHasCredentials(!!creds);
      } else {
        setHasCredentials(false);
      }
    };
    checkCreds();
  }, [userId]);

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return messages;

    const lowerTerm = searchTerm.toLowerCase();
    return messages.filter(
      (msg) =>
        msg.sender.toLowerCase().includes(lowerTerm) ||
        msg.snippet.toLowerCase().includes(lowerTerm),
    );
  }, [searchTerm, messages]);

  // Loading state while checking localStorage to prevent hydration mismatch
  if (hasCredentials === null) {
    return null;
  }

  let content;

  if (!hasCredentials) {
    content = (
      <motion.div
        key="no-creds"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center"
      >
        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
          <Slack className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="text-sm text-muted-foreground">{t("notConnected")}</p>
        <SlackCredentialDialog />
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
        <div className="flex items-center justify-between pb-2 gap-2 px-1">
          <h3 className="text-sm font-semibold flex-1">
            Slack Mentions & DMs Today
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <SlackCredentialDialog
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

        <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 mt-2">
          {isLoading && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && isError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-6 text-center min-h-[160px]"
            >
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30 mb-2">
                <Settings className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Connection Error
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please check your Slack credentials and try again.
              </p>
            </motion.div>
          )}

          {!isLoading &&
            !isError &&
            filteredMessages.map((msg) => (
              <motion.a
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                layout
                key={msg.id}
                href={msg.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border p-3 bg-card transition-colors hover:bg-accent/50 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="truncate text-sm font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {msg.sender}
                    </span>
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground shrink-0 border">
                      {msg.channel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                  {msg.snippet}
                </p>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">
                    {msg.timestamp} ({dayjs(msg.timestampMs).fromNow()})
                  </span>
                </div>
              </motion.a>
            ))}

          {!isLoading && !isError && filteredMessages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-6 text-center min-h-[160px]"
            >
              <div className="opacity-70 mb-2">
                <Lottie animationData={emptyAnimation} loop={true} />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {searchTerm ? t("noResults") : t("noMessages")}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
