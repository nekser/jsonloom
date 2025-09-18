import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue } from "../types/json";
import { writeResult } from "./writeResult";

export type JoinArrayConfig = {
  path: string;
  delimiter?: string; // original name
  separator?: string; // alias used by tests/UI
  writeResultTo?: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    delimiter: { type: "string" },
    separator: { type: "string" },
    writeResultTo: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: JoinArrayConfig): JSONValue {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const sep = (cfg.separator ?? cfg.delimiter ?? ",");
  const out = arr.map((v) => (v == null ? "" : String(v))).join(sep) as unknown as JSONValue;
  const updated = setByPath(input, cfg.path, out);
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => out });
}

function validate(config: JoinArrayConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid JoinArray config";
  const arr = getByPath(input, config.path);
  if (!Array.isArray(arr)) return `Path '${config.path}' is not an array`;
}

const mod: OperationModule<JoinArrayConfig> = {
  type: "JoinArray",
  apply,
  validate,
  defaultConfig: { path: "", delimiter: ",", writeResultTo: undefined },
};

export default mod;
