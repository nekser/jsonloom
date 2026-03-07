import type { JSONObject } from "@/src/types/json";

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function mergeConfig(baseConfig: unknown, patch: Record<string, unknown>): JSONObject {
  const base = asRecord(baseConfig);
  return { ...base, ...patch } as unknown as JSONObject;
}

export function clearConfigKey(baseConfig: unknown, key: string): JSONObject {
  const next = { ...asRecord(baseConfig) };
  next[key] = undefined;
  return next as unknown as JSONObject;
}

export function getStringConfig(baseConfig: unknown, key: string): string {
  const value = asRecord(baseConfig)[key];
  return typeof value === "string" ? value : "";
}
