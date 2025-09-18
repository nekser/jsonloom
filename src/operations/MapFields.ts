import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { getByPath, setByPath } from "./utils";
import { applyFieldMap } from "./mapUtils";
import { writeResult } from "./writeResult";

export type MapFieldsConfig = { path: string; mapping: Record<string, string>; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    mapping: { type: "object", additionalProperties: { type: "string" } },
    writeResultTo: { type: "string" },
  },
  required: ["path", "mapping"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: MapFieldsConfig): JSONValue {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  // Convert Record<string, string> to FieldMap[]
  const fieldMaps = Object.entries(cfg.mapping).map(([to, from]) => ({ from, to }));
  const out = arr.map((it) => applyFieldMap(it as Record<string, unknown>, fieldMaps)) as JSONValue;
  const updated = setByPath(input, cfg.path, out);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
}

function validate(config: MapFieldsConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid MapFields config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<MapFieldsConfig> = {
  type: "MapArray", // Reuse "MapArray" type? No: create a distinct label in registry later if needed.
  apply,
  validate,
  defaultConfig: { path: "", mapping: {}, writeResultTo: undefined },
};

export default mod;
