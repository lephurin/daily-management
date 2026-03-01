"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { useSession } from "next-auth/react";

export function Footer() {
  const t = useTranslations("Footer");
  const { data: session } = useSession();

  return (
    <footer className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("rights", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {t("educational")}
          </p>
        </div>
        <nav className="flex items-center gap-6">
          <Link
            href="/privacy-policy"
            className="text-sm text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            {t("privacyPolicy")}
          </Link>
          {!session && <LanguageSwitcher />}
        </nav>
      </div>
    </footer>
  );
}
