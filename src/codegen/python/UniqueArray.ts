type Cfg = { path: string; by?: string };

export default function UniqueArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const by = cfg.by ? JSON.stringify(cfg.by) : undefined;
  return `// UniqueArray
{
  const __seen = new Set();
  ${varName}${access} = (${varName}${access}||[]).filter((it)=>{
    const key = ${by ? `(it && typeof it==='object'? it[${by}] : it)` : `it`};
    const k = key === undefined ? '__undefined__' : JSON.stringify(key);
    if (__seen.has(k)) return false; __seen.add(k); return true;
  });
}`;
}
