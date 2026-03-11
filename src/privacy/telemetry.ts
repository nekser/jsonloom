const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const INTERNAL_SHARE_KEYS = new Set(["data", "pipeline"]);
const FALLBACK_BASE = "https://jsonloom.local";

function toSafeUrl(rawUrl: string): URL | null {
  try {
    if (ABSOLUTE_URL_PATTERN.test(rawUrl)) {
      return new URL(rawUrl);
    }
    if (rawUrl.startsWith("/")) {
      return new URL(rawUrl, FALLBACK_BASE);
    }
    return new URL(`/${rawUrl}`, FALLBACK_BASE);
  } catch {
    return null;
  }
}

export function sanitizeTelemetryUrl(rawUrl: string): string | null {
  const parsed = toSafeUrl(rawUrl);
  if (!parsed) return null;

  const shouldReturnRelative = !ABSOLUTE_URL_PATTERN.test(rawUrl);
  parsed.search = "";
  parsed.hash = "";
  if (shouldReturnRelative) return parsed.pathname;
  return `${parsed.origin}${parsed.pathname}`;
}

export function containsInternalShareParams(rawUrl: string): boolean {
  const parsed = toSafeUrl(rawUrl);
  if (!parsed) return false;
  for (const key of INTERNAL_SHARE_KEYS) {
    if (parsed.searchParams.has(key)) return true;
  }
  return false;
}

export function sanitizeTelemetryEvent<T extends { url: string }>(event: T): T | null {
  const sanitizedUrl = sanitizeTelemetryUrl(event.url);
  if (!sanitizedUrl) return null;
  return { ...event, url: sanitizedUrl };
}

