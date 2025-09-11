import Ajv from "ajv";
import type { Operation, OperationModule, OperationType } from "./types";
import { getByPath } from "./utils";
import { getOperationModule } from "./index";

export type SwitchCase = { value: string; ops: Operation[] };
export type SwitchConfig = {
  path: string;
  cases: SwitchCase[];
  default?: Operation[];
};

const ajv = new Ajv();
const validateSchema = ajv.compile({
  type: "object",
  properties: {
    path: { type: "string", minLength: 1 },
    cases: {
      type: "array",
      items: {
        type: "object",
        properties: { value: { type: "string" }, ops: { type: "array", items: { type: "object" } } },
        required: ["value", "ops"],
        additionalProperties: true,
      },
      minItems: 0,
    },
    default: { type: "array", items: { type: "object" } },
  },
  required: ["path", "cases"],
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

function apply(input: any, cfg: SwitchConfig): any {
  const val = getByPath(input, cfg.path);
  const values: any[] = Array.isArray(val) ? val : [val];
  // choose case if ANY value matches a case's value; if multiple cases match, first wins
  let chosenOps: Operation[] | undefined;
  outer: for (const c of cfg.cases) {
    for (const v of values) {
      if (String(v) === c.value) {
        chosenOps = c.ops;
        break outer;
      }
    }
  }
  if (!chosenOps) chosenOps = cfg.default;
  return runPipeline(input, chosenOps);
}

function validate(config: SwitchConfig, input: any): string | undefined {
  const ok = validateSchema(config);
  if (!ok) return validateSchema.errors?.[0]?.message || "Invalid Switch config";
  const check = (ops?: Operation[]) => {
    if (!ops) return;
    for (const op of ops) {
      const mod = getOperationModule(op.type as OperationType);
      if (!mod) return `Nested operation type '${op.type}' is not registered`;
      const err = mod.validate(op.config as any, input);
      if (err) return `Nested op '${op.type}' invalid: ${err}`;
    }
  };
  for (const c of config.cases) {
    const e = check(c.ops);
    if (e) return e;
  }
  return check(config.default);
}

const mod: OperationModule<SwitchConfig> = {
  type: "Switch" as any,
  apply,
  validate,
  defaultConfig: { path: "", cases: [], default: [] },
};

export default mod;
