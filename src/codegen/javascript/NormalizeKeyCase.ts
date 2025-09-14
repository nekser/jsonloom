type Cfg = { mode: "camel" | "snake" | "kebab" | "pascal" };

function toCase(s: string, mode: Cfg["mode"]): string {
  const parts = s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(p => p.toLowerCase());
  switch (mode) {
    case 'camel':
      return parts.map((p,i)=> i? p[0].toUpperCase()+p.slice(1): p).join('');
    case 'snake': return parts.join('_');
    case 'kebab': return parts.join('-');
    case 'pascal': return parts.map(p=> p[0].toUpperCase()+p.slice(1)).join('');
  }
}

export default function NormalizeKeyCase(cfg: Cfg, varName: string): string {
  const mode = JSON.stringify(cfg.mode || 'camel');
  return `// NormalizeKeyCase (${cfg.mode})
const __nkc_to = ${toCase.toString()};
const __nkc = (v) => {
  if (Array.isArray(v)) return v.map(__nkc);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[__nkc_to(k, ${mode})] = __nkc(val);
    return out;
  }
  return v;
};
${varName} = __nkc(${varName});`;
}
