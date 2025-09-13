import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { uniqueBy } from "./uniqueUtils";

export type UniqueArrayConfig = {
  path: string;
  by?: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    by: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: any, cfg: UniqueArrayConfig): any {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const out = uniqueBy(arr, cfg.by);
  return setByPath(input, cfg.path, out);
}

function validate(config: UniqueArrayConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid UniqueArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<UniqueArrayConfig> = {
  type: "UniqueArray",
  apply,
  validate,
  defaultConfig: { path: "" },
};

export default mod;
