import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Daily Management",
  description:
    "Privacy Policy and PDPA compliance information for Daily Management platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <article className="w-full max-w-3xl rounded-xl border bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 sm:p-12">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Privacy Policy
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Last updated: March 1, 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              1. Information We Collect
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Account information:</strong> Name, email address, and
                profile picture from your Google Account.
              </li>
              <li>
                <strong>Usage data:</strong> Daily notes, dashboard
                configurations, and application preferences.
              </li>
              <li>
                <strong>Third-party service data:</strong> Jira tasks and
                Calendar events (when you choose to connect these services).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>To provide dashboard features and application services.</li>
              <li>To generate AI-powered summaries and reports.</li>
              <li>To export data in various formats (e.g., Excel).</li>
              <li>
                To improve and personalize your experience on the platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              3. Data Protection
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Data is stored on Supabase with encryption at rest and in
                transit.
              </li>
              <li>
                Row-Level Security (RLS) is enforced to ensure users can only
                access their own data.
              </li>
              <li>
                External service tokens are encrypted before storage and are
                never shared.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              4. Data Sharing
            </h2>
            <p>
              We do not sell, trade, or share your personal information with
              third parties. Your data is only used to provide the services
              described above. We may share data only if required by law.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              5. Your Rights
            </h2>
            <p className="mb-2">
              Under the Personal Data Protection Act (PDPA) and applicable data
              protection laws, you have the right to:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Access your personal data.</li>
              <li>Request correction of your personal data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Withdraw your consent at any time.</li>
              <li>Request data portability.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              6. Cookies and Tracking
            </h2>
            <p>
              We use essential cookies to maintain your session and
              authentication state. We do not use advertising or third-party
              tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make
              significant changes, we will notify you through the application.
              Continued use of the service after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              8. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us through the in-app support system or email us at{" "}
              <a
                href="mailto:le.phurin@gmail.com"
                className="font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
              >
                le.phurin@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
