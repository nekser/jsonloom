#!/usr/bin/env node

const DEFAULT_PATHS = ["/", "/docs", "/about"];
const DEFAULT_ENDPOINT = "https://api.indexnow.org/indexnow";

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function withProtocol(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function normalizeSiteUrl(value) {
  if (!value) return undefined;
  try {
    return trimTrailingSlash(new URL(withProtocol(value)).toString());
  } catch {
    return undefined;
  }
}

function parsePathList(raw) {
  if (!raw) return DEFAULT_PATHS;
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (value.startsWith("/") ? value : `/${value}`));
}

async function main() {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
  const key = process.env.INDEXNOW_KEY;
  const endpoint = process.env.INDEXNOW_ENDPOINT || DEFAULT_ENDPOINT;

  if (!siteUrl || !key) {
    console.log("[seo:indexnow] skipped (missing NEXT_PUBLIC_SITE_URL/SITE_URL or INDEXNOW_KEY)");
    process.exit(0);
  }

  const host = new URL(siteUrl).host;
  const paths = parsePathList(process.env.INDEXNOW_URLS);
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `${siteUrl}/${key}.txt`;
  const urlList = paths.map((path) => `${siteUrl}${path}`);

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IndexNow request failed (${res.status}): ${body || "no body"}`);
  }

  console.log(`[seo:indexnow] notified ${urlList.length} URLs for host ${host}`);
}

main().catch((err) => {
  console.error(`[seo:indexnow] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
