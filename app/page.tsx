import type { Metadata } from "next";
import Link from "next/link";
import HomeWorkspace from "@/components/home/HomeWorkspace";
import JsonLd from "@/components/seo/JsonLd";
import { APP_ROUTES } from "@/src/navigation/routes";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/src/seo/site";

const HOME_TITLE = "JSON Transformer";
const HOME_DESCRIPTION =
  "Build repeatable JSON data pipelines in your browser with live preview, operation-level errors, and shareable links.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: APP_ROUTES.home },
  openGraph: {
    type: "website",
    title: `${HOME_TITLE} | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
    url: APP_ROUTES.home,
  },
  twitter: {
    card: "summary_large_image",
    title: `${HOME_TITLE} | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description: SITE_DESCRIPTION,
  url: absoluteUrl(APP_ROUTES.home),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <JsonLd data={softwareApplicationJsonLd} />
      <main className="h-[calc(100vh-3rem)] min-h-[480px]">
        <HomeWorkspace />
      </main>

      <section className="container mx-auto max-w-5xl px-6 py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Browser-Based JSON Transformer</h1>
          <p className="text-muted-foreground">
            Convert and reshape JSON with composable operations, live output, and reproducible share links.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3 text-sm">
          <article className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">Build Pipelines</h2>
            <p className="mt-2 text-muted-foreground">Compose object, array, string, math, control-flow, validation, and date operations.</p>
          </article>
          <article className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">Debug Fast</h2>
            <p className="mt-2 text-muted-foreground">See operation-level errors and inspect intermediate transformations as you edit configs.</p>
          </article>
          <article className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="font-semibold">Share Results</h2>
            <p className="mt-2 text-muted-foreground">Generate URL-safe links that preserve pipeline state and sample input for reproducible demos.</p>
          </article>
        </div>

        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href={APP_ROUTES.docs} className="underline underline-offset-4">Read Documentation</Link>
          <Link href={APP_ROUTES.about} className="underline underline-offset-4">About JSONLoom</Link>
        </nav>
      </section>
    </div>
  );
}
