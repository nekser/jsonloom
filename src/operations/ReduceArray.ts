import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { getByPath, setByPath } from "./utils";
import { reduceValues, type ReduceOp } from "./reduceUtils";

export type ReduceArrayConfig = {
  path: string; // path to array
  by?: string; // if provided and items are objects, pick this key
  op: ReduceOp; // sum | avg | min | max | concat
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    by: { type: "string" },
    op: { enum: ["sum", "avg", "min", "max", "concat"] },
  },
  required: ["path", "op"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: ReduceArrayConfig): JSONValue {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const values = cfg.by ? arr.map((it) => (it as Record<string, JSONValue>)?.[cfg.by!]) : arr;
  const out = reduceValues(values, cfg.op);
  return setByPath(input, cfg.path, out);
}

function validate(config: ReduceArrayConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid ReduceArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<ReduceArrayConfig> = {
  type: "ReduceArray",
  apply,
  validate,
  defaultConfig: { path: "", op: "sum" },
};

export default mod;
