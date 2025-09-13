// ----- Wildcard-aware path helpers -----
// Path semantics:
// - Empty or "." returns the current object
// - '.'-separated segments
// - '*' segment matches all keys (objects) or all indices (arrays)
// - getByPath returns a single value for concrete paths, or a flat array of matches when '*' is used
// - setByPath writes immutably; for wildcard paths, if 'val' is an array with the same arity as matches,
//   values are applied element-wise in traversal order; otherwise a single value is broadcast to all matches

import type { JSONValue, JSONObject } from "../types/json";

export function getByPath(obj: JSONValue, path: string): JSONValue | JSONValue[] {
  if (!path || path === ".") return obj;
  const parts = path.split(".");
  const hasWildcard = parts.includes("*");
  if (!hasWildcard) {
    return parts.reduce<JSONValue | undefined>((acc, seg) => (acc == null ? acc : (acc as JSONObject)[seg]), obj as JSONValue) as JSONValue;
  }
  // wildcard resolution -> collect flat matches
  let nodes: JSONValue[] = [obj];
  for (const seg of parts) {
    const next: JSONValue[] = [];
    if (seg === "*") {
      for (const n of nodes) {
        if (Array.isArray(n)) {
          for (const v of n) next.push(v);
        } else if (n && typeof n === "object") {
          for (const v of Object.values(n as JSONObject)) next.push(v as JSONValue);
        } // else: not traversable -> no matches
      }
    } else {
      for (const n of nodes) {
        if (n != null && typeof n === "object") next.push((n as JSONObject)[seg]);
      }
    }
    nodes = next;
    if (nodes.length === 0) break;
  }
  return nodes;
}

export function setByPath(obj: JSONValue, path: string, val: JSONValue | JSONValue[]): JSONValue {
  if (!path || path === ".") return val;
  const parts = path.split(".");
  const hasWildcard = parts.includes("*");

  // provider yields element-wise values for wildcard matches, or broadcasts a single value
  const provider = createValueProvider(val, hasWildcard);

  function rec(node: JSONValue, idx: number): JSONValue {
    if (idx >= parts.length) {
      // leaf replacement
      return provider.next() as JSONValue;
    }
    const seg = parts[idx];
    if (seg === "*") {
      if (Array.isArray(node)) {
        let changed = false;
        const out = node.map((child) => {
          const nextChild = rec(child, idx + 1);
          if (nextChild !== child) changed = true;
          return nextChild;
        });
        return changed ? out : node;
      }
      if (node && typeof node === "object") {
        let changed = false;
        const out: JSONObject = { ...(node as JSONObject) };
        for (const k of Object.keys(node as JSONObject)) {
          const child = (node as JSONObject)[k] as JSONValue;
          const nextChild = rec(child, idx + 1);
          if (nextChild !== child) {
            out[k] = nextChild;
            changed = true;
          }
        }
        return changed ? out : node;
      }
      // wildcard on primitive -> no-op
      return node;
    }
    // concrete segment
    if (node == null || typeof node !== "object") {
      // For wildcard scenarios, do not create missing branches (no-op). For concrete full path, mimic previous behavior.
      if (hasWildcard) return node;
      // create branches
      const nextContainer: JSONObject = {};
      const nextChild = rec(undefined as unknown as JSONValue, idx + 1);
      nextContainer[seg] = nextChild;
      return nextContainer;
    }
    const curChild = (node as JSONObject)[seg] as JSONValue;
    const nextChild = rec(curChild, idx + 1);
    if (nextChild === curChild) return node;
    const clone: JSONValue = Array.isArray(node) ? [...node] : { ...(node as JSONObject) };
    (clone as JSONObject)[seg] = nextChild;
    return clone;
  }

  return rec(obj, 0);
}

function createValueProvider(val: JSONValue | JSONValue[], wildcard: boolean) {
  if (!wildcard) {
    return { next: () => val };
  }
  if (Array.isArray(val)) {
    let i = 0;
    let last: JSONValue | undefined = val.length > 0 ? (val[val.length - 1] as JSONValue) : undefined;
    return {
      next: () => {
        if (i < val.length) {
          const v = val[i++] as JSONValue;
          last = v;
          return v;
        }
        return last as JSONValue;
      },
    };
  }
  return { next: () => val };
}

export function deepStringReplace(input: JSONValue, search: string, replace: string): JSONValue {
  if (typeof input === "string") return input.split(search).join(replace);
  if (Array.isArray(input)) return input.map((x) => deepStringReplace(x, search, replace));
  if (input && typeof input === "object") {
    const out: JSONObject = {};
    for (const [k, v] of Object.entries(input as JSONObject)) out[k] = deepStringReplace(v, search, replace);
    return out;
  }
  return input;
}
