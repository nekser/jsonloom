import Ajv from "ajv";
import type { OperationModule } from "./types";
import { renameKeysByRegex } from "./objectUtils";

export type RenameKeysByPatternConfig = {
  pattern: string;
  replace: string;
  flags?: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    pattern: { type: "string", minLength: 1 },
    replace: { type: "string" },
    flags: { type: "string" },
  },
  required: ["pattern", "replace"],
  additionalProperties: true,
});

function tryRegex(pattern: string, flags?: string): RegExp | string {
  try {
    return new RegExp(pattern, flags);
  } catch (e: any) {
    return e?.message || "Invalid regex";
  }
}

function apply(input: any, cfg: RenameKeysByPatternConfig): any {
  const built = tryRegex(cfg.pattern, cfg.flags);
  if (!(built instanceof RegExp)) return input;
  return renameKeysByRegex(input, built, cfg.replace);
}

function validate(config: RenameKeysByPatternConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid RenameKeysByPattern config";
  if (config.flags && /[^gimsuy]/.test(config.flags)) return `Invalid regex flags '${config.flags}'`;
  const built = tryRegex(config.pattern, config.flags);
  if (!(built instanceof RegExp)) return String(built);
}

const mod: OperationModule<RenameKeysByPatternConfig> = {
  type: "RenameKeysByPattern" as any,
  apply,
  validate,
  defaultConfig: { pattern: "", replace: "" },
};

export default mod;
