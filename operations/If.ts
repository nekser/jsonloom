import Ajv from "ajv";
import type { Operation, OperationModule, OperationType } from "./types";
import { evaluateCondition, type WhenCondition } from "./conditionUtils";
import { getOperationModule } from "./index";

export type IfConfig = {
  when: WhenCondition;
  then: Operation[];
  else?: Operation[];
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    when: {
      type: "object",
      properties: {
        path: { type: "string", minLength: 1 },
        op: { enum: ["exists", "eq", "neq", "gt", "lt", "in", "contains"] },
        value: {},
      },
      required: ["path", "op"],
      additionalProperties: true,
    },
    then: {
      type: "array",
      items: { type: "object" },
      minItems: 0,
    },
    else: {
      type: "array",
      items: { type: "object" },
      minItems: 0,
    },
  },
  required: ["when", "then"],
  additionalProperties: true,
});

function runPipeline(input: any, ops: Operation[] | undefined): any {
  if (!ops || ops.length === 0) return input;
  let cur = input;
  for (const op of ops) {
    const mod = getOperationModule(op.type as OperationType);
    if (!mod) throw new Error(`Operation type '${op.type}' is not registered`);
    const err = mod.validate(op.config as any, cur);
    if (err) throw new Error(err);
    cur = mod.apply(cur, op.config as any);
  }
  return cur;
}

function apply(input: any, cfg: IfConfig): any {
  const cond = evaluateCondition(input, cfg.when);
  const chosen = cond ? cfg.then : cfg.else;
  return runPipeline(input, chosen);
}

function validate(config: IfConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid If config";
  // Validate nested ops structure & basic applicability on current input
  const check = (ops?: Operation[]) => {
    if (!ops) return;
    for (const op of ops) {
      const mod = getOperationModule(op.type as OperationType);
      if (!mod) return `Nested operation type '${op.type}' is not registered`;
      const err = mod.validate(op.config as any, input);
      if (err) return `Nested op '${op.type}' invalid: ${err}`;
    }
  };
  return check(config.then) || check(config.else);
}

const mod: OperationModule<IfConfig> = {
  type: "If" as any,
  apply,
  validate,
  defaultConfig: { when: { path: "", op: "exists" }, then: [], else: [] },
};

export default mod;
