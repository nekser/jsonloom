import YAML from "yaml";
import type { JSONValue } from "../types/json";

export function importYAML(text: string): { value?: JSONValue; error?: string } {
  try {
    const v = text.trim() === "" ? null : YAML.parse(text);
    return { value: v };
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "Invalid YAML" };
  }
}
