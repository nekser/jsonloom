export type FieldMap = { from: string; to: string };

export function applyFieldMap<T extends Record<string, any>>(item: T, mapping: FieldMap[]): T {
  const out: any = Array.isArray(item) ? [...(item as any)] : { ...item };
  for (const m of mapping) {
    if (m.from === m.to) continue;
    if (Object.prototype.hasOwnProperty.call(out, m.from)) {
      out[m.to] = out[m.from];
      delete out[m.from];
    }
  }
  return out as T;
}
