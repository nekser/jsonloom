import Ajv from "ajv";
import type { OperationModule } from "./types";
import { omitPaths } from "./objectUtils";
import { JSONValue } from "../types/json";
import { writeResult } from "./writeResult";

export type OmitPathsConfig = { paths: string[]; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    paths: { type: "array", items: { type: "string", minLength: 1 }, minItems: 1 },
    writeResultTo: { type: "string" },
  },
  required: ["paths"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: OmitPathsConfig): JSONValue {
  const out = omitPaths(input, cfg.paths) as JSONValue;
  return writeResult(input, out, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
}

function validate(config: OmitPathsConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid OmitPaths config";
}

const mod: OperationModule<OmitPathsConfig> = {
  type: "OmitPaths",
  apply,
  validate,
  defaultConfig: { paths: [], writeResultTo: undefined },
};

export default mod;
