import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";

export type CountConfig = { path: string };
const ajv = new Ajv();
const schema = ajv.compile({ type: "object", properties: { path: { type: "string", minLength: 1 } }, required: ["path"], additionalProperties: false });

function apply(input: any, cfg: CountConfig): any {
  const v = getByPath(input, cfg.path);
  const count = Array.isArray(v) ? v.length : 0;
  return setByPath(input, cfg.path, count);
}
function validate(cfg: CountConfig, input: any): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Count config";
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v)) return `Path '${cfg.path}' must be an array`;
}

const mod: OperationModule<CountConfig> = { type: "Count" as any, apply, validate, defaultConfig: { path: "" } };
export default mod;
