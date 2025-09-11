export function getByPath(obj: any, path: string): any {
  if (!path || path === ".") return obj;
  return path.split(".").reduce((acc, seg) => (acc == null ? acc : (acc as any)[seg]), obj);
}

export function setByPath(obj: any, path: string, val: any): any {
  if (!path || path === ".") return val;
  const parts = path.split(".");
  const root = Array.isArray(obj) ? [...obj] : obj && typeof obj === "object" ? { ...obj } : {};
  let cur: any = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    cur[p] = Array.isArray(next) ? [...next] : next && typeof next === "object" ? { ...next } : {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = val;
  return root;
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
