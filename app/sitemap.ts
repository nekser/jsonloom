import type { MetadataRoute } from "next";
import { INDEXABLE_ROUTES } from "@/src/navigation/routes";
import { absoluteUrl } from "@/src/seo/site";

function getPriority(route: string): number {
  if (route === "/") return 1;
  if (route === "/docs") return 0.9;
  if (route.startsWith("/docs/")) return 0.8;
  if (route === "/about") return 0.6;
  return 0.5;
}

function getChangeFrequency(route: string): "daily" | "weekly" | "monthly" {
  if (route === "/") return "daily";
  if (route.startsWith("/docs")) return "weekly";
  return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return INDEXABLE_ROUTES.map((route) => ({
    url: absoluteUrl(route),
    lastModified,
    changeFrequency: getChangeFrequency(route),
    priority: getPriority(route),
  }));
}
