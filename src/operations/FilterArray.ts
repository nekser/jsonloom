import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { evaluatePredicate, type Operator } from "./predicateUtils";
import type { JSONValue } from "../types/json";

export type FilterArrayConfig = {
  path: string; // path to array
  key?: string; // key within item (if object)
  operator: Operator;
  value: JSONValue;
  mode?: "keep" | "remove"; // keep matches or remove matches
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    key: { type: "string" },
    operator: { enum: ["eq", "neq", "gt", "lt", "in", "contains"] },
    value: {},
    mode: { enum: ["keep", "remove"] },
  },
  required: ["path", "operator"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: FilterArrayConfig): JSONValue {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const keep = (item: JSONValue) => evaluatePredicate(item, cfg.key ?? "", cfg.operator, cfg.value);
  const filtered = (cfg.mode ?? "keep") === "keep" ? arr.filter(keep) : arr.filter((x) => !keep(x));
  return setByPath(input, cfg.path, filtered);
}

function validate(config: FilterArrayConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid FilterArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<FilterArrayConfig> = {
  type: "FilterArray",
  apply,
  validate,
  defaultConfig: { path: "", operator: "eq", value: "", mode: "keep" },
};

export default mod;
