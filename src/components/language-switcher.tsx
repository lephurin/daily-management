"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  function onLanguageChange(newLocale: "en" | "th") {
    router.replace(
      // @ts-expect-error -- pathname might not match exactly with params
      { pathname, params },
      { locale: newLocale },
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 gap-2">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="text-xs font-medium uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onLanguageChange("en")}
          className={locale === "en" ? "bg-accent" : ""}
        >
          English (en-US)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onLanguageChange("th")}
          className={locale === "th" ? "bg-accent" : ""}
        >
          ไทย (th)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
