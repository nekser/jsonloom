import Ajv from "ajv";
import type { OperationModule } from "./types";
import { setByPath } from "./utils";
import type { JSONValue } from "../types/json";

export type SetPathConfig = {
  path: string;
  value: JSONValue;
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

function apply(input: JSONValue, cfg: SetPathConfig): JSONValue {
  return setByPath(input, cfg.path, cfg.value);
}

function validate(config: SetPathConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid SetPath config";
}

const mod: OperationModule<SetPathConfig> = {
  type: "SetPath",
  apply,
  validate,
  defaultConfig: { path: "", value: null },
};

export default mod;
