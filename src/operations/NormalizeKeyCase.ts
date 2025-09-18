import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { normalizeKeyCase, type KeyCase } from "./objectUtils";
import { writeResult } from "./writeResult";

export type NormalizeKeyCaseConfig = { mode: KeyCase; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    mode: { enum: ["camel", "snake", "kebab", "pascal"] },
    writeResultTo: { type: "string" },
  },
  required: ["mode"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: NormalizeKeyCaseConfig): JSONValue {
  const out = normalizeKeyCase(input, cfg.mode) as JSONValue;
  return writeResult(input, out, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
}

function validate(config: NormalizeKeyCaseConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid NormalizeKeyCase config";
}

const mod: OperationModule<NormalizeKeyCaseConfig> = {
  type: "NormalizeKeyCase",
  apply,
  validate,
  defaultConfig: { mode: "camel", writeResultTo: undefined },
};

export default mod;
