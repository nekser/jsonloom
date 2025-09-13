export type Order = "asc" | "desc";

export function buildComparator({
  by,
  order = "asc",
  caseInsensitive = false,
  nulls = "last",
}: {
  by?: string;
  order?: Order;
  caseInsensitive?: boolean;
  nulls?: "first" | "last";
}) {
  const dir = order === "desc" ? -1 : 1;
  const normalize = (v: any) => {
    if (v == null) return v;
    if (typeof v === "string" && caseInsensitive) return v.toLowerCase();
    return v;
  };
  return (a: any, b: any) => {
    const va = normalize(by ? a?.[by] : a);
    const vb = normalize(by ? b?.[by] : b);
    if (va == null && vb == null) return 0;
    if (va == null) return nulls === "first" ? -1 : 1;
    if (vb == null) return nulls === "first" ? 1 : -1;
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  };
}

export function stableSort<T>(arr: T[], cmp: (a: T, b: T) => number): T[] {
  return arr
    .map((v, i) => ({ v, i }))
    .sort((a, b) => {
      const d = cmp(a.v, b.v);
      return d !== 0 ? d : a.i - b.i;
    })
    .map((x) => x.v);
}
