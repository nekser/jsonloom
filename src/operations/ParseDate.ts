import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue } from "../types/json";
import { parseWithFormat, toISO } from "./dateUtils";
import { writeResult } from "./writeResult";

export type ParseDateConfig = { path: string; format: string; timezone?: string; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    format: { type: "string", minLength: 1 },
    timezone: { type: "string" },
    writeResultTo: { type: "string" },
  },
  required: ["path", "format"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: ParseDateConfig): JSONValue {
  const cur = getByPath(input, cfg.path);
  const dt = parseWithFormat(cur, cfg.format, cfg.timezone || "utc");
  if (!dt) throw new Error(`ParseDate: invalid or mismatched format at '${cfg.path}'`);
  const iso = toISO(dt) as JSONValue;
  const updated = setByPath(input, cfg.path, iso);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => iso });
}

function validate(config: ParseDateConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid ParseDate config";
  const cur = getByPath(input, config.path);
  if (typeof cur !== "string" || !cur) return `Path '${config.path}' is not a non-empty string`;
}

const mod: OperationModule<ParseDateConfig> = {
  type: "ParseDate",
  apply,
  validate,
  defaultConfig: { path: "", format: "YYYY-MM-DD", timezone: "utc", writeResultTo: undefined },
};

export default mod;
