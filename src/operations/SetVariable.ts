import Ajv from "ajv";
import type { Operation, OperationModule, OperationType } from "./types";
import { getOperationModule } from "./index";
import type { JSONValue } from "../types/json";
import { beginComputingVar, endComputingVar, setVar } from "./varContext";

export type SetVariableConfig = {
  name: string;
  op: Operation; // embedded op that computes the variable value using the ROOT as input
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    op: { type: "object" },
  },
  required: ["name", "op"],
  additionalProperties: true,
});

function runCompute(input: JSONValue, op: Operation): JSONValue {
  const mod = getOperationModule(op.type as OperationType);
  if (!mod) throw new Error(`Operation type '${op.type}' is not registered`);
  const err = mod.validate(op.config as unknown, input);
  if (err) throw new Error(err);
  return mod.apply(input, op.config as unknown);
}

function isSerializable(v: unknown): boolean {
  try {
    JSON.stringify(v);
    return true;
  } catch {
    return false;
  }
}

function apply(input: JSONValue, cfg: SetVariableConfig): JSONValue {
  if (!cfg?.name || typeof cfg.name !== "string") throw new Error("Empty variable name");
  beginComputingVar(cfg.name);
  try {
    const computed = runCompute(input, cfg.op);
    // Non-serializable results should be handled gracefully: skip storing but not crash the pipeline
    if (isSerializable(computed)) setVar(cfg.name, computed);
  } finally {
    endComputingVar(cfg.name);
  }
  // Does not mutate the root data
  return input;
}

function validate(config: SetVariableConfig, input: JSONValue): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid SetVariable config";
  if (!config.name?.trim()) return "Variable name is required";
  const mod = getOperationModule(config.op?.type as OperationType);
  if (!mod) return `Nested operation type '${config.op?.type}' is not registered`;
  const err = mod.validate(config.op.config as unknown, input);
  if (err) return `Nested op '${config.op.type}' invalid: ${err}`;
}

const mod: OperationModule<SetVariableConfig> = {
  type: "SetVariable" as OperationType,
  apply,
  validate,
  defaultConfig: { name: "", op: { id: "", type: "ReduceArray" as OperationType, config: {} } as unknown as Operation },
};

export default mod;
