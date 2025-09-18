import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { getByPath, setByPath } from "./utils";
import { buildComparator, stableSort, type Order } from "./sortUtils";
import { writeResult } from "./writeResult";

export type SortArrayConfig = {
  path: string; // path to array
  by?: string; // key within item or undefined to sort primitives
  order?: Order;
  caseInsensitive?: boolean;
  nulls?: "first" | "last";
  writeResultTo?: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    by: { type: "string" },
    order: { enum: ["asc", "desc"] },
    caseInsensitive: { type: "boolean" },
    nulls: { enum: ["first", "last"] },
    writeResultTo: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: SortArrayConfig): JSONValue {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const cmp = buildComparator({ by: cfg.by, order: cfg.order, caseInsensitive: cfg.caseInsensitive, nulls: cfg.nulls });
  const sorted = stableSort(arr.slice(), cmp) as JSONValue;
  const updated = setByPath(input, cfg.path, sorted);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => sorted });
}

function validate(config: SortArrayConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid SortArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<SortArrayConfig> = {
  type: "SortArray",
  apply,
  validate,
  defaultConfig: { path: "", order: "asc", nulls: "last", caseInsensitive: false, writeResultTo: undefined },
};

export default mod;
