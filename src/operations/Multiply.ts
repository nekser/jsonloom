import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";
import { getByPath } from "./utils";
import { writeResult } from "./writeResult";

export type MultiplyConfig = { path: string; value: number; writeResultTo?: string };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" }, writeResultTo: { type: "string" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: MultiplyConfig): JSONValue {
  const updatedRoot = applyNumberAtPath(input, cfg.path, (n) => n * cfg.value);
  return writeResult(input, updatedRoot, {
    writeResultTo: cfg.writeResultTo,
    valueExtractor: (_orig, resultRoot) => getByPath(resultRoot, cfg.path) as JSONValue,
  });
}
function validate(cfg: MultiplyConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Multiply config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<MultiplyConfig> = { type: "Multiply", apply, validate, defaultConfig: { path: "", value: 1, writeResultTo: undefined } };
export default mod;
