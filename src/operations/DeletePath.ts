import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { deleteByPath } from "./objectUtils";

export type DeletePathConfig = {
  path: string;
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: DeletePathConfig): JSONValue {
  return deleteByPath(input, cfg.path);
}

function validate(config: DeletePathConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid DeletePath config";
}

const mod: OperationModule<DeletePathConfig> = {
  type: "DeletePath",
  apply,
  validate,
  defaultConfig: { path: "" },
};

export default mod;
