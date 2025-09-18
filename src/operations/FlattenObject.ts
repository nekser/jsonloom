import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { flattenObject } from "./objectUtils";
import { writeResult } from "./writeResult";
import type { JSONValue } from "../types/json";

export type FlattenObjectConfig = { path: string; delimiter?: string; maxDepth?: number; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    delimiter: { type: "string" },
    maxDepth: { type: "number", minimum: 0 },
    writeResultTo: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: FlattenObjectConfig): JSONValue {
  const cur = getByPath(input, cfg.path);
  if (!(cur && typeof cur === "object" && !Array.isArray(cur))) return input;
  const flat = flattenObject(cur, cfg.delimiter ?? ".", cfg.maxDepth) as JSONValue;
  const updated = setByPath(input, cfg.path, flat);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => flat });
}

function validate(config: FlattenObjectConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid FlattenObject config";
  const cur = getByPath(input, config.path);
  if (!(cur && typeof cur === "object" && !Array.isArray(cur))) return `Path '${config.path}' is not an object`;
}

const mod: OperationModule<FlattenObjectConfig> = {
  type: "FlattenObject",
  apply,
  validate,
  defaultConfig: { path: "", delimiter: ".", writeResultTo: undefined },
};

export default mod;
