import Ajv from "ajv";
import type { OperationModule } from "./types";
import { normalizeKeyCase, type KeyCase } from "./objectUtils";

export type NormalizeKeyCaseConfig = {
  mode: KeyCase; // camel | snake | kebab | pascal
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    mode: { enum: ["camel", "snake", "kebab", "pascal"] },
  },
  required: ["mode"],
  additionalProperties: true,
});

function apply(input: any, cfg: NormalizeKeyCaseConfig): any {
  // normalizeKeyCase already walks recursively; objectUtils.walkKeys writes last occurrence wins
  return normalizeKeyCase(input, cfg.mode);
}

function validate(config: NormalizeKeyCaseConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid NormalizeKeyCase config";
}

const mod: OperationModule<NormalizeKeyCaseConfig> = {
  type: "NormalizeKeyCase" as any,
  apply,
  validate,
  defaultConfig: { mode: "camel" },
};

export default mod;
