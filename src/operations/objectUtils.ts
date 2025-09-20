import type { JSONObject, JSONValue } from "../types/json";
import { getByPath, setByPath } from "./utils";

export function walkKeys(input: JSONValue, transformKey: (k: string) => string): JSONValue {
  if (Array.isArray(input)) return input.map((v) => walkKeys(v, transformKey));
  if (input && typeof input === "object") {
    const out: JSONObject = {};
    for (const [k, v] of Object.entries(input as JSONObject)) {
      const nk = transformKey(k);
      out[nk] = walkKeys(v, transformKey);
    }
    return out;
  }
  return input;
}

export function renameKeysByRegex(input: JSONValue, re: RegExp, replacement: string): JSONValue {
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

export function normalizeKeyCase(input: JSONValue, mode: KeyCase): JSONValue {
  return walkKeys(input, (k) => convertKeyCase(k, mode));
}

// ----- delete path -----
export function deleteByPath(obj: JSONValue, path: string): JSONValue {
  if (!path) return obj;
  if (path.includes("*")) {
    // For wildcards, setByPath sets to undefined, then pruneUndefinedRoot removes all undefineds
    const replaced = setByPath(obj, path, undefined as unknown as JSONValue);
    return pruneUndefinedRoot(replaced);
  }
  const parts = path.split(".");
  // Deep clone root
  const root: JSONValue = Array.isArray(obj) ? [...obj] : obj && typeof obj === "object" ? { ...(obj as JSONObject) } : {};
  let cur: JSONValue = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    // Ensure cur is indexable
    if (!(cur && typeof cur === "object")) {
      // path not found
      return root;
    }
    const objCur = cur as JSONObject;
    const next = objCur[p as keyof JSONObject] as unknown as JSONValue;
    if (!(next && typeof next === "object")) {
      // path not found
      return root;
    }
    (objCur as JSONObject)[p] = (Array.isArray(next) ? [...next] : { ...(next as JSONObject) }) as unknown as JSONValue;
    cur = (objCur as JSONObject)[p] as unknown as JSONValue;
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) {
    const idx = Number(last);
    if (Number.isInteger(idx) && idx >= 0 && idx < cur.length) cur.splice(idx, 1);
  } else if (cur && typeof cur === "object") {
    const objCur = cur as JSONObject;
    if (Object.prototype.hasOwnProperty.call(objCur, last)) {
      delete (objCur as Record<string, unknown>)[last];
    }
  }
  // Prune undefined values after deletion
  return pruneUndefinedRoot(root);
}

function pruneUndefined(node: JSONValue): JSONValue {
  if (Array.isArray(node)) {
    // remove explicit undefineds in arrays
    const arr = node.map((v) => pruneUndefined(v)).filter((v) => v !== undefined);
    return arr;
  }
  if (node && typeof node === "object") {
    const out: JSONObject = {};
    for (const [k, v] of Object.entries(node as JSONObject)) {
      const nv = pruneUndefined(v);
      if (nv !== undefined) out[k] = nv;
    }
    // If all properties were undefined, return undefined to allow parent to prune this object
    if (Object.keys(out).length === 0) return undefined as unknown as JSONValue;
    return out;
  }
  return node;
}

function pruneUndefinedRoot(node: JSONValue): JSONValue {
  const pruned = pruneUndefined(node);
  if (pruned === undefined) {
    // preserve type: if input was array, return []; else return {}
    return Array.isArray(node) ? [] : {};
  }
  return pruned;
}

// ----- merge utils -----
export type MergeStrategy = "shallow" | "deep" | "overwrite";
export function mergeObjects(target: JSONValue, source: JSONValue, strategy: MergeStrategy): JSONValue {
  if (strategy === "overwrite") {
    if (target && typeof target === "object" && !Array.isArray(target) && source && typeof source === "object" && !Array.isArray(source)) {
      return { ...(target as JSONObject), ...(source as JSONObject) };
    }
    return source;
  }
  if (strategy === "shallow") {
    if (target && typeof target === "object" && !Array.isArray(target) && source && typeof source === "object" && !Array.isArray(source)) {
      return { ...(target as JSONObject), ...(source as JSONObject) };
    }
    return target;
  }
  // deep
  if (target && typeof target === "object" && !Array.isArray(target) && source && typeof source === "object" && !Array.isArray(source)) {
    const out: JSONObject = { ...(target as JSONObject) };
    for (const [k, v] of Object.entries(source as JSONObject)) {
      out[k] = k in out ? (mergeObjects(out[k], v as JSONValue, "deep") as JSONValue) : (v as JSONValue);
    }
    return out as JSONValue;
  }
  return source;
}

// ----- flatten/unflatten -----
export function flattenObject(obj: JSONValue, delimiter = ".", maxDepth?: number): Record<string, JSONValue> {
  const out: Record<string, JSONValue> = {};
  function rec(cur: JSONValue, prefix: string, depth: number) {
    const isObj = cur && typeof cur === "object" && !Array.isArray(cur);
    if (!isObj || (maxDepth !== undefined && depth >= maxDepth)) {
      out[prefix] = cur;
      return;
    }
    const entries = Object.entries(cur as JSONObject);
    if (entries.length === 0) {
      out[prefix] = cur;
      return;
    }
    for (const [k, v] of entries) {
      const nextKey = prefix ? `${prefix}${delimiter}${k}` : k;
      rec(v as JSONValue, nextKey, depth + 1);
    }
  }
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    const entries = Object.entries(obj as JSONObject);
    if (entries.length === 0) return {};
    for (const [k, v] of entries) rec(v as JSONValue, k, 0);
  }
  return out;
}

export function unflattenObject(flat: Record<string, JSONValue>, delimiter = "."): JSONValue {
  let root: JSONValue = {};
  for (const [path, value] of Object.entries(flat)) {
    if (typeof path !== "string") continue;
    root = setByPath(root, path.split(delimiter).join("."), value);
  }
  return root;
}

// ----- pick/omit paths -----
export function pickPaths(obj: JSONValue, paths: string[]): JSONValue {
  let out: JSONValue = Array.isArray(obj) ? [] : {};
  for (const p of paths) {
    const val = getByPath(obj, p);
    if (val !== undefined) out = setByPath(out, p, val);
  }
  return out;
}

export function omitPaths(obj: JSONValue, paths: string[]): JSONValue {
  let out: JSONValue = obj;
  for (const p of paths) out = deleteByPath(out, p);
  // Prune undefined values after all deletions
  return pruneUndefinedRoot(out);
}
