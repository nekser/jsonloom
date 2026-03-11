import type { Metadata } from "next";
import OpenPrivacySettingsButton from "@/components/privacy/OpenPrivacySettingsButton";
import { APP_ROUTES } from "@/src/navigation/routes";

export const metadata: Metadata = {
  title: "Cookies and Storage",
  description: "Cookie and browser storage categories used by JSONLoom.",
  alternates: { canonical: APP_ROUTES.cookies },
};

export default function CookiesPage() {
  return (
    <main className="container mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Cookies and Storage</h1>
        <p className="text-sm text-muted-foreground">
          JSONLoom uses strictly necessary browser storage and optional analytics storage when consent is granted.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Categories</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Strictly necessary: app reliability and interface preferences.</li>
          <li>Analytics (optional): aggregated usage and performance measurements.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Manage Your Choice</h2>
        <p className="text-sm text-muted-foreground">
          You can update your analytics choice at any time.
        </p>
        <OpenPrivacySettingsButton />
      </section>
    </main>
  );
}

