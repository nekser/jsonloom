import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { parseWithFormat, toISO } from "./dateUtils";

export type ParseDateConfig = {
  path: string;
  format: string;
  timezone?: string; // default UTC
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    format: { type: "string", minLength: 1 },
    timezone: { type: "string" },
  },
  required: ["path", "format"],
  additionalProperties: true,
});

function apply(input: any, cfg: ParseDateConfig): any {
  const cur = getByPath(input, cfg.path);
  const dt = parseWithFormat(cur, cfg.format, cfg.timezone || "utc");
  if (!dt) throw new Error(`ParseDate: invalid or mismatched format at '${cfg.path}'`);
  return setByPath(input, cfg.path, toISO(dt));
}

function validate(config: ParseDateConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid ParseDate config";
  const cur = getByPath(input, config.path);
  if (typeof cur !== "string" || !cur) return `Path '${config.path}' is not a non-empty string`;
}

const mod: OperationModule<ParseDateConfig> = {
  type: "ParseDate" as any,
  apply,
  validate,
  defaultConfig: { path: "", format: "YYYY-MM-DD", timezone: "utc" },
};

export default mod;
