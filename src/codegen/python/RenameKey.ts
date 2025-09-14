type Cfg = { from: string; to: string };

export default function RenameKey(cfg: Cfg, varName: string): string {
  const from = JSON.stringify(cfg.from || "");
  const to = JSON.stringify(cfg.to || "");
  return `// RenameKey ${from} -> ${to}
const __rk = (v) => {
  if (Array.isArray(v)) return v.map(__rk);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      const nk = (k === ${from}) ? ${to} : k;
      out[nk] = __rk(val);
    }
    return out;
  }
  return v;
};
${varName} = __rk(${varName});`;
}
