"use client";

import { AiChatPanel } from "@/features/ai-chatbot/components/ai-chat-panel";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ChatPage() {
  const t = useTranslations("Chat");
  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="mx-auto max-w-3xl space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <AiChatPanel />
    </motion.div>
  );
}
