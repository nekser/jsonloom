import { getOperationModule, type Operation, type OperationType } from "../../operations/index";

export type ValidationResult = { ok: true } | { ok: false; error: string };

export const PipelineValidator = {
  validate(ops: Operation[]): ValidationResult {
    const err = validateOps(ops);
    return err ? { ok: false, error: err } : { ok: true };
  },
};

function validateOps(ops: Operation[] | undefined, ctx: string = "root"): string | undefined {
  if (!ops) return undefined;
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (!op || typeof op !== "object") return `Invalid operation at ${ctx}[${i}]`;
  const mod = getOperationModule(op.type as OperationType);
  if (!mod) return `Unknown operation type '${op.type}' at ${ctx}[${i}]`;
  const cfg = (op.config ?? {}) as Record<string, unknown>;
    // nested validations
    switch (op.type) {
      case "MapArray": {
        const nested = Array.isArray(cfg.operations) ? (cfg.operations as unknown as Operation[]) : undefined;
        const e = validateOps(nested, `${ctx}[${i}].config.operations`);
        if (e) return e;
        break;
      }
      case "If": {
        const thenOps = Array.isArray(cfg.then) ? (cfg.then as unknown as Operation[]) : undefined;
        const e1 = validateOps(thenOps, `${ctx}[${i}].config.then`);
        if (e1) return e1;
        const elseOps = Array.isArray(cfg.else) ? (cfg.else as unknown as Operation[]) : undefined;
        const e2 = validateOps(elseOps, `${ctx}[${i}].config.else`);
        if (e2) return e2;
        break;
      }
      case "Switch": {
        const cases = (Array.isArray(cfg.cases) ? (cfg.cases as unknown) : []) as Array<{ ops?: unknown }>;
        for (let c = 0; c < cases.length; c++) {
          const ops = Array.isArray(cases[c]?.ops) ? (cases[c]?.ops as unknown as Operation[]) : undefined;
          const e = validateOps(ops, `${ctx}[${i}].config.cases[${c}].ops`);
          if (e) return e;
        }
        const defOps = Array.isArray(cfg.default) ? (cfg.default as unknown as Operation[]) : undefined;
        const eDef = validateOps(defOps, `${ctx}[${i}].config.default`);
        if (eDef) return eDef;
        break;
      }
      default:
        break;
    }
  }
}
