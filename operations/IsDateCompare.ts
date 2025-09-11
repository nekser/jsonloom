import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath } from "./utils";
import { compareDates, parseDateString } from "./dateUtils";

export type DateCompareOp = "after" | "afterOrEqual" | "before" | "beforeOrEqual";
export type CompareTo = string | { path: string };
export type IsDateCompareConfig = {
  path: string;
  compareTo: CompareTo;
  op: DateCompareOp;
  resultPath?: string; // if provided, write boolean result at this path and return the modified input
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    compareTo: {
      anyOf: [
        { type: "string", minLength: 1 },
        {
          type: "object",
          properties: { path: { type: "string", minLength: 1 } },
          required: ["path"],
          additionalProperties: false,
        },
      ],
    },
  op: { enum: ["after", "afterOrEqual", "before", "beforeOrEqual"] },
  resultPath: { type: "string" },
  },
  required: ["path", "compareTo", "op"],
  additionalProperties: true,
});

function apply(input: any, cfg: IsDateCompareConfig): any {
  const a = getByPath(input, cfg.path);
  const b = typeof cfg.compareTo === "string" ? cfg.compareTo : getByPath(input, cfg.compareTo.path);
  const res = compareDates(a, b, cfg.op);
  if (res == null) throw new Error("IsDateCompare: invalid date(s)");
  if (cfg.resultPath && cfg.resultPath.length > 0) {
    // Write result at provided path relative to current input
    const { setByPath } = require("./utils");
    return setByPath(input, cfg.resultPath, res);
  }
  return res; // returns boolean usable by If/FilterArray directly
}

function validate(config: IsDateCompareConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid IsDateCompare config";
  const a = getByPath(input, config.path);
  const b = typeof config.compareTo === "string" ? config.compareTo : getByPath(input, config.compareTo.path);
  const da = parseDateString(a);
  const db = parseDateString(b);
  if (!da || !db) return "Invalid date(s)";
}

const mod: OperationModule<IsDateCompareConfig> = {
  type: "IsDateCompare" as any,
  apply,
  validate,
  defaultConfig: { path: "", compareTo: "", op: "after" },
};

export default mod;
