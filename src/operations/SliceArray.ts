import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import { sliceWithStep } from "./sliceUtils";
import type { JSONValue } from "../types/json";
import { writeResult } from "./writeResult";

export type SliceArrayConfig = {
  path: string;
  start?: number;
  end?: number;
  step?: number;
  writeResultTo?: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    start: { type: "number" },
    end: { type: "number" },
    step: { type: "number", minimum: 1 },
    writeResultTo: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: SliceArrayConfig): JSONValue {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const out = sliceWithStep(arr, cfg.start, cfg.end, cfg.step) as JSONValue;
  const updated = setByPath(input, cfg.path, out);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
}

function validate(config: SliceArrayConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid SliceArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<SliceArrayConfig> = {
  type: "SliceArray",
  apply,
  validate,
  defaultConfig: { path: "", writeResultTo: undefined },
};

export default mod;
