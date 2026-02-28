import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © {new Date().getFullYear()} Daily Management. All rights reserved.
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Developed for educational purposes only.
          </p>
        </div>
        <nav className="flex gap-6">
          <Link
            href="/privacy-policy"
            className="text-sm text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
