import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { getByPath, setByPath } from "./utils";
import { writeResult } from "./writeResult";

export type MaxConfig = { path: string; writeResultTo?: string };
const ajv = new Ajv();
const schema = ajv.compile({ type: "object", properties: { path: { type: "string", minLength: 1 }, writeResultTo: { type: "string" } }, required: ["path"], additionalProperties: false });

function apply(input: JSONValue, cfg: MaxConfig): JSONValue {
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v) || v.length === 0) {
    const mutated = setByPath(input, cfg.path, null);
    return writeResult(input, mutated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => null as unknown as JSONValue });
  }
  const nums = (v as JSONValue[]).filter((x: JSONValue) => typeof x === "number") as number[];
  const max = nums.length ? Math.max(...nums) : null;
  const mutated = setByPath(input, cfg.path, max as JSONValue);
  return writeResult(input, mutated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => max as unknown as JSONValue });
}
function validate(cfg: MaxConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Max config";
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v)) return `Path '${cfg.path}' must be an array`;
}

const mod: OperationModule<MaxConfig> = { type: "Max", apply, validate, defaultConfig: { path: "", writeResultTo: undefined } };
export default mod;
