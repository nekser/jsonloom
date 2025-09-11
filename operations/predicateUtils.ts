export type Operator = "eq" | "neq" | "gt" | "lt" | "in" | "contains";

function toNumber(v: any): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalize(val: any): any {
  return val;
}

export function evaluatePredicate(item: any, key: string, op: Operator, value: any): boolean {
  const lhs = key ? (item?.[key]) : item;
  const rhs = value;
  switch (op) {
    case "eq":
      return lhs === rhs;
    case "neq":
      return lhs !== rhs;
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
      if (Array.isArray(rhs)) return rhs.includes(lhs);
      // comma-separated string list
      if (typeof rhs === "string") return rhs.split(",").map((s) => s.trim()).includes(String(lhs));
      return false;
    }
    case "contains": {
      if (typeof lhs === "string") return lhs.toLowerCase().includes(String(rhs).toLowerCase());
      if (Array.isArray(lhs)) return lhs.includes(rhs);
      return false;
    }
    default:
      return false;
  }
}
