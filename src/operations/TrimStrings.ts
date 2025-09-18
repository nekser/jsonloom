import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue, JSONObject } from "../types/json";
import { writeResult } from "./writeResult";

export type TrimStringsConfig = { path?: string; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string" },
    writeResultTo: { type: "string" },
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
  if (!cfg.path) {
    const outAll = trimTree(input);
    return writeResult(input, outAll, { writeResultTo: cfg.writeResultTo, valueExtractor: () => outAll });
  }
  const target = getByPath(input, cfg.path);
  if (typeof target === "string") {
    const out = target.trim() as JSONValue;
    const updated = setByPath(input, cfg.path, out);
    return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
  }
  if (Array.isArray(target)) {
    const out = target.map((v) => (typeof v === "string" ? v.trim() : (v as JSONValue))) as JSONValue;
    const updated = setByPath(input, cfg.path, out);
    return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
  }
  if (target && typeof target === "object") {
    const out = trimTree(target as JSONValue);
    const updated = setByPath(input, cfg.path, out);
    return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
  }
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
  defaultConfig: { writeResultTo: undefined },
};

export default mod;
