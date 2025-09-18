import Ajv from "ajv";
import type { OperationModule } from "./types";
import { setByPath } from "./utils";
import { writeResult } from "./writeResult";
import type { JSONValue } from "../types/json";

export type SetPathConfig = { path: string; value: JSONValue; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    value: {},
    writeResultTo: { type: "string" },
  },
  required: ["path", "value"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: SetPathConfig): JSONValue {
  const updated = setByPath(input, cfg.path, cfg.value);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => cfg.value as JSONValue });
}

function validate(config: SetPathConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid SetPath config";
}

const mod: OperationModule<SetPathConfig> = {
  type: "SetPath",
  apply,
  validate,
  defaultConfig: { path: "", value: null, writeResultTo: undefined },
};

export default mod;
