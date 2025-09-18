import Ajv from "ajv";
import type { OperationModule } from "./types";
import type { JSONValue } from "../types/json";
import { deleteByPath } from "./objectUtils";
import { writeResult } from "./writeResult";

export type DeletePathConfig = { path: string; writeResultTo?: string };

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    writeResultTo: { type: "string" },
  },
  required: ["path"],
  additionalProperties: true,
});

function apply(input: JSONValue, cfg: DeletePathConfig): JSONValue {
  const updated = deleteByPath(input, cfg.path);
  // For delete, valueExtractor just returns undefined (the removed value is not tracked). We skip writing if result path not provided.
  return writeResult(input, updated, { writeResultTo: cfg.writeResultTo, valueExtractor: () => undefined as unknown as JSONValue });
}

function validate(config: DeletePathConfig, _input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid DeletePath config";
}

const mod: OperationModule<DeletePathConfig> = {
  type: "DeletePath",
  apply,
  validate,
  defaultConfig: { path: "", writeResultTo: undefined },
};

export default mod;
