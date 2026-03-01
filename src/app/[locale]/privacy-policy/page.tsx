import { useTranslations } from "next-intl";

export default function PrivacyPolicyPage() {
  const t = useTranslations("Privacy");

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <article className="w-full max-w-3xl rounded-xl border bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 sm:p-12">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          {t("lastUpdated", { date: "March 1, 2026" })}
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("q1_title")}
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{t("q1_item1")}</li>
              <li>{t("q1_item2")}</li>
              <li>{t("q1_item3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("q2_title")}
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{t("q2_item1")}</li>
              <li>{t("q2_item2")}</li>
              <li>{t("q2_item3")}</li>
              <li>{t("q2_item4")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("q3_title")}
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{t("q3_item1")}</li>
              <li>{t("q3_item2")}</li>
              <li>{t("q3_item3")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("q4_title")}
            </h2>
            <p>{t("q4_text")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("q5_title")}
            </h2>
            <p className="mb-2">{t("q5_subtitle")}</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>{t("q5_item1")}</li>
              <li>{t("q5_item2")}</li>
              <li>{t("q5_item3")}</li>
              <li>{t("q5_item4")}</li>
              <li>{t("q5_item5")}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("q6_title")}
            </h2>
            <p>{t("q6_text")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("q7_title")}
            </h2>
            <p>{t("q7_text")}</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {t("q8_title")}
            </h2>
            <p>{t("q8_text")}</p>
          </section>
        </div>
      </article>
    </main>
  );
}
