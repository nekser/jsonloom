type Cfg = { path: string; source: "root" | "path"; sourcePath?: string; strategy?: "shallow" | "deep" | "overwrite" };

export default function MergeAtPath(cfg: Cfg, varName: string): string {
  const segs = (cfg.path || "").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const src = cfg.source === 'root' ? varName : `${varName}${(cfg.sourcePath||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('')}`;
  const strat = cfg.strategy || 'shallow';
  const deepFn = `def __merge_deep(a,b):\n  if isinstance(a,list) and isinstance(b,list):\n    return list(a) + list(b)\n  if isinstance(a,dict) and isinstance(b,dict):\n    out = dict(a)\n    for k,v in b.items():\n      out[k] = __merge_deep(a.get(k) if isinstance(a,dict) else None, v)\n    return out\n  return b`;
  const expr = strat === 'overwrite' ? `${src}` : (strat === 'deep' ? `__merge_deep(${varName}${segs} or {}, ${src})` : `dict(**(${varName}${segs} or {}), **(${src} or {}))`);
  return `# MergeAtPath\n${strat === 'deep' ? deepFn + "\n" : ""}${varName}${segs} = ${expr}`;
}
