import Ajv from "ajv";
import type { OperationModule } from "./types";
import { pickPaths } from "./objectUtils";

export type PickPathsConfig = {
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

function apply(input: any, cfg: PickPathsConfig): any {
  return pickPaths(input, cfg.paths);
}

function validate(config: PickPathsConfig, _input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid PickPaths config";
}

const mod: OperationModule<PickPathsConfig> = {
  type: "PickPaths" as any,
  apply,
  validate,
  defaultConfig: { paths: [] },
};

export default mod;
