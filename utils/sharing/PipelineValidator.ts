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
    const cfg: any = (op as any).config ?? {};
    // nested validations
    switch (op.type) {
      case "MapArray": {
        const e = validateOps(cfg.operations as Operation[] | undefined, `${ctx}[${i}].config.operations`);
        if (e) return e;
        break;
      }
      case "If": {
        const e1 = validateOps(cfg.then as Operation[] | undefined, `${ctx}[${i}].config.then`);
        if (e1) return e1;
        const e2 = validateOps(cfg.else as Operation[] | undefined, `${ctx}[${i}].config.else`);
        if (e2) return e2;
        break;
      }
      case "Switch": {
        const cases = (cfg.cases ?? []) as Array<{ ops?: Operation[] }>;
        for (let c = 0; c < cases.length; c++) {
          const e = validateOps(cases[c]?.ops as Operation[] | undefined, `${ctx}[${i}].config.cases[${c}].ops`);
          if (e) return e;
        }
        const eDef = validateOps(cfg.default as Operation[] | undefined, `${ctx}[${i}].config.default`);
        if (eDef) return eDef;
        break;
      }
      default:
        break;
    }
  }
}
