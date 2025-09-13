import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { addToDate, type DateUnit } from "./dateUtils";

export type DateAddConfig = {
  path: string;
  amount: number;
  unit: DateUnit;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    amount: { type: "number" },
    unit: { enum: ["days", "hours", "minutes", "months", "years"] },
  },
  required: ["path", "amount", "unit"],
  additionalProperties: true,
});

function apply(input: any, cfg: DateAddConfig): any {
  const cur = getByPath(input, cfg.path);
  const iso = addToDate(cur, cfg.amount, cfg.unit);
  if (!iso) throw new Error(`DateAdd: invalid date at '${cfg.path}'`);
  return setByPath(input, cfg.path, iso);
}

function validate(config: DateAddConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid DateAdd config";
}

const mod: OperationModule<DateAddConfig> = {
  type: "DateAdd" as any,
  apply,
  validate,
  defaultConfig: { path: "", amount: 0, unit: "days" },
};

export default mod;
