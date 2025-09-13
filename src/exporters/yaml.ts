import YAML from "yaml";

import type { JSONValue } from "../types/json";

export function exportYAML(value: JSONValue): string {
  try {
    return YAML.stringify(value);
  } catch {
    return "";
  }
}
