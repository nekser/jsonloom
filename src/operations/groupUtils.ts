export type CollectMode = "array" | "count" | "sum";
type Key = string | number;

export function groupBy<T extends Record<string, unknown>>(arr: T[], by: string): Map<Key, T[]> {
  const m = new Map<Key, T[]>();
  for (const it of arr) {
    const k = (it as Record<string, unknown>)?.[by] as Key;
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(it);
  }
  return m;
}

export function aggregateGroups<T extends Record<string, unknown>>(
  groups: Map<Key, T[]>,
  mode: CollectMode,
  sumPath?: string
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, items] of groups) {
    const idx = typeof k === "number" || typeof k === "string" ? k : String(k);
    if (mode === "array") out[idx] = items;
    else if (mode === "count") out[idx] = items.length;
    else if (mode === "sum") {
      const vals = sumPath ? items.map((it) => (it as Record<string, unknown>)?.[sumPath]) : (items as unknown[]);
      const nums = vals.map((v) => (typeof v === "number" ? v : Number(v))).filter((n) => Number.isFinite(n));
      out[idx] = nums.reduce((a, b) => a + b, 0);
    }
  }
  return out;
}
