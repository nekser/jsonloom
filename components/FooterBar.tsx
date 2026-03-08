import Link from "next/link";
import { APP_ROUTES } from "@/src/navigation/routes";
import { SITE_NAME } from "@/src/seo/site";

export default function FooterBar() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50/50 px-4 py-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Quick links">
          <Link href={APP_ROUTES.home} className="hover:underline">Home</Link>
          <Link href={APP_ROUTES.docs} className="hover:underline">Docs</Link>
          <Link href="/docs/operations" className="hover:underline">Operations</Link>
          <Link href="/docs/codegen" className="hover:underline">Codegen</Link>
          <Link href="/docs/sharing" className="hover:underline">Sharing</Link>
          <Link href={APP_ROUTES.about} className="hover:underline">About</Link>
        </nav>
      </div>
    </footer>
  );
}
