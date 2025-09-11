import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { applyFieldMap } from "./mapUtils";

export type MapFieldsConfig = {
  path: string; // path to array of objects
  mapping: Record<string, string>; // newKey -> sourceKey
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    mapping: { type: "object", additionalProperties: { type: "string" } },
  },
  required: ["path", "mapping"],
  additionalProperties: true,
});

function apply(input: any, cfg: MapFieldsConfig): any {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const out = arr.map((it) => applyFieldMap(it, cfg.mapping));
  return setByPath(input, cfg.path, out);
}

function validate(config: MapFieldsConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid MapFields config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<MapFieldsConfig> = {
  type: "MapArray", // Reuse "MapArray" type? No: create a distinct label in registry later if needed.
  apply,
  validate,
  defaultConfig: { path: "", mapping: {} },
};

export default mod;
