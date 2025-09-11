import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { flattenDepth } from "./arrayUtils";

export type FlattenArrayConfig = {
  path: string;
  depth?: number | "infinity";
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    depth: { anyOf: [{ type: "number", minimum: 0 }, { const: "infinity" }] },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: any, cfg: FlattenArrayConfig): any {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const depth = cfg.depth === "infinity" ? Infinity : (cfg.depth ?? 1);
  const out = flattenDepth(arr, depth);
  return setByPath(input, cfg.path, out);
}

function validate(config: FlattenArrayConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid FlattenArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<FlattenArrayConfig> = {
  type: "FlattenArray",
  apply,
  validate,
  defaultConfig: { path: "", depth: 1 },
};

export default mod;
