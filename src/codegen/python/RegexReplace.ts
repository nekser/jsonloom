type Cfg = { path?: string; pattern: string; replace: string; flags?: string };

export default function RegexReplace(cfg: Cfg, varName: string): string {
  const pattern = JSON.stringify(cfg.pattern ?? "");
  const flags = JSON.stringify(cfg.flags ?? "g");
  const replace = JSON.stringify(cfg.replace ?? "");
  const body = `const __rr_re = new RegExp(${pattern}, ${flags});
const __rr = (v) => {
  if (typeof v === 'string') return v.replace(__rr_re, ${replace});
  if (Array.isArray(v)) return v.map(__rr);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k,val] of Object.entries(v)) out[k] = __rr(val);
    return out;
  }
  return v;
};`;
  if (!cfg.path) {
    return `// RegexReplace globally\n${body}\n${varName} = __rr(${varName});`;
  }
  const path = cfg.path.split('.').map(s => JSON.stringify(s)).join("][");
  return `// RegexReplace at path ${JSON.stringify(cfg.path)}\n${body}\n{\n  const __t = ${varName}[${path}];\n  ${varName}[${path}] = __rr(__t);\n}`;
}
