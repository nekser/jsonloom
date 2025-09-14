type Cfg = { path: string; delimiter?: string; maxDepth?: number };

export default function FlattenObject(cfg: Cfg, varName: string): string {
  const delim = JSON.stringify(cfg.delimiter ?? ".");
  const depth = cfg.maxDepth ?? -1;
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  return `// FlattenObject
const __flatObj = (obj, prefix = '', d = 0) => {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const nk = prefix ? prefix + ${delim} + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && (${depth} < 0 || d < ${depth})) Object.assign(out, __flatObj(v, nk, d+1));
    else out[nk] = v;
  }
  return out;
};
${varName}${access} = __flatObj(${varName}${access});`;
}
