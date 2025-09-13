export function sliceWithStep<T>(arr: T[], start?: number, end?: number, step?: number): T[] {
  const len = arr.length;
  let s = start ?? 0;
  let e = end ?? len;
  if (s < 0) s = Math.max(0, len + s);
  if (e < 0) e = Math.max(0, len + e);
  const base = arr.slice(s, e);
  if (!step || step === 1) return base;
  const out: T[] = [];
  for (let i = 0; i < base.length; i += Math.abs(step)) {
    out.push(base[i]);
  }
  return out;
}
