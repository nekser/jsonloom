import Ajv from "ajv";
import type { OperationModule } from "./types";
import { omitPaths } from "./objectUtils";

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

function apply(input: any, cfg: OmitPathsConfig): any {
  return omitPaths(input, cfg.paths);
}

function validate(config: OmitPathsConfig, _input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid OmitPaths config";
}

const mod: OperationModule<OmitPathsConfig> = {
  type: "OmitPaths" as any,
  apply,
  validate,
  defaultConfig: { paths: [] },
};

export default mod;
