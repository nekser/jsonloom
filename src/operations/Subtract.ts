import Ajv from "ajv";
import type { OperationModule } from "./types";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";
import type { JSONValue } from "../types/json";

export type SubtractConfig = { path: string; value: number };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: SubtractConfig): JSONValue {
  return applyNumberAtPath(input, cfg.path, (n) => n - cfg.value);
}
function validate(cfg: SubtractConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Subtract config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<SubtractConfig> = { type: "Subtract", apply, validate, defaultConfig: { path: "", value: 0 } };
export default mod;
