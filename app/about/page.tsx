import type { Metadata } from "next";
import { APP_ROUTES } from "@/src/navigation/routes";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl, getContactEmail } from "@/src/seo/site";

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
  const contactEmail = getContactEmail();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: absoluteUrl(APP_ROUTES.home),
    email: contactEmail,
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
          <h2 className="text-2xl font-semibold">About the author</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>This project is my attempt to build something using harness engineering only.</li>
            <li>Although I verified the code myself, most of the work was intentionally done by different AI agents.</li>
            <li>The source code is free, and if you want, you can check it out on <a className="underline" href="https://github.com/nekser/jsonloom">GitHub</a></li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-sm text-muted-foreground">
            Questions, feedback, or collaboration requests:
            {" "}
            <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </p>
        </section>
      </main>
    </>
  );
}
