import Ajv from "ajv";
import type { OperationModule } from "./types";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";

export type RoundConfig = { path: string; precision?: number };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, precision: { type: "integer", minimum: 0 } },
  required: ["path"],
  additionalProperties: false,
});

function apply(input: any, cfg: RoundConfig): any {
  const p = cfg.precision ?? 0;
  const factor = Math.pow(10, p);
  return applyNumberAtPath(input, cfg.path, (n) => Math.round(n * factor) / factor);
}
function validate(cfg: RoundConfig, input: any): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Round config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<RoundConfig> = { type: "Round" as any, apply, validate, defaultConfig: { path: "", precision: 0 } };
export default mod;
