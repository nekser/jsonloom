import { getByPath } from "./utils";
import { evaluatePredicate, type Operator } from "./predicateUtils";

export type WhenCondition = {
  path: string;
  op: Operator | "exists";
  value?: any;
};

export function evaluateCondition(input: any, cond: WhenCondition): boolean {
  // Resolve value at path; wildcard returns array of matches
  const val = getByPath(input, cond.path);
  const op = cond.op;
  if (op === "exists") {
    if (Array.isArray(val)) return val.some((v) => v !== undefined && v !== null);
    return val !== undefined && val !== null;
  }
  // Delegate to predicate utils; when wildcard produced array -> true if ANY element satisfies predicate
  if (Array.isArray(val)) return val.some((v) => evaluatePredicate(v, "", op as Operator, cond.value));
  return evaluatePredicate(val, "", op as Operator, cond.value);
}
