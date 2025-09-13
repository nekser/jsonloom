import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue, JSONObject } from "../types/json";

export type CaseMode = "lowercase" | "uppercase";
export type StringCaseConfig = {
  path: string;
  mode: CaseMode;
  coerceNonString?: boolean; // if true, toString() then apply; else leave unchanged
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    mode: { enum: ["lowercase", "uppercase"] },
    coerceNonString: { type: "boolean" },
  },
  required: ["path", "mode"],
  additionalProperties: true,
});

function convert(val: JSONValue, mode: CaseMode, coerce: boolean): JSONValue {
  const apply = (s: string) => (mode === "lowercase" ? s.toLowerCase() : s.toUpperCase());
  if (typeof val === "string") return apply(val);
  if (coerce) return apply(String(val));
  return val;
}

function mapTree(input: JSONValue, mode: CaseMode, coerce: boolean): JSONValue {
  if (typeof input === "string") return convert(input, mode, coerce);
  if (Array.isArray(input)) return input.map((v) => mapTree(v as JSONValue, mode, coerce)) as unknown as JSONValue;
  if (input && typeof input === "object") {
    const out: JSONObject = {};
    for (const [k, v] of Object.entries(input as JSONObject)) out[k] = mapTree(v as JSONValue, mode, coerce);
    return out as unknown as JSONValue;
  }
  return convert(input, mode, coerce);
}

function apply(input: JSONValue, cfg: StringCaseConfig): JSONValue {
  const cur = getByPath(input, cfg.path);
  const coerce = !!cfg.coerceNonString;
  if (typeof cur === "string") return setByPath(input, cfg.path, convert(cur, cfg.mode, coerce));
  if (Array.isArray(cur) || (cur && typeof cur === "object")) return setByPath(input, cfg.path, mapTree(cur as JSONValue, cfg.mode, coerce));
  return setByPath(input, cfg.path, convert(cur as JSONValue, cfg.mode, coerce));
}

function validate(config: StringCaseConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid StringCase config";
}

const mod: OperationModule<StringCaseConfig> = {
  type: "StringCase",
  apply,
  validate,
  defaultConfig: { path: "", mode: "lowercase", coerceNonString: false },
};

export default mod;
