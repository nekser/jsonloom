const DEFAULT_LOCAL_SITE_URL = "http://localhost:3000";
const DEFAULT_CONTACT_EMAIL = "your.email@example.com";

export const SITE_NAME = "JSONLoom";
export const SITE_DESCRIPTION =
  "Visual JSON transformation workspace with composable operation pipelines.";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function withProtocolIfNeeded(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function normalizeSiteUrl(value: string | undefined): string {
  if (!value) return DEFAULT_LOCAL_SITE_URL;
  const candidate = withProtocolIfNeeded(value.trim());
  try {
    const parsed = new URL(candidate);
    return trimTrailingSlash(parsed.toString());
  } catch {
    return DEFAULT_LOCAL_SITE_URL;
  }
}

export function getSiteUrl(): string {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const vercelUrl = process.env.VERCEL_URL;
  return normalizeSiteUrl(envSiteUrl || vercelUrl);
}

export function getSiteOrigin(): URL {
  return new URL(getSiteUrl());
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function getContactEmail(): string {
  const configured = process.env.NEXT_PUBLIC_CONTACT_EMAIL || process.env.CONTACT_EMAIL;
  const normalized = configured?.trim();
  return normalized || DEFAULT_CONTACT_EMAIL;
}
