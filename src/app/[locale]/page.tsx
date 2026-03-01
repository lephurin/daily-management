import Image from "next/image";
import { Footer } from "@/components/footer";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Home() {
  const t = useTranslations("HomePage");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20">
        <Image
          className="mb-8 dark:invert"
          src="/dm.png"
          alt="Daily Management logo"
          width={80}
          height={80}
          priority
        />
        <h1 className="mb-4 text-center text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mb-10 max-w-lg text-center text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t("description")}
        </p>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {t("getStarted")}
        </Link>
      </main>

      <Footer />
    </div>
  );
}
