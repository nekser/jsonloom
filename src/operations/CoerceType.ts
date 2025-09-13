import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue } from "../types/json";

export type TargetType = "string" | "number" | "boolean" | "object" | "array";
export type CoerceTypeConfig = {
  path: string;
  to: TargetType;
  fallback?: JSONValue;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    to: { enum: ["string", "number", "boolean", "object", "array"] },
    fallback: {},
  },
  required: ["path", "to"],
  additionalProperties: true,
});

function tryCoerce(val: JSONValue, to: TargetType): { ok: true; value: JSONValue } | { ok: false } {
  try {
    switch (to) {
      case "string":
        return { ok: true, value: val == null ? "" : String(val) };
      case "number": {
        const n = typeof val === "number" ? val : Number(val);
        return Number.isFinite(n) ? { ok: true, value: n } : { ok: false };
      }
      case "boolean": {
        if (typeof val === "boolean") return { ok: true, value: val };
        if (typeof val === "number") return { ok: true, value: val !== 0 };
        if (typeof val === "string") {
          const s = val.trim().toLowerCase();
          if (["true", "1", "yes", "y"].includes(s)) return { ok: true, value: true };
          if (["false", "0", "no", "n"].includes(s)) return { ok: true, value: false };
          return { ok: true, value: s.length > 0 };
        }
        return { ok: true, value: !!val };
      }
      case "object": {
  if (val && typeof val === "object" && !Array.isArray(val)) return { ok: true, value: val };
        if (typeof val === "string") {
          const parsed = JSON.parse(val);
          return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? { ok: true, value: parsed } : { ok: false };
        }
        return { ok: false };
      }
      case "array": {
  if (Array.isArray(val)) return { ok: true, value: val };
        if (typeof val === "string") {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? { ok: true, value: parsed } : { ok: false };
        }
        return { ok: false };
      }
    }
  } catch {
    return { ok: false };
  }
}

function apply(input: JSONValue, cfg: CoerceTypeConfig): JSONValue {
  const current = getByPath(input, cfg.path);
  const res = tryCoerce(current, cfg.to);
  if (!res || !res.ok) {
    if (cfg.fallback !== undefined) return setByPath(input, cfg.path, cfg.fallback);
    return input; // validation stage will flag error if needed
  }
  return setByPath(input, cfg.path, res.value);
}

function validate(config: CoerceTypeConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid CoerceType config";
  const cur = getByPath(input, config.path);
  const res = tryCoerce(cur, config.to);
  if (!res || !res.ok) {
    if (config.fallback === undefined) return `Cannot coerce value at '${config.path}' to ${config.to}`;
  }
}

const mod: OperationModule<CoerceTypeConfig> = {
  type: "CoerceType",
  apply,
  validate,
  defaultConfig: { path: "", to: "string" },
};

export default mod;
