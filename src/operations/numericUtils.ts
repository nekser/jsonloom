import { getByPath, setByPath } from "./utils"; // get/set support '*' wildcards
import type { JSONValue } from "../types/json";

export function isNumeric(x: unknown): boolean {
  return typeof x === "number" && Number.isFinite(x);
}

export function toNumber(x: unknown): number {
  if (typeof x === "number") return x;
  if (typeof x === "string" && x.trim() !== "") {
    const n = Number(x);
    if (Number.isFinite(n)) return n;
  }
  throw new Error("Value is not numeric");
}

export function validateNumberPath(input: JSONValue, path: string): string | undefined {
  const v = getByPath(input, path);
  if (Array.isArray(v)) {
    for (const el of v) {
      if (!isNumeric(el)) return `Path '${path}' must be an array of numbers`;
    }
    return undefined;
  }
  if (!isNumeric(v)) return `Path '${path}' must be a number`;
}

export function applyNumberAtPath(input: JSONValue, path: string, fn: (n: number) => number): JSONValue {
  const v = getByPath(input, path);
  if (Array.isArray(v)) {
    const out = v.map((el) => fn(toNumber(el)));
    return setByPath(input, path, out);
  }
  const res = fn(toNumber(v));
  return setByPath(input, path, res);
}
