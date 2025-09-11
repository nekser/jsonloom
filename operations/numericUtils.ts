import { getByPath, setByPath } from "./utils";

export function isNumeric(x: any): boolean {
  return typeof x === "number" && Number.isFinite(x);
}

export function toNumber(x: any): number {
  if (typeof x === "number") return x;
  if (typeof x === "string" && x.trim() !== "") {
    const n = Number(x);
    if (Number.isFinite(n)) return n;
  }
  throw new Error("Value is not numeric");
}

export function validateNumberPath(input: any, path: string): string | undefined {
  const v = getByPath(input, path);
  if (Array.isArray(v)) {
    for (const el of v) {
      if (!isNumeric(el)) return `Path '${path}' must be an array of numbers`;
    }
    return undefined;
  }
  if (!isNumeric(v)) return `Path '${path}' must be a number`;
}

export function applyNumberAtPath(input: any, path: string, fn: (n: number) => number): any {
  const v = getByPath(input, path);
  if (Array.isArray(v)) {
    const out = v.map((el) => fn(toNumber(el)));
    return setByPath(input, path, out);
  }
  const res = fn(toNumber(v));
  return setByPath(input, path, res);
}
