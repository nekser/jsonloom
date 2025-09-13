import Ajv from "ajv";
import type { OperationModule } from "./types";
import { omitPaths } from "./objectUtils";
import { JSONValue } from "../types/json";

export type OmitPathsConfig = {
  paths: string[];
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    paths: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1 },
  },
  required: ["paths"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: OmitPathsConfig): JSONValue {
  return omitPaths(input, cfg.paths);
}

function validate(config: OmitPathsConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid OmitPaths config";
}

const mod: OperationModule<OmitPathsConfig> = {
  type: "OmitPaths",
  apply,
  validate,
  defaultConfig: { paths: [] },
};

export default mod;
