#!/usr/bin/env node

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function withProtocol(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function normalizeUrl(value) {
  if (!value) return undefined;
  try {
    return trimTrailingSlash(new URL(withProtocol(value)).toString());
  } catch {
    return undefined;
  }
}

function getSiteProperty() {
  const raw = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (!raw) return undefined;
  if (raw.startsWith("sc-domain:")) return raw;
  const normalized = normalizeUrl(raw);
  return normalized ? `${normalized}/` : undefined;
}

function getSitemapUrl(siteProperty) {
  const explicit = process.env.GOOGLE_SITEMAP_URL;
  if (explicit) return explicit;
  if (!siteProperty || siteProperty.startsWith("sc-domain:")) return undefined;
  return `${trimTrailingSlash(siteProperty)}/sitemap.xml`;
}

async function main() {
  const accessToken = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;
  const siteProperty = getSiteProperty();
  const sitemapUrl = getSitemapUrl(siteProperty);

  if (!accessToken || !siteProperty || !sitemapUrl) {
    console.log("[seo:submit-sitemap] skipped (missing GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN, site property, or sitemap url)");
    process.exit(0);
  }

  const endpoint =
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteProperty)}` +
    `/sitemaps/${encodeURIComponent(sitemapUrl)}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google sitemap submit failed (${res.status}): ${body || "no body"}`);
  }

  console.log(`[seo:submit-sitemap] submitted ${sitemapUrl} for ${siteProperty}`);
}

main().catch((err) => {
  console.error(`[seo:submit-sitemap] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
