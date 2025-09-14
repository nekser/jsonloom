type Cfg = { path: string; by?: string; order?: "asc" | "desc"; caseInsensitive?: boolean; nulls?: "first" | "last" };

export default function SortArray(cfg: Cfg, varName: string): string {
  const arr = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const by = cfg.by ? JSON.stringify(cfg.by) : undefined;
  const dir = cfg.order === 'desc' ? -1 : 1;
  const ci = !!cfg.caseInsensitive;
  const nulls = cfg.nulls === 'first' ? -1 : 1;
  return `// SortArray
${varName}${arr} = (${varName}${arr}||[]).slice().sort((a,b)=>{
  let va = ${by ? `(a && typeof a==='object'? a[${by}] : a)` : `a`};
  let vb = ${by ? `(b && typeof b==='object'? b[${by}] : b)` : `b`};
  if (va == null && vb == null) return 0;
  if (va == null) return ${nulls};
  if (vb == null) return ${-nulls};
  if (${ci}) { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
  if (va < vb) return ${-1 * dir};
  if (va > vb) return ${1 * dir};
  return 0;
});`;
}
