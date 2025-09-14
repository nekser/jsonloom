type Cfg = { path: string; by: string; collect?: "array" | "count" | "sum"; sumPath?: string };

export default function GroupBy(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const by = JSON.stringify(cfg.by || "");
  const collect = cfg.collect || 'array';
  const sumPath = cfg.sumPath ? JSON.stringify(cfg.sumPath) : undefined;
  const keyExpr = `(it.get(${by}) if isinstance(it, dict) else None)`;
  const sumVal = sumPath ? `(it.get(${sumPath!}) if isinstance(it, dict) else 0)` : `0`;
  const outExpr = collect === 'count'
    ? `[{ 'key': k, 'count': len(arr) } for k, arr in __groups.items()]`
    : collect === 'sum'
    ? `[{ 'key': k, 'sum': sum([ (v if isinstance(v,(int,float)) else 0) for v in [${sumVal} for it in arr] ]) } for k, arr in __groups.items()]`
    : `[{ 'key': k, 'items': arr } for k, arr in __groups.items()]`;
  return `# GroupBy\n__groups = {}\nfor it in (${varName}${access} or []):\n  k = ${keyExpr}\n  kk = '__undefined__' if k is None else str(k)\n  __groups.setdefault(kk, []).append(it)\n${varName}${access} = ${outExpr}`;
}
