import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { getByPath, setByPath } from "./utils";

export type MinConfig = { path: string };
const ajv = new Ajv();
const schema = ajv.compile({ type: "object", properties: { path: { type: "string", minLength: 1 } }, required: ["path"], additionalProperties: false });

function apply(input: JSONValue, cfg: MinConfig): JSONValue {
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v) || v.length === 0) return setByPath(input, cfg.path, null);
  const nums = v.filter((x: JSONValue) => typeof x === "number");
  const min = nums.length ? Math.min(...nums) : null;
  return setByPath(input, cfg.path, min);
}
function validate(cfg: MinConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Min config";
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v)) return `Path '${cfg.path}' must be an array`;
}

const mod: OperationModule<MinConfig> = { type: "Min", apply, validate, defaultConfig: { path: "" } };
export default mod;
