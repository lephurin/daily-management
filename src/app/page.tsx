import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";

export default function Home() {
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
          Daily Management
        </h1>
        <p className="mb-10 max-w-lg text-center text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Enterprise-grade Productivity Platform integrating Jira, Calendar,
          Daily Notes, and AI Reporting.
        </p>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Get Started
        </Link>
      </main>

      <Footer />
    </div>
  );
}
