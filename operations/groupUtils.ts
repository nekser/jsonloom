export type CollectMode = "array" | "count" | "sum";

export function groupBy<T extends Record<string, any>>(arr: T[], by: string): Map<any, T[]> {
  const m = new Map<any, T[]>();
  for (const it of arr) {
    const k = (it as any)?.[by];
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(it);
  }
  return m;
}

export function aggregateGroups<T extends Record<string, any>>(
  groups: Map<any, T[]>,
  mode: CollectMode,
  sumPath?: string
): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, items] of groups) {
    if (mode === "array") out[k] = items;
    else if (mode === "count") out[k] = items.length;
    else if (mode === "sum") {
      const vals = sumPath ? items.map((it) => (it as any)?.[sumPath]) : items as any[];
      const nums = vals.map((v) => (typeof v === "number" ? v : Number(v))).filter((n) => Number.isFinite(n));
      out[k] = nums.reduce((a, b) => a + b, 0);
    }
  }
  return out;
}
