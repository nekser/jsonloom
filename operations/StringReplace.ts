import Ajv from "ajv";
import type { OperationModule } from "./types";
import { deepStringReplace } from "./utils";

export type StringReplaceConfig = { search: string; replace: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: { search: { type: "string" }, replace: { type: "string" } },
  required: ["search", "replace"],
  additionalProperties: true,
});

function apply(input: any, cfg: StringReplaceConfig): any {
  return deepStringReplace(input, cfg.search, cfg.replace);
}

function validate(config: StringReplaceConfig): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid StringReplace config";
}

const mod: OperationModule<StringReplaceConfig> = {
  type: "StringReplace",
  apply,
  validate,
  defaultConfig: { search: "", replace: "" },
};

export default mod;
