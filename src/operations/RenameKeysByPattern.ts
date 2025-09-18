import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { renameKeysByRegex } from "./objectUtils";
import { writeResult } from "./writeResult";

export type RenameKeysByPatternConfig = { pattern: string; replace: string; flags?: string; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    pattern: { type: "string", minLength: 1 },
    replace: { type: "string" },
    flags: { type: "string" },
    writeResultTo: { type: "string" },
  },
  required: ["pattern", "replace"],
  additionalProperties: true,
});

function tryRegex(pattern: string, flags?: string): RegExp | string {
  try {
    return new RegExp(pattern, flags);
  } catch (e: unknown) {
    return e instanceof Error ? e.message : "Invalid regex";
  }
}

function apply(input: JSONValue, cfg: RenameKeysByPatternConfig): JSONValue {
  const built = tryRegex(cfg.pattern, cfg.flags);
  if (!(built instanceof RegExp)) return input;
  const out = renameKeysByRegex(input, built, cfg.replace) as JSONValue;
  return writeResult(input, out, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
}

function validate(config: RenameKeysByPatternConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid RenameKeysByPattern config";
  if (config.flags && /[^gimsuy]/.test(config.flags)) return `Invalid regex flags '${config.flags}'`;
  const built = tryRegex(config.pattern, config.flags);
  if (!(built instanceof RegExp)) return String(built);
}

const mod: OperationModule<RenameKeysByPatternConfig> = {
  type: "RenameKeysByPattern" as const,
  apply,
  validate,
  defaultConfig: { pattern: "", replace: "", writeResultTo: undefined },
};

export default mod;
