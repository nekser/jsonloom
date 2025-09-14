type Cfg = { path?: string };

export default function TrimStrings(cfg: Cfg, varName: string): string {
  const body = `const __ts = (v) => {
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return v.map(__ts);
  if (v && typeof v === 'object') { const out = {}; for (const [k,val] of Object.entries(v)) out[k]=__ts(val); return out; }
  return v;
};`;
  if (!cfg.path) return `// TrimStrings globally\n${body}\n${varName} = __ts(${varName});`;
  const path = cfg.path.split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// TrimStrings at path ${JSON.stringify(cfg.path)}\n${body}\n${varName}${path} = __ts(${varName}${path});`;
}
