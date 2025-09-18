import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath } from "./utils";
import type { JSONValue } from "../types/json";
import { writeResult } from "./writeResult";

export type ExtractPathConfig = { path: string; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 }, writeResultTo: { type: "string" } },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: ExtractPathConfig): JSONValue {
  const val = getByPath(input, cfg.path);
  if (!cfg.writeResultTo) return val;
  return writeResult(input, input, { writeResultTo: cfg.writeResultTo, valueExtractor: () => val as JSONValue });
}

function validate(config: ExtractPathConfig): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid ExtractPath config";
}

const mod: OperationModule<ExtractPathConfig> = { type: "ExtractPath", apply, validate, defaultConfig: { path: "", writeResultTo: undefined } };

export default mod;
