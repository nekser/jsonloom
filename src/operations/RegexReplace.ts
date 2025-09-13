import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue, JSONObject } from "../types/json";

export type RegexReplaceConfig = {
  path?: string; // optional — if omitted, apply globally
  pattern: string;
  replace: string;
  flags?: string; // e.g., "g", "i", "gi"
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string" },
    pattern: { type: "string" },
    replace: { type: "string" },
    flags: { type: "string" },
  },
  required: ["pattern", "replace"],
  additionalProperties: true,
});

function tryBuildRegex(pattern: string, flags?: string): RegExp | string {
  try {
    return new RegExp(pattern, flags);
  } catch (e: unknown) {
    return (e as { message?: string })?.message || "Invalid regex";
  }
}

function replaceInTree(input: JSONValue, re: RegExp, replacement: string): JSONValue {
  if (typeof input === "string") return input.replace(re, replacement);
  if (Array.isArray(input)) return input.map((v) => replaceInTree(v as JSONValue, re, replacement)) as unknown as JSONValue;
  if (input && typeof input === "object") {
    const out: JSONObject = {};
    for (const [k, v] of Object.entries(input as JSONObject)) out[k] = replaceInTree(v as JSONValue, re, replacement);
    return out as unknown as JSONValue;
  }
  return input;
}

function apply(input: JSONValue, cfg: RegexReplaceConfig): JSONValue {
  if (!cfg.pattern) return input;
  const built = tryBuildRegex(cfg.pattern, cfg.flags);
  if (!(built instanceof RegExp)) return input; // validation handles errors
  const re = built;
  if (!cfg.path) return replaceInTree(input, re, cfg.replace ?? "");
  const target = getByPath(input, cfg.path);
  if (typeof target === "string") return setByPath(input, cfg.path, target.replace(re, cfg.replace ?? ""));
  if (Array.isArray(target)) return setByPath(input, cfg.path, target.map((v) => (typeof v === "string" ? v.replace(re, cfg.replace ?? "") : (v as JSONValue))));
  if (target && typeof target === "object") return setByPath(input, cfg.path, replaceInTree(target as JSONValue, re, cfg.replace ?? ""));
  return input;
}

function validate(config: RegexReplaceConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid RegexReplace config";
  // ensure flags contain only valid ones
  if (config.flags && /[^gimsuy]/.test(config.flags)) return `Invalid regex flags '${config.flags}'`;
  const built = tryBuildRegex(config.pattern, config.flags);
  if (!(built instanceof RegExp)) return String(built);
}

const mod: OperationModule<RegexReplaceConfig> = {
  type: "RegexReplace",
  apply,
  validate,
  defaultConfig: { pattern: "", replace: "", flags: "g" },
};

export default mod;
