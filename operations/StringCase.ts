import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";

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

function convert(val: any, mode: CaseMode, coerce: boolean): any {
  const apply = (s: string) => (mode === "lowercase" ? s.toLowerCase() : s.toUpperCase());
  if (typeof val === "string") return apply(val);
  if (coerce) return apply(String(val));
  return val;
}

function mapTree(input: any, mode: CaseMode, coerce: boolean): any {
  if (typeof input === "string") return convert(input, mode, coerce);
  if (Array.isArray(input)) return input.map((v) => mapTree(v, mode, coerce));
  if (input && typeof input === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(input)) out[k] = mapTree(v, mode, coerce);
    return out;
  }
  return convert(input, mode, coerce);
}

function apply(input: any, cfg: StringCaseConfig): any {
  const cur = getByPath(input, cfg.path);
  const coerce = !!cfg.coerceNonString;
  if (typeof cur === "string") return setByPath(input, cfg.path, convert(cur, cfg.mode, coerce));
  if (Array.isArray(cur) || (cur && typeof cur === "object")) return setByPath(input, cfg.path, mapTree(cur, cfg.mode, coerce));
  return setByPath(input, cfg.path, convert(cur, cfg.mode, coerce));
}

function validate(config: StringCaseConfig, input: any): string | undefined {
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
