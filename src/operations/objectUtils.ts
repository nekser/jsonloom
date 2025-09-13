import { getByPath, setByPath } from "./utils";
import type { JSONValue, JSONObject } from "../types/json";

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
    // implement via setByPath: replace matched leaves with undefined and then prune
  const replaced = setByPath(obj, path, undefined as unknown as JSONValue);
    return pruneUndefined(replaced);
  }
  const parts = path.split(".");
  const root: JSONValue = Array.isArray(obj) ? [...obj] : obj && typeof obj === "object" ? { ...(obj as JSONObject) } : {};
  let cur: Record<string, unknown> | Array<unknown> = (Array.isArray(root) ? [...root] : (root && typeof root === "object" ? { ...(root as JSONObject) } : {})) as Record<string, unknown> | Array<unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = (cur as Record<string, unknown>)[p];
    if (!(next && typeof next === "object")) {
      // path not found
      return root;
    }
    (cur as Record<string, unknown>)[p] = Array.isArray(next) ? [...next] : { ...(next as Record<string, unknown>) };
    cur = (cur as Record<string, unknown>)[p] as Record<string, unknown> | Array<unknown>;
  }
  if (cur && typeof cur === "object") {
    if (Array.isArray(cur)) {
      const idx = Number(parts[parts.length - 1]);
      if (Number.isInteger(idx) && idx >= 0 && idx < cur.length) cur.splice(idx, 1);
    } else {
      delete (cur as Record<string, unknown>)[parts[parts.length - 1]];
    }
  }
  return root;
}

function pruneUndefined(node: JSONValue): JSONValue {
  if (Array.isArray(node)) {
    // remove explicit undefineds in arrays
    const arr = node.map((v) => pruneUndefined(v)).filter((v) => v !== undefined) as JSONValue[];
    return arr as unknown as JSONValue;
  }
  if (node && typeof node === "object") {
    const out: JSONObject = {};
    for (const [k, v] of Object.entries(node as JSONObject)) {
      const nv = pruneUndefined(v);
      if (nv !== undefined) out[k] = nv;
    }
    return out as JSONValue;
  }
  return node;
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
  return out;
}
