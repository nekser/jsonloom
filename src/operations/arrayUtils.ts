import type { JSONValue } from "../types/json";

export function flattenDepth(arr: JSONValue[], depth = 1): JSONValue[] {
  if (depth <= 0) return arr.slice();
  const out: JSONValue[] = [];
  for (const x of arr) {
    if (Array.isArray(x) && depth > 0) out.push(...flattenDepth(x, depth === Infinity ? Infinity : depth - 1));
    else out.push(x);
  }
  return out;
}
