import Ajv from "ajv";
import type { OperationModule } from "./types";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";
import type { JSONValue } from "../types/json";

export type ClampConfig = { path: string; min: number; max: number };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, min: { type: "number" }, max: { type: "number" } },
  required: ["path", "min", "max"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: ClampConfig): JSONValue {
  return applyNumberAtPath(input, cfg.path, (n) => Math.min(cfg.max, Math.max(cfg.min, n)));
}
function validate(cfg: ClampConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Clamp config";
  if (cfg.min > cfg.max) return "min must be <= max";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<ClampConfig> = { type: "Clamp", apply, validate, defaultConfig: { path: "", min: 0, max: 1 } };
export default mod;
