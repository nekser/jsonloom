import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { applyNumberAtPath, validateNumberPath } from "./numericUtils";
import { getByPath } from "./utils";
import { writeResult } from "./writeResult";

export type AddConfig = { path: string; value: number; writeResultTo?: string };
const ajv = new Ajv();
const schema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, value: { type: "number" }, writeResultTo: { type: "string" } },
  required: ["path", "value"],
  additionalProperties: false,
});

function apply(input: JSONValue, cfg: AddConfig): JSONValue {
  const before = getByPath(input, cfg.path);
  const updatedRoot = applyNumberAtPath(input, cfg.path, (n) => n + cfg.value);
  // If redirecting, extract the new numeric value at original path from updatedRoot and write to target path on ORIGINAL input
  return writeResult(input, updatedRoot, {
    writeResultTo: cfg.writeResultTo,
    valueExtractor: (_orig, resultRoot) => getByPath(resultRoot, cfg.path) as JSONValue,
  });
}
function validate(cfg: AddConfig, input: JSONValue): string | undefined {
  const ok = schema(cfg);
  if (!ok) return schema.errors?.[0]?.message || "Invalid Add config";
  return validateNumberPath(input, cfg.path);
}

const mod: OperationModule<AddConfig> = { type: "Add", apply, validate, defaultConfig: { path: "", value: 0, writeResultTo: undefined } };
export default mod;
