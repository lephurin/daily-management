import { PdpaConsentForm } from "@/features/auth/components/pdpa-consent-form";

export default function ConsentPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <PdpaConsentForm />
    </main>
  );
}
