import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { buildComparator, stableSort, type Order } from "./sortUtils";

export type SortArrayConfig = {
  path: string; // path to array
  by?: string; // key within item or undefined to sort primitives
  order?: Order;
  caseInsensitive?: boolean;
  nulls?: "first" | "last";
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
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: any, cfg: SortArrayConfig): any {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const cmp = buildComparator({ by: cfg.by, order: cfg.order, caseInsensitive: cfg.caseInsensitive, nulls: cfg.nulls });
  const sorted = stableSort(arr.slice(), cmp);
  return setByPath(input, cfg.path, sorted);
}

function validate(config: SortArrayConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid SortArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<SortArrayConfig> = {
  type: "SortArray",
  apply,
  validate,
  defaultConfig: { path: "", order: "asc", nulls: "last", caseInsensitive: false },
};

export default mod;
