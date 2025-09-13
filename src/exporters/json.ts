import type { JSONValue } from "../types/json";

export function exportJSON(value: JSONValue): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}
