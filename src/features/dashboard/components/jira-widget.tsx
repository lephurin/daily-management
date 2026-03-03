"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { JiraCredentialDialog } from "@/features/external-apis/components/credential-dialogs";
import type { JiraIssue } from "@/features/external-apis/types";
import { motion, AnimatePresence } from "framer-motion";
import { useJiraActiveSprintQuery } from "@/features/dashboard/hooks/api-hooks";
import { Settings, Search, ExternalLink, Ghost, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [selectedEpics, setSelectedEpics] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const uniqueEpics = useMemo(() => {
    const epics = new Set<string>();
    sprintData?.issues?.forEach((issue) => {
      if (issue.epic) epics.add(issue.epic);
    });
    return Array.from(epics);
  }, [sprintData?.issues]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    sprintData?.issues?.forEach((issue) => {
      if (issue.status) statuses.add(issue.status);
    });
    return Array.from(statuses);
  }, [sprintData?.issues]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    sprintData?.issues?.forEach((issue) => {
      if (issue.type) types.add(issue.type);
    });
    return Array.from(types);
  }, [sprintData?.issues]);

  const toggleEpic = (epic: string) => {
    setSelectedEpics((prev) =>
      prev.includes(epic) ? prev.filter((e) => e !== epic) : [...prev, epic],
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const clearFilters = () => {
    setSelectedEpics([]);
    setSelectedStatuses([]);
    setSelectedTypes([]);
  };

  const filteredIssues = useMemo(() => {
    let issues = sprintData?.issues || [];

    if (selectedEpics.length > 0) {
      issues = issues.filter(
        (issue) => issue.epic && selectedEpics.includes(issue.epic),
      );
    }

    if (selectedStatuses.length > 0) {
      issues = issues.filter(
        (issue) => issue.status && selectedStatuses.includes(issue.status),
      );
    }

    if (selectedTypes.length > 0) {
      issues = issues.filter(
        (issue) => issue.type && selectedTypes.includes(issue.type),
      );
    }

    if (!searchTerm.trim()) return issues;

    const lowerTerm = searchTerm.toLowerCase();
    return issues.filter(
      (issue) =>
        issue.key.toLowerCase().includes(lowerTerm) ||
        issue.summary.toLowerCase().includes(lowerTerm) ||
        issue.status.toLowerCase().includes(lowerTerm),
    );
  }, [
    sprintData?.issues,
    searchTerm,
    selectedEpics,
    selectedStatuses,
    selectedTypes,
  ]);

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
                ? t("endsOn", {
                    date: new Date(sprintData.endDate).toLocaleDateString(),
                  })
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

        {(uniqueEpics.length > 0 ||
          uniqueStatuses.length > 0 ||
          uniqueTypes.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 px-1 mb-3">
            {uniqueEpics.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                      selectedEpics.length > 0
                        ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-medium shadow-sm"
                        : "bg-secondary/20 border-border/60 text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    Epic{" "}
                    {selectedEpics.length > 0 && `(${selectedEpics.length})`}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 max-h-[200px] overflow-y-auto"
                  align="start"
                >
                  {uniqueEpics.map((epic) => (
                    <DropdownMenuCheckboxItem
                      key={epic}
                      checked={selectedEpics.includes(epic)}
                      onCheckedChange={() => toggleEpic(epic)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {epic}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {uniqueStatuses.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                      selectedStatuses.length > 0
                        ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-medium shadow-sm"
                        : "bg-secondary/20 border-border/60 text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    Status{" "}
                    {selectedStatuses.length > 0 &&
                      `(${selectedStatuses.length})`}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 max-h-[200px] overflow-y-auto"
                  align="start"
                >
                  {uniqueStatuses.map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={selectedStatuses.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {status}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {uniqueTypes.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border transition-all hover:-translate-y-0.5 hover:shadow-sm active:scale-95 ${
                      selectedTypes.length > 0
                        ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400 font-medium shadow-sm"
                        : "bg-secondary/20 border-border/60 text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    Type{" "}
                    {selectedTypes.length > 0 && `(${selectedTypes.length})`}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 max-h-[200px] overflow-y-auto"
                  align="start"
                >
                  {uniqueTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={selectedTypes.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {type}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {(selectedEpics.length > 0 ||
              selectedStatuses.length > 0 ||
              selectedTypes.length > 0) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors ml-auto"
                title={t("clearFilters")}
              >
                <X className="h-3 w-3" />
                {t("clearFilters")}
              </button>
            )}
          </div>
        )}

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
                <div className="flex items-center gap-1.5 min-w-0">
                  {issue.iconUrl && (
                    <img
                      src={issue.iconUrl}
                      alt={issue.type || "Issue type"}
                      className="w-4 h-4 shrink-0"
                      title={issue.type}
                    />
                  )}
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0 group-hover:underline">
                    {issue.key}
                  </span>
                </div>
                <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground shrink-0 border">
                  {issue.status}
                </span>
              </div>
              <p className="text-sm font-medium line-clamp-2 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {issue.summary}
              </p>
              {issue.epic && (
                <div className="mt-1 flex items-center">
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-blue-300 text-blue-600 dark:border-blue-700/50 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20">
                    {issue.epic}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {issue.assignee || t("unassigned")}
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))}

          {filteredIssues.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-6 text-center min-h-[160px]"
            >
              <div className="opacity-70 mb-2">
                <Lottie animationData={emptyAnimation} loop={true} />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {searchTerm ? t("noResults") : t("noIssues")}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}
