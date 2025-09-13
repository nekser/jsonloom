import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";

export type FilterByKeyConfig = { mode: "keep" | "remove"; keys: string[] };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    mode: { enum: ["keep", "remove"] },
    keys: { type: "array", items: { type: "string" } },
  },
  required: ["mode", "keys"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: FilterByKeyConfig): JSONValue {
  if (input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map((x) => apply(x, cfg));
  const out: Record<string, JSONValue> = {};
  const keySet = new Set(cfg.keys);
  for (const k of Object.keys(input)) {
    const keep = cfg.mode === "keep" ? keySet.has(k) : !keySet.has(k);
    if (keep) out[k] = apply((input as Record<string, JSONValue>)[k], cfg);
  }
  return out;
}

function validate(config: FilterByKeyConfig): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid FilterByKey config";
}

const mod: OperationModule<FilterByKeyConfig> = {
  type: "FilterByKey",
  apply,
  validate,
  defaultConfig: { mode: "keep", keys: [] },
};

export default mod;
