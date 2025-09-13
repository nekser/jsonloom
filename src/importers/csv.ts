import Papa from "papaparse";

import type { JSONValue } from "../types/json";

export function importCSV(text: string): { value?: JSONValue; error?: string } {
  try {
    const res = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (res.errors && res.errors.length) {
      const msg = res.errors[0]?.message || "CSV parse error";
      return { error: msg };
    }
    return { value: res.data as unknown as JSONValue };
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "Invalid CSV" };
  }
}
