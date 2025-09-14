type Cfg = { mode: "keep" | "remove"; keys: string[] };

export default function FilterByKey(cfg: Cfg, varName: string): string {
  const keys = JSON.stringify(cfg.keys || []);
  const keep = cfg.mode === "keep";
  return `// FilterByKey (${keep ? "keep" : "remove"}) keys ${keys}
const __fbkKeys = new Set(${keys});
const __fbk = (v) => {
  if (Array.isArray(v)) return v.map(__fbk);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      const cond = ${keep} ? __fbkKeys.has(k) : !__fbkKeys.has(k);
      if (cond) out[k] = __fbk(val);
    }
    return out;
  }
  return v;
};
${varName} = __fbk(${varName});`;
}
