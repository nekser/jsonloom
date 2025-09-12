import YAML from "yaml";

export function importYAML(text: string): { value?: any; error?: string } {
  try {
    const v = text.trim() === "" ? null : YAML.parse(text);
    return { value: v };
  } catch (e: any) {
    return { error: e?.message ?? "Invalid YAML" };
  }
}
