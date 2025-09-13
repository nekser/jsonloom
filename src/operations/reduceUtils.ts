export type ReduceOp = "sum" | "avg" | "min" | "max" | "concat";
import type { JSONValue } from "../types/json";

export function reduceValues(arr: JSONValue[], op: ReduceOp): JSONValue {
  if (op === "concat") return arr.map((v) => String(v ?? "")).join("");
  const nums = arr.map((v) => (typeof v === "number" ? v : Number(v))).filter((n) => Number.isFinite(n));
  if (nums.length === 0) return op === "avg" ? 0 : 0;
  switch (op) {
    case "sum":
      return nums.reduce((a, b) => a + b, 0);
    case "avg":
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    case "min":
      return Math.min(...nums);
    case "max":
      return Math.max(...nums);
    default:
      return 0;
  }
}
