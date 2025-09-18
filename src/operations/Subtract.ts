import Ajv from "ajv";
import type { OperationModule } from "./types";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";
import type { JSONValue } from "../types/json";
import { getByPath } from "./utils";
import { writeResult } from "./writeResult";

export type SubtractConfig = { path: string; value: number; writeResultTo?: string };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" }, writeResultTo: { type: "string" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: SubtractConfig): JSONValue {
  const updated = applyNumberAtPath(input, cfg.path, (n) => n - cfg.value);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: (_o, r) => getByPath(r, cfg.path) as JSONValue });
}
function validate(cfg: SubtractConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Subtract config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<SubtractConfig> = { type: "Subtract", apply, validate, defaultConfig: { path: "", value: 0, writeResultTo: undefined } };
export default mod;
