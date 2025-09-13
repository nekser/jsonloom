import Ajv from "ajv";
import type { OperationModule } from "./types";
import { getByPath } from "./utils";
import type { JSONValue } from "../types/json";

export type ExtractPathConfig = { path: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: { path: { type: "string", minLength: 1 } },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: ExtractPathConfig): JSONValue {
  return getByPath(input, cfg.path);
}

function validate(config: ExtractPathConfig): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid ExtractPath config";
}

const mod: OperationModule<ExtractPathConfig> = {
  type: "ExtractPath",
  apply,
  validate,
  defaultConfig: { path: "" },
};

export default mod;
