import { getByPath, setByPath } from "./utils";

export function walkKeys(input: any, transformKey: (k: string) => string): any {
  if (Array.isArray(input)) return input.map((v) => walkKeys(v, transformKey));
  if (input && typeof input === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(input)) {
      const nk = transformKey(k);
      out[nk] = walkKeys(v, transformKey);
    }
    return out;
  }
  return input;
}

export function renameKeysByRegex(input: any, re: RegExp, replacement: string): any {
  return walkKeys(input, (k) => k.replace(re, replacement));
}

// ----- case conversion -----
function splitWords(key: string): string[] {
  const s = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_\s]+/g, " ").trim();
  return s ? s.split(" ") : [];
}

export type KeyCase = "camel" | "snake" | "kebab" | "pascal";
export function convertKeyCase(key: string, mode: KeyCase): string {
  const words = splitWords(key).map((w) => w.toLowerCase());
  switch (mode) {
    case "camel":
      return words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join("");
    case "pascal":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    case "snake":
      return words.join("_");
    case "kebab":
      return words.join("-");
  }
}

export function normalizeKeyCase(input: any, mode: KeyCase): any {
  return walkKeys(input, (k) => convertKeyCase(k, mode));
}

// ----- delete path -----
export function deleteByPath(obj: any, path: string): any {
  if (!path) return obj;
  const parts = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : obj && typeof obj === "object" ? { ...obj } : {};
  let cur: any = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    if (!(next && typeof next === "object")) {
      // path not found
      return root;
    }
    cur[p] = Array.isArray(next) ? [...next] : { ...next };
    cur = cur[p];
  }
  if (cur && typeof cur === "object") {
    if (Array.isArray(cur)) {
      const idx = Number(parts[parts.length - 1]);
      if (Number.isInteger(idx) && idx >= 0 && idx < cur.length) cur.splice(idx, 1);
    } else {
      delete cur[parts[parts.length - 1]];
    }
  }
  return root;
}

// ----- merge utils -----
export type MergeStrategy = "shallow" | "deep" | "overwrite";
export function mergeObjects(target: any, source: any, strategy: MergeStrategy): any {
  if (strategy === "overwrite") {
    if (target && typeof target === "object" && !Array.isArray(target) && source && typeof source === "object" && !Array.isArray(source)) {
      return { ...target, ...source };
    }
    return source;
  }
  if (strategy === "shallow") {
    if (target && typeof target === "object" && !Array.isArray(target) && source && typeof source === "object" && !Array.isArray(source)) {
      return { ...target, ...source };
    }
    return target;
  }
  // deep
  if (target && typeof target === "object" && !Array.isArray(target) && source && typeof source === "object" && !Array.isArray(source)) {
    const out: any = { ...target };
    for (const [k, v] of Object.entries(source)) {
      out[k] = k in out ? mergeObjects(out[k], v, "deep") : v;
    }
    return out;
  }
  return source;
}

// ----- flatten/unflatten -----
export function flattenObject(obj: any, delimiter = ".", maxDepth?: number): Record<string, any> {
  const out: Record<string, any> = {};
  function rec(cur: any, prefix: string, depth: number) {
    const isObj = cur && typeof cur === "object" && !Array.isArray(cur);
    if (!isObj || (maxDepth !== undefined && depth >= maxDepth)) {
      out[prefix] = cur;
      return;
    }
    const entries = Object.entries(cur);
    if (entries.length === 0) {
      out[prefix] = cur;
      return;
    }
    for (const [k, v] of entries) {
      const nextKey = prefix ? `${prefix}${delimiter}${k}` : k;
      rec(v, nextKey, depth + 1);
    }
  }
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const entries = Object.entries(obj);
    if (entries.length === 0) return {};
    for (const [k, v] of entries) rec(v, k, 0);
  }
  return out;
}

export function unflattenObject(flat: Record<string, any>, delimiter = "."): any {
  let root: any = {};
  for (const [path, value] of Object.entries(flat)) {
    if (typeof path !== "string") continue;
    root = setByPath(root, path.split(delimiter).join("."), value);
  }
  return root;
}

// ----- pick/omit paths -----
export function pickPaths(obj: any, paths: string[]): any {
  let out: any = Array.isArray(obj) ? [] : {};
  for (const p of paths) {
    const val = getByPath(obj, p);
    if (val !== undefined) out = setByPath(out, p, val);
  }
  return out;
}

export function omitPaths(obj: any, paths: string[]): any {
  let out: any = obj;
  for (const p of paths) out = deleteByPath(out, p);
  return out;
}
