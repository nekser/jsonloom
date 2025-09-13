import YAML from "yaml";

export function exportYAML(value: any): string {
  try {
    return YAML.stringify(value);
  } catch {
    return "";
  }
}
