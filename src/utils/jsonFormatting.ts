import { importJSON } from "@/src/importers/json";

export const SOURCE_MAX_BYTES = 5 * 1024 * 1024;

export type JsonFormatMode = "pretty" | "minified";

export type FormatJsonTextResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export function formatJsonText(text: string, mode: JsonFormatMode): FormatJsonTextResult {
  const parsed = importJSON(text);
  if (parsed.error) return { ok: false, error: parsed.error };

  try {
    const next = mode === "pretty" ? JSON.stringify(parsed.value, null, 2) : JSON.stringify(parsed.value);
    return { ok: true, text: next };
  } catch {
    return { ok: false, error: "Failed to format JSON" };
  }
}

export function getTextByteSize(text: string): number {
  return new TextEncoder().encode(text).length;
}

export function isTextWithinByteLimit(text: string, maxBytes = SOURCE_MAX_BYTES): boolean {
  return getTextByteSize(text) <= maxBytes;
}
