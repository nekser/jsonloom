import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue } from "../types/json";
import { writeResult } from "./writeResult";

export type SumConfig = { path: string; writeResultTo?: string };
const ajv = new Ajv();
const schema = ajv.compile({ type: "object", properties: { path: { type: "string", minLength: 1 }, writeResultTo: { type: "string" } }, required: ["path"], additionalProperties: false });

function apply(input: JSONValue, cfg: SumConfig): JSONValue {
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v)) return input; // validation will catch
  const arr = v as JSONValue[];
  const sum = arr.reduce<number>((acc, el) => acc + (typeof el === "number" ? (el as number) : 0), 0);
  const mutated = setByPath(input, cfg.path, sum);
  return writeResult(input, mutated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => sum as unknown as JSONValue });
}
function validate(cfg: SumConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Sum config";
  const v = getByPath(input, cfg.path);
  if (!Array.isArray(v)) return `Path '${cfg.path}' must be an array`;
}

const mod: OperationModule<SumConfig> = { type: "Sum", apply, validate, defaultConfig: { path: "", writeResultTo: undefined } };
export default mod;
