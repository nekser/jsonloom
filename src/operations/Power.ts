import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";

export type PowerConfig = { path: string; value: number };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: PowerConfig): JSONValue {
  return applyNumberAtPath(input, cfg.path, (n) => Math.pow(n, cfg.value));
}
function validate(cfg: PowerConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Power config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<PowerConfig> = { type: "Power", apply, validate, defaultConfig: { path: "", value: 2 } };
export default mod;
