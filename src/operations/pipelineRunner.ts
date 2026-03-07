import { getOperationModule, type Operation } from "@/src/operations";
import { resolveConfig } from "@/src/operations/configResolver";
import { buildPathIndex, type PathIndex } from "@/src/utils/pathSuggest";
import type { JSONValue } from "@/src/types/json";
import { resetVarContext } from "@/src/operations/varContext";
import type { ValidationError } from "@/src/operations";

export type PipelineRunResult = {
  output?: JSONValue;
  error?: ValidationError;
  indexes: PathIndex[];
  inter: Record<string, JSONValue>;
};

export function runPipelineOperations(input: JSONValue, ops: Operation[]): PipelineRunResult {
  try {
    resetVarContext();
    let cur = input;
    const indexes: PathIndex[] = [];
    const inter: Record<string, JSONValue> = {};

    for (const op of ops) {
      indexes.push(buildPathIndex(cur));

      if (op.enabled === false) {
        inter[op.id] = cur;
        continue;
      }

      const mod = getOperationModule(op.type);
      if (!mod) {
        return { error: { opId: op.id, message: `Operation type '${op.type}' is not registered` }, indexes, inter };
      }

      let resolvedCfg: unknown;
      if (op.type === "MapArray" && op.config && typeof op.config === "object" && !Array.isArray(op.config)) {
        const { operations, ...rest } = op.config as Record<string, unknown>;
        const resolvedRest = resolveConfig(rest as unknown, { root: input });
        resolvedCfg = { ...(resolvedRest as Record<string, unknown>), operations };
      } else {
        resolvedCfg = resolveConfig(op.config as unknown, { root: input });
      }

      const err = mod.validate(resolvedCfg as unknown, cur);
      if (err) return { error: { opId: op.id, message: err }, indexes, inter };
      cur = mod.apply(cur, resolvedCfg as unknown);
      inter[op.id] = cur;
    }

    return { output: cur, indexes, inter };
  } catch (error: unknown) {
    return {
      error: { message: (error as { message?: string })?.message ?? "Pipeline failed" },
      indexes: [],
      inter: {},
    };
  }
}
