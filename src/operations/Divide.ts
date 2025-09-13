import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";

export type DivideConfig = { path: string; value: number };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: DivideConfig): JSONValue {
  return applyNumberAtPath(input, cfg.path, (n) => n / cfg.value);
}
function validate(cfg: DivideConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Divide config";
  if (cfg.value === 0) return "Division by zero";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<DivideConfig> = { type: "Divide", apply, validate, defaultConfig: { path: "", value: 1 } };
export default mod;
