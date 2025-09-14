type Cfg = { path: string; source: "root" | "path"; sourcePath?: string; strategy?: "shallow" | "deep" | "overwrite" };

export default function MergeAtPath(cfg: Cfg, varName: string): string {
  const segs = (cfg.path || "").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const src = cfg.source === 'root' ? varName : `${varName}${(cfg.sourcePath||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('')}`;
  const strat = cfg.strategy || 'shallow';
  const deepFn = `const __mergeDeep = (a,b)=>{if(Array.isArray(a)&&Array.isArray(b))return [...a,...b]; if(a&&typeof a==='object'&&b&&typeof b==='object'){const out={...a}; for(const [k,v] of Object.entries(b)){out[k]=__mergeDeep(a[k],v);} return out;} return b;};`;
  const expr = strat === 'overwrite' ? `${src}` : (strat === 'deep' ? `__mergeDeep(${varName}${segs}||{}, ${src})` : `{...(${varName}${segs}||{}), ...(${src}||{})}`);
  return `// MergeAtPath
${strat === 'deep' ? deepFn + "\n" : ""}${varName}${segs} = ${expr};`;
}
