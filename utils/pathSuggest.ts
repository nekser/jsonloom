import { useMemo } from "react";

// Build all possible dot-notation paths for object keys, expanding arrays as [index] only for indexing,
// but for suggestions we focus on object keys and support depth-aware next-key suggestions.

export type PathIndex = {
  // complete paths like "user.name", "items" etc.
  allPaths: string[];
  // map from prefix to next keys at that depth
  children: Map<string, Set<string>>;
  // top-level keys
  roots: Set<string>;
  // all unique keys seen anywhere in the tree
  anyKeys: Set<string>;
};

export function buildPathIndex(root: any): PathIndex {
  const allPaths: string[] = [];
  const children = new Map<string, Set<string>>();
  const roots = new Set<string>();
  const anyKeys = new Set<string>();
  const MAX_ARRAY_INDEX_SUGGEST = 25;
  const MAX_ARRAY_PROBE_FOR_KEYS = 10;

  const addChild = (prefix: string, key: string) => {
    const set = children.get(prefix) ?? new Set<string>();
    set.add(key);
    children.set(prefix, set);
  };

  const visit = (node: any, prefix: string) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      // Suggest a limited range of numeric indices at this prefix
      const maxIdx = Math.min(MAX_ARRAY_INDEX_SUGGEST, node.length);
      for (let i = 0; i < maxIdx; i++) {
        addChild(prefix, String(i));
      }
      // Analyze first few items to infer object keys for suggestions
      const maxProbe = Math.min(MAX_ARRAY_PROBE_FOR_KEYS, node.length);
      for (let i = 0; i < maxProbe; i++) {
        const it = node[i];
        if (it && typeof it === "object" && !Array.isArray(it)) {
          for (const k of Object.keys(it)) {
            addChild(prefix, k);
            anyKeys.add(k);
          }
        }
      }
      // Continue traversal for nested objects with indexed prefixes
      for (let i = 0; i < maxProbe; i++) visit(node[i], prefix ? `${prefix}.${i}` : String(i));
      return;
    }
    for (const k of Object.keys(node)) {
      const cur = prefix ? `${prefix}.${k}` : k;
      allPaths.push(cur);
      if (!prefix) roots.add(k);
      addChild(prefix, k);
      anyKeys.add(k);
      visit((node as any)[k], cur);
    }
  };

  visit(root, "");
  allPaths.sort();
  return { allPaths, children, roots, anyKeys };
}

// Suggest next tokens for a dot-notation path using startsWith filtering
export function suggestPathTokens(index: PathIndex, input: string): string[] {
  // If empty or ends with a dot, suggest children at that prefix
  const trimmed = input.trim();
  const parts = trimmed.split(".");
  const last = parts.pop() ?? "";
  const prefix = parts.join(".");

  // When no dot yet, suggest top-level keys by startsWith(last)
  if (!prefix) {
  const base = new Set<string>();
  for (const k of index.roots) base.add(k);
  const rootChildren = index.children.get("");
  if (rootChildren) for (const k of rootChildren) base.add(k);
  const list = Array.from(base).filter((k) => k.toLowerCase().startsWith((last ?? "").toLowerCase()));
  return list.map((k) => k);
  }
  // We have some depth. Only show children of the prefix path
  const set = index.children.get(prefix) ?? new Set<string>();
  const list = Array.from(set).filter((k) => k.toLowerCase().startsWith(last.toLowerCase()));
  return list.map((k) => (prefix ? `${prefix}.${k}` : k));
}

// Suggest object keys (for operations like FilterByKey) at the top level based on the source root value.
export function suggestTopLevelKeys(root: any, startsWith: string): string[] {
  if (!root || typeof root !== "object" || Array.isArray(root)) return [];
  const s = startsWith.toLowerCase();
  return Object.keys(root).filter((k) => k.toLowerCase().startsWith(s));
}

// Collect unique keys across the entire object tree
export function suggestAnyKeys(root: any, startsWith: string): string[] {
  const set = new Set<string>();
  const visit = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (let i = 0; i < Math.min(100, node.length); i++) visit(node[i]);
      return;
    }
    for (const k of Object.keys(node)) {
      set.add(k);
      visit((node as any)[k]);
    }
  };
  visit(root);
  const s = (startsWith ?? "").toLowerCase();
  return Array.from(set).filter((k) => k.toLowerCase().startsWith(s)).sort();
}

export function usePathIndex(root: any): PathIndex {
  return useMemo(() => buildPathIndex(root), [root]);
}

// Suggest keys from a prebuilt index
export function suggestIndexKeys(index: PathIndex, startsWith: string): string[] {
  const s = (startsWith ?? "").toLowerCase();
  return Array.from(index.anyKeys).filter((k) => k.toLowerCase().startsWith(s)).sort();
}
