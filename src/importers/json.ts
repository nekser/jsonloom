import type { JSONValue } from "../types/json";

export function importJSON(text: string): { value?: JSONValue; error?: string } {
  try {
    return { value: text.trim() === "" ? null : JSON.parse(text) };
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "Invalid JSON" };
  }
}
