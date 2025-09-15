import { getOperationModule, type Operation, type OperationType } from '@/src/operations/index';
import type { JSONValue } from '@/src/types/json';
import { resolveConfig } from '@/src/operations/configResolver';
import { resetVarContext } from '@/src/operations/varContext';

export function applyOperation(input: JSONValue, op: { type: OperationType; config: unknown }): JSONValue {
  const mod = getOperationModule(op.type);
  const resolved = resolveConfig(op.config as unknown, { root: input });
  const err = mod.validate(resolved as unknown, input);
  if (err) throw new Error(err);
  return mod.apply(input, resolved as unknown);
}

export function applyPipeline(input: JSONValue, ops: Operation[]): JSONValue {
  resetVarContext();
  let cur = input;
  for (const op of ops) {
    const mod = getOperationModule(op.type as OperationType);
    const resolved = resolveConfig(op.config as unknown, { root: input });
    const err = mod.validate(resolved as unknown, cur);
    if (err) throw new Error(err);
    cur = mod.apply(cur, resolved as unknown);
  }
  return cur;
}
