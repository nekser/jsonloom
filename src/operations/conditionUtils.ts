import { getByPath } from "./utils";
import { evaluatePredicate, type Operator } from "./predicateUtils";
import type { JSONValue } from "../types/json";

export type WhenCondition = {
  path: string;
  op: Operator | "exists";
  value?: JSONValue;
};

export function evaluateCondition(input: JSONValue, cond: WhenCondition): boolean {
  // Resolve value at path; wildcard returns array of matches
  const val = getByPath(input, cond.path);
  const op = cond.op;
  if (op === "exists") {
    if (Array.isArray(val)) return val.some((v) => v !== undefined && v !== null);
    return val !== undefined && val !== null;
  }
  // Delegate to predicate utils; when wildcard produced array -> true if ANY element satisfies predicate
  const rhs = cond.value as JSONValue | undefined;
  if (Array.isArray(val)) return val.some((v) => evaluatePredicate(v as JSONValue, "", op as Operator, rhs as JSONValue));
  return evaluatePredicate(val as JSONValue, "", op as Operator, rhs as JSONValue);
}
