import Ajv from "ajv";
import type { OperationModule } from "./types";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";
import type { JSONValue } from "../types/json";
import { getByPath } from "./utils";
import { writeResult } from "./writeResult";

export type RoundConfig = { path: string; precision?: number; writeResultTo?: string };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, precision: { type: "integer", minimum: 0 }, writeResultTo: { type: "string" } },
  required: ["path"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: RoundConfig): JSONValue {
  const p = cfg.precision ?? 0;
  const factor = Math.pow(10, p);
  const updated = applyNumberAtPath(input, cfg.path, (n) => Math.round(n * factor) / factor);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: (_o, r) => getByPath(r, cfg.path) as JSONValue });
}
function validate(cfg: RoundConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Round config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<RoundConfig> = { type: "Round", apply, validate, defaultConfig: { path: "", precision: 0, writeResultTo: undefined } };
export default mod;
