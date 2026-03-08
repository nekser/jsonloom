import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/seo/site";

function shouldBlockTrainingBots(): boolean {
  const value = process.env.BLOCK_AI_TRAINING_BOTS;
  return value === "1" || value === "true";
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const host = new URL(siteUrl).host;

  const rules: NonNullable<MetadataRoute.Robots["rules"]> = [
    { userAgent: "*", allow: "/" },
    { userAgent: "OAI-SearchBot", allow: "/" },
    { userAgent: "ChatGPT-User", allow: "/" },
    { userAgent: "Claude-SearchBot", allow: "/" },
    { userAgent: "PerplexityBot", allow: "/" },
  ];

  if (shouldBlockTrainingBots()) {
    rules.push(
      { userAgent: "GPTBot", disallow: "/" },
      { userAgent: "ClaudeBot", disallow: "/" },
    );
  }

  return {
    rules,
    host,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
