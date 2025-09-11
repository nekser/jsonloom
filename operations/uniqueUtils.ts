export function uniqueBy<T>(arr: T[], by?: string): T[] {
  if (!by) {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const item of arr) {
      const key = JSON.stringify(item);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(item);
      }
    }
    return out;
  }
  const seen = new Set<any>();
  const out: T[] = [];
  for (const item of arr) {
    const key = (item as any)?.[by];
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}
