export type Operator = "eq" | "neq" | "gt" | "lt" | "in" | "contains";
import type { JSONValue } from "../types/json";

function toNumber(v: JSONValue): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function equalNumericAware(a: JSONValue, b: JSONValue): boolean {
  const an = toNumber(a);
  const bn = toNumber(b);
  if (an != null && bn != null) return an === bn;
  return a === b;
}

function arrayIncludesNumericAware(arr: JSONValue[], value: JSONValue): boolean {
  for (const el of arr) if (equalNumericAware(el, value)) return true;
  return false;
}

export function evaluatePredicate(item: JSONValue, key: string, op: Operator, value: JSONValue): boolean {
  const lhs = key ? ((item as Record<string, JSONValue> | undefined)?.[key] as JSONValue) : item;
  const rhs = value;
  switch (op) {
    case "eq":
      return equalNumericAware(lhs, rhs);
    case "neq":
      return !equalNumericAware(lhs, rhs);
    case "gt": {
      const a = toNumber(lhs);
      const b = toNumber(rhs);
      return a != null && b != null && a > b;
    }
    case "lt": {
      const a = toNumber(lhs);
      const b = toNumber(rhs);
      return a != null && b != null && a < b;
    }
    case "in": {
      if (Array.isArray(rhs)) return arrayIncludesNumericAware(rhs as JSONValue[], lhs);
      // comma-separated string list
      if (typeof rhs === "string") {
        const parts = rhs.split(",").map((s) => s.trim());
        // check numeric-aware membership too
        return parts.some((p) => equalNumericAware(lhs, p));
      }
      return false;
    }
    case "contains": {
      if (typeof lhs === "string") return lhs.toLowerCase().includes(String(rhs).toLowerCase());
      if (Array.isArray(lhs)) return arrayIncludesNumericAware(lhs as JSONValue[], rhs);
      return false;
    }
    default:
      return false;
  }
}
