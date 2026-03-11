import type { Metadata } from "next";
import { APP_ROUTES } from "@/src/navigation/routes";
import { getContactEmail, SITE_NAME } from "@/src/seo/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How JSONLoom handles analytics, storage, and privacy controls.",
  alternates: { canonical: APP_ROUTES.privacy },
};

export default function PrivacyPage() {
  const contactEmail = getContactEmail();

  return (
    <main className="container mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold">Privacy</h1>
        <p className="text-sm text-muted-foreground">
          This page explains what {SITE_NAME} collects and how to control optional analytics.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Data We Use</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Necessary browser storage for app behavior (for example, theme and reliability guards).</li>
          <li>Optional analytics/performance telemetry only after your consent.</li>
          <li>No ad-tech or cross-site retargeting trackers by default.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Sensitive Query Parameters</h2>
        <p className="text-sm text-muted-foreground">
          Share links can contain encoded pipeline/source payloads. We sanitize telemetry URLs to avoid sending
          those query values to analytics services.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-sm text-muted-foreground">
          Privacy questions:{" "}
          <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
        </p>
      </section>
    </main>
  );
}

