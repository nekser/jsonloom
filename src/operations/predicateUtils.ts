export type Operator = "eq" | "neq" | "gt" | "lt" | "in" | "contains";

function toNumber(v: any): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}


function equalNumericAware(a: any, b: any): boolean {
  const an = toNumber(a);
  const bn = toNumber(b);
  if (an != null && bn != null) return an === bn;
  return a === b;
}

function arrayIncludesNumericAware(arr: any[], value: any): boolean {
  for (const el of arr) if (equalNumericAware(el, value)) return true;
  return false;
}

export function evaluatePredicate(item: any, key: string, op: Operator, value: any): boolean {
  const lhs = key ? (item?.[key]) : item;
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
      if (Array.isArray(rhs)) return arrayIncludesNumericAware(rhs, lhs);
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
      if (Array.isArray(lhs)) return arrayIncludesNumericAware(lhs, rhs);
      return false;
    }
    default:
      return false;
  }
}
