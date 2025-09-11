// ----- Wildcard-aware path helpers -----
// Path semantics:
// - Empty or "." returns the current object
// - '.'-separated segments
// - '*' segment matches all keys (objects) or all indices (arrays)
// - getByPath returns a single value for concrete paths, or a flat array of matches when '*' is used
// - setByPath writes immutably; for wildcard paths, if 'val' is an array with the same arity as matches,
//   values are applied element-wise in traversal order; otherwise a single value is broadcast to all matches

export function getByPath(obj: any, path: string): any {
  if (!path || path === ".") return obj;
  const parts = path.split(".");
  const hasWildcard = parts.includes("*");
  if (!hasWildcard) {
    return parts.reduce((acc, seg) => (acc == null ? acc : (acc as any)[seg]), obj);
  }
  // wildcard resolution -> collect flat matches
  let nodes: any[] = [obj];
  for (const seg of parts) {
    const next: any[] = [];
    if (seg === "*") {
      for (const n of nodes) {
        if (Array.isArray(n)) {
          for (const v of n) next.push(v);
        } else if (n && typeof n === "object") {
          for (const v of Object.values(n)) next.push(v);
        } // else: not traversable -> no matches
      }
    } else {
      for (const n of nodes) {
        if (n != null && typeof n === "object") next.push((n as any)[seg]);
      }
    }
    nodes = next;
    if (nodes.length === 0) break;
  }
  return nodes;
}

export function setByPath(obj: any, path: string, val: any): any {
  if (!path || path === ".") return val;
  const parts = path.split(".");
  const hasWildcard = parts.includes("*");

  // provider yields element-wise values for wildcard matches, or broadcasts a single value
  const provider = createValueProvider(val, hasWildcard);

  function rec(node: any, idx: number): any {
    if (idx >= parts.length) {
      // leaf replacement
      return provider.next();
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
        const out: any = { ...node };
        for (const k of Object.keys(node)) {
          const child = (node as any)[k];
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
      const nextContainer: any = {};
      const nextChild = rec(undefined, idx + 1);
      nextContainer[seg] = nextChild;
      return nextContainer;
    }
    const curChild = (node as any)[seg];
    const nextChild = rec(curChild, idx + 1);
    if (nextChild === curChild) return node;
    const clone = Array.isArray(node) ? [...node] : { ...node };
    (clone as any)[seg] = nextChild;
    return clone;
  }

  return rec(obj, 0);
}

function createValueProvider(val: any, wildcard: boolean) {
  if (!wildcard) {
    return { next: () => val };
  }
  if (Array.isArray(val)) {
    let i = 0;
    let last = val.length > 0 ? val[val.length - 1] : undefined;
    return {
      next: () => {
        if (i < val.length) {
          const v = val[i++];
          last = v;
          return v;
        }
        return last;
      },
    };
  }
  return { next: () => val };
}

export function deepStringReplace(input: any, search: string, replace: string): any {
  if (typeof input === "string") return input.split(search).join(replace);
  if (Array.isArray(input)) return input.map((x) => deepStringReplace(x, search, replace));
  if (input && typeof input === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(input)) out[k] = deepStringReplace(v, search, replace);
    return out;
  }
  return input;
}
