type Cfg = { path?: string; search: string; replace: string };

export default function StringReplace(cfg: Cfg, varName: string): string {
  const search = JSON.stringify(cfg.search ?? "");
  const replace = JSON.stringify(cfg.replace ?? "");
  const body = `const __sr = (v) => {
  if (typeof v === 'string') return v.split(${search}).join(${replace});
  if (Array.isArray(v)) return v.map(__sr);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k,val] of Object.entries(v)) out[k] = __sr(val);
    return out;
  }
  return v;
};`;
  if (!cfg.path) {
    return `// StringReplace globally
${body}
${varName} = __sr(${varName});`;
  }
  const path = cfg.path.split('.').map(s => JSON.stringify(s)).join("][");
  return `// StringReplace at path ${JSON.stringify(cfg.path)}
${body}
{
  const __t = ${varName}[${path}];
  ${varName}[${path}] = __sr(__t);
}`;
}
