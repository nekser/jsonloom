import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { diffBetween, type DateUnit, siblingPathWithSuffix } from "./dateUtils";

export type DateDiffConfig = {
  startPath: string;
  endPath: string;
  unit: DateUnit;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    startPath: { type: "string", minLength: 1 },
    endPath: { type: "string", minLength: 1 },
    unit: { enum: ["days", "hours", "minutes", "months", "years"] },
  },
  required: ["startPath", "endPath", "unit"],
  additionalProperties: true,
});

function apply(input: any, cfg: DateDiffConfig): any {
  const a = getByPath(input, cfg.startPath);
  const b = getByPath(input, cfg.endPath);
  const diff = diffBetween(a, b, cfg.unit);
  if (diff == null) throw new Error("DateDiff: invalid dates");
  const outPath = siblingPathWithSuffix(cfg.endPath, `_diff_${cfg.unit}`);
  return setByPath(input, outPath, diff);
}

function validate(config: DateDiffConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid DateDiff config";
}

const mod: OperationModule<DateDiffConfig> = {
  type: "DateDiff" as any,
  apply,
  validate,
  defaultConfig: { startPath: "", endPath: "", unit: "days" },
};

export default mod;
