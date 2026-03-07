import { asConfigObject, mergeConfigPatch, type ConfigPatch } from "@/src/operations/configPatch";

export type { ConfigPatch } from "@/src/operations/configPatch";
export { asConfigObject };

export function mergeConfig(baseConfig: unknown, patch: ConfigPatch) {
  return mergeConfigPatch(baseConfig, patch);
}

export function clearConfigKey(baseConfig: unknown, key: string) {
  return mergeConfigPatch(baseConfig, { [key]: undefined });
}

export function getStringConfig(baseConfig: unknown, key: string): string {
  const value = asConfigObject(baseConfig)[key];
  return typeof value === "string" ? value : "";
}
