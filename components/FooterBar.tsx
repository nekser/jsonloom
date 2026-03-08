import Link from "next/link";
import { APP_ROUTES } from "@/src/navigation/routes";
import { SITE_NAME } from "@/src/seo/site";
import packageJson from "@/package.json";

const APP_BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || packageJson.version;

export default function FooterBar() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50/50 px-4 py-3 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Build {APP_BUILD_VERSION}.</div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Quick links">
          <Link href={APP_ROUTES.home} className="hover:underline">Application</Link>
          <Link href={APP_ROUTES.docs} className="hover:underline">Docs</Link>
          <Link href={APP_ROUTES.about} className="hover:underline">About</Link>
        </nav>
      </div>
    </footer>
  );
}
