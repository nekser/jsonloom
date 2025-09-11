import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";

export type CountArrayConfig = {
  path: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: any, cfg: CountArrayConfig): any {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  return setByPath(input, cfg.path, arr.length);
}

function validate(config: CountArrayConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid CountArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<CountArrayConfig> = {
  type: "CountArray",
  apply,
  validate,
  defaultConfig: { path: "" },
};

export default mod;
