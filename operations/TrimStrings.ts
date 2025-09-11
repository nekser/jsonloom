import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";

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

function trimTree(input: any): any {
  if (typeof input === "string") return input.trim();
  if (Array.isArray(input)) return input.map((v) => trimTree(v));
  if (input && typeof input === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(input)) out[k] = trimTree(v);
    return out;
  }
  return input;
}

function apply(input: any, cfg: TrimStringsConfig): any {
  if (!cfg.path) return trimTree(input);
  const target = getByPath(input, cfg.path);
  if (typeof target === "string") return setByPath(input, cfg.path, target.trim());
  if (Array.isArray(target)) return setByPath(input, cfg.path, target.map((v) => (typeof v === "string" ? v.trim() : v)));
  if (target && typeof target === "object") return setByPath(input, cfg.path, trimTree(target));
  return input;
}

function validate(config: TrimStringsConfig, input: any): string | undefined {
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
