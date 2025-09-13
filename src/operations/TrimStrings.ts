import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue, JSONObject } from "../types/json";

export type TrimStringsConfig = {
  path?: string; // if omitted, trim all strings recursively
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string" },
  },
  additionalProperties: true,
});

function trimTree(input: JSONValue): JSONValue {
  if (typeof input === "string") return input.trim();
  if (Array.isArray(input)) return input.map((v) => trimTree(v as JSONValue)) as unknown as JSONValue;
  if (input && typeof input === "object") {
    const out: JSONObject = {};
    for (const [k, v] of Object.entries(input as JSONObject)) out[k] = trimTree(v as JSONValue);
    return out as unknown as JSONValue;
  }
  return input;
}

function apply(input: JSONValue, cfg: TrimStringsConfig): JSONValue {
  if (!cfg.path) return trimTree(input);
  const target = getByPath(input, cfg.path);
  if (typeof target === "string") return setByPath(input, cfg.path, target.trim());
  if (Array.isArray(target)) return setByPath(input, cfg.path, target.map((v) => (typeof v === "string" ? v.trim() : (v as JSONValue))));
  if (target && typeof target === "object") return setByPath(input, cfg.path, trimTree(target as JSONValue));
  return input;
}

function validate(config: TrimStringsConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid TrimStrings config";
}

const mod: OperationModule<TrimStringsConfig> = {
  type: "TrimStrings",
  apply,
  validate,
  defaultConfig: {},
};

export default mod;
