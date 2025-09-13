import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath, setByPath } from "./utils";
import type { JSONValue } from "../types/json";

export type JoinArrayConfig = {
  path: string;
  delimiter?: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    delimiter: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: JoinArrayConfig): JSONValue {
  const arr = getByPath(input, cfg.path);
  if (!Array.isArray(arr)) return input;
  const out = arr.map((v) => (v == null ? "" : String(v))).join(cfg.delimiter ?? ",");
  return setByPath(input, cfg.path, out as unknown as JSONValue);
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
  defaultConfig: { path: "", delimiter: "," },
};

export default mod;
