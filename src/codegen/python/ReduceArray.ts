type Cfg = { path: string; by?: string; op: "sum" | "avg" | "min" | "max" | "concat" };

export default function ReduceArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const by = cfg.by ? JSON.stringify(cfg.by) : undefined;
  const val = by ? `(it.get(${by!}) if isinstance(it, dict) else None)` : `it`;
  const code = cfg.op === 'sum'
    ? `sum([v for v in [${val} for it in (${varName}${access} or [])] if isinstance(v, (int, float))])`
    : cfg.op === 'avg'
    ? `((lambda __arr: (sum(__arr)/len(__arr) if __arr else 0))([v for v in [${val} for it in (${varName}${access} or [])] if isinstance(v, (int, float))]))`
    : cfg.op === 'min'
    ? `((lambda __arr: (min(__arr) if __arr else None))([v for v in [${val} for it in (${varName}${access} or [])] if isinstance(v, (int, float))]))`
    : cfg.op === 'max'
    ? `((lambda __arr: (max(__arr) if __arr else None))([v for v in [${val} for it in (${varName}${access} or [])] if isinstance(v, (int, float))]))`
    : `''.join([str(${val}) for it in (${varName}${access} or [])])`;
  return `# ReduceArray (${cfg.op})\n${varName}${access} = ${code}`;
}
