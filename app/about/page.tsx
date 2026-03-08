import type { Metadata } from "next";
import { APP_ROUTES } from "@/src/navigation/routes";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/src/seo/site";

export const metadata: Metadata = {
  title: "About",
  description: "What JSONLoom does today and how to get in touch.",
  alternates: { canonical: APP_ROUTES.about },
  openGraph: {
    title: `About | ${SITE_NAME}`,
    description: "What JSONLoom does today and how to get in touch.",
    url: APP_ROUTES.about,
  },
  twitter: {
    card: "summary_large_image",
    title: `About | ${SITE_NAME}`,
    description: "What JSONLoom does today and how to get in touch.",
  },
};

export default function AboutPage() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl(APP_ROUTES.home),
  };

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <main className="container mx-auto px-6 py-10 max-w-4xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">About</h1>
          <p className="text-muted-foreground">
            JSONLoom is a browser-based workspace for building repeatable data transformations with
            composable pipeline steps.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">What It Supports</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Source format: JSON.</li>
            <li>Pipeline operations across object, array, string, math, control-flow, validation, and date categories.</li>
            <li>Live preview, intermediate state inspection, and operation-level error reporting.</li>
            <li>Pipeline sharing via encoded URL and import/export workflows.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-sm text-muted-foreground">
            Questions, feedback, or collaboration requests:
            {" "}
            <a className="underline" href="mailto:your.email@example.com">your.email@example.com</a>
          </p>
        </section>
      </main>
    </>
  );
}
