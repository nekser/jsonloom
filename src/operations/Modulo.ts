import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";
import { getByPath } from "./utils";
import { writeResult } from "./writeResult";

export type ModuloConfig = { path: string; value: number; writeResultTo?: string };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" }, writeResultTo: { type: "string" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: ModuloConfig): JSONValue {
  const updated = applyNumberAtPath(input, cfg.path, (n) => n % cfg.value);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: (_o, r) => getByPath(r, cfg.path) as JSONValue });
}
function validate(cfg: ModuloConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Modulo config";
  if (cfg.value === 0) return "Modulo by zero";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<ModuloConfig> = { type: "Modulo", apply, validate, defaultConfig: { path: "", value: 1, writeResultTo: undefined } };
export default mod;
