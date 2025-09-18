import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { uniqueBy } from "./uniqueUtils";
import type { JSONValue } from "../types/json";
import { writeResult } from "./writeResult";

export type UniqueArrayConfig = {
  path: string;
  by?: string;
  writeResultTo?: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    by: { type: "string" },
    writeResultTo: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: UniqueArrayConfig): JSONValue {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const out = uniqueBy(arr, cfg.by) as JSONValue;
  const updated = setByPath(input, cfg.path, out);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
}

function validate(config: UniqueArrayConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid UniqueArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<UniqueArrayConfig> = {
  type: "UniqueArray",
  apply,
  validate,
  defaultConfig: { path: "", writeResultTo: undefined },
};

export default mod;
