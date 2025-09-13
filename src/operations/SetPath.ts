import Ajv from "ajv";
import type { OperationModule } from "./types";
import { setByPath } from "./utils";

export type SetPathConfig = {
  path: string;
  value: any;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    value: {},
  },
  required: ["path", "value"],
  additionalProperties: true,
});

function apply(input: any, cfg: SetPathConfig): any {
  return setByPath(input, cfg.path, cfg.value);
}

function validate(config: SetPathConfig, _input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid SetPath config";
}

const mod: OperationModule<SetPathConfig> = {
  type: "SetPath" as any,
  apply,
  validate,
  defaultConfig: { path: "", value: null },
};

export default mod;
