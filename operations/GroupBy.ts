import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { groupBy, aggregateGroups, type CollectMode } from "./groupUtils";

export type GroupByConfig = {
  path: string; // path to array
  by: string; // key to group by
  collect?: CollectMode; // array | count | sum
  sumPath?: string; // when collect=sum, which key to sum
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    by: { type: "string", minLength: 1 },
    collect: { enum: ["array", "count", "sum"] },
    sumPath: { type: "string" },
  },
  required: ["path", "by"],
  additionalProperties: true,
});

function apply(input: any, cfg: GroupByConfig): any {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const groups = groupBy(arr, cfg.by);
  const out = aggregateGroups(groups, cfg.collect ?? "array", cfg.sumPath);
  return setByPath(input, cfg.path, out);
}

function validate(config: GroupByConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid GroupBy config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<GroupByConfig> = {
  type: "GroupBy",
  apply,
  validate,
  defaultConfig: { path: "", by: "", collect: "array" },
};

export default mod;
