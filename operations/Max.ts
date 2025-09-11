import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";

export type MaxConfig = { path: string };
const ajv = new Ajv();
const schema = ajv.compile({ type: "object", properties: { path: { type: "string", minLength: 1 } }, required: ["path"], additionalProperties: false });

function apply(input: any, cfg: MaxConfig): any {
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v) || v.length === 0) return setByPath(input, cfg.path, null);
  const nums = v.filter((x: any) => typeof x === "number");
  const max = nums.length ? Math.max(...nums) : null;
  return setByPath(input, cfg.path, max);
}
function validate(cfg: MaxConfig, input: any): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Max config";
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v)) return `Path '${cfg.path}' must be an array`;
}

const mod: OperationModule<MaxConfig> = { type: "Max" as any, apply, validate, defaultConfig: { path: "" } };
export default mod;
