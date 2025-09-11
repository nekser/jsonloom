import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { flattenObject } from "./objectUtils";

export type FlattenObjectConfig = {
  path: string;
  delimiter?: string;
  maxDepth?: number;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    delimiter: { type: "string" },
    maxDepth: { type: "number", minimum: 0 },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: any, cfg: FlattenObjectConfig): any {
  const cur = getByPath(input, cfg.path);
  if (!(cur && typeof cur === "object" && !Array.isArray(cur))) return input;
  const flat = flattenObject(cur, cfg.delimiter ?? ".", cfg.maxDepth);
  return setByPath(input, cfg.path, flat);
}

function validate(config: FlattenObjectConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid FlattenObject config";
  const cur = getByPath(input, config.path);
  if (!(cur && typeof cur === "object" && !Array.isArray(cur))) return `Path '${config.path}' is not an object`;
}

const mod: OperationModule<FlattenObjectConfig> = {
  type: "FlattenObject" as any,
  apply,
  validate,
  defaultConfig: { path: "", delimiter: "." },
};

export default mod;
