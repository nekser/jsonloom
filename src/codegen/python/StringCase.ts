type Cfg = { path: string; mode: "lowercase" | "uppercase"; coerceNonString?: boolean };

export default function StringCase(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const upper = cfg.mode === 'uppercase';
  const coerce = !!cfg.coerceNonString;
  return `// StringCase (${cfg.mode})
const __sc_apply = (s) => ${upper? 'String(s).toUpperCase()' : 'String(s).toLowerCase()'};
const __sc_map = (v) => {
  if (typeof v === 'string') return __sc_apply(v);
  if (${coerce ? 'true' : 'false'}) return __sc_apply(v);
  if (Array.isArray(v)) return v.map(__sc_map);
  if (v && typeof v === 'object') { const out = {}; for (const [k,val] of Object.entries(v)) out[k]=__sc_map(val); return out; }
  return v;
};
${varName}${access} = __sc_map(${varName}${access});`;
}
