import Ajv from "ajv";
import type { OperationModule } from "./types";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";

export type PowerConfig = { path: string; value: number };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: any, cfg: PowerConfig): any {
  return applyNumberAtPath(input, cfg.path, (n) => Math.pow(n, cfg.value));
}
function validate(cfg: PowerConfig, input: any): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Power config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<PowerConfig> = { type: "Power" as any, apply, validate, defaultConfig: { path: "", value: 2 } };
export default mod;
