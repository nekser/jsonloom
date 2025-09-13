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
  const seen = new Set<unknown>();
  const out: T[] = [];
  for (const item of arr) {
    const key = (typeof item === "object" && item !== null ? (item as Record<string, unknown>)[by] : undefined);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}
