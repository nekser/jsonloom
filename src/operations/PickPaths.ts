import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { pickPaths } from "./objectUtils";
import { writeResult } from "./writeResult";

export type PickPathsConfig = { paths: string[]; writeResultTo?: string };

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

function apply(input: JSONValue, cfg: PickPathsConfig): JSONValue {
  const out = pickPaths(input, cfg.paths) as JSONValue;
  return writeResult(input, out, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
}

function validate(config: PickPathsConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid PickPaths config";
}

const mod: OperationModule<PickPathsConfig> = {
  type: "PickPaths",
  apply,
  validate,
  defaultConfig: { paths: [], writeResultTo: undefined },
};

export default mod;
