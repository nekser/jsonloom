import type { Metadata } from "next";
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
    </div>
  );
}
