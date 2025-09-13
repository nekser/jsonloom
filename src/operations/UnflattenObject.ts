import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { unflattenObject } from "./objectUtils";
import type { JSONValue } from "../types/json";

export type UnflattenObjectConfig = {
  path: string;
  delimiter?: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    delimiter: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: UnflattenObjectConfig): JSONValue {
  const cur = getByPath(input, cfg.path);
  if (!(cur && typeof cur === "object" && !Array.isArray(cur))) return input;
  const expanded = unflattenObject(cur as Record<string, JSONValue>, cfg.delimiter ?? ".");
  return setByPath(input, cfg.path, expanded);
}

function validate(config: UnflattenObjectConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid UnflattenObject config";
  const cur = getByPath(input, config.path);
  if (!(cur && typeof cur === "object" && !Array.isArray(cur))) return `Path '${config.path}' is not an object`;
}

const mod: OperationModule<UnflattenObjectConfig> = {
  type: "UnflattenObject",
  apply,
  validate,
  defaultConfig: { path: "", delimiter: "." },
};

export default mod;
