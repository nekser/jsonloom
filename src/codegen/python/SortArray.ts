type Cfg = { path: string; by?: string; order?: "asc" | "desc"; caseInsensitive?: boolean; nulls?: "first" | "last" };

export default function SortArray(cfg: Cfg, varName: string): string {
  const arr = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const by = cfg.by ? JSON.stringify(cfg.by) : undefined;
  const reverse = cfg.order === 'desc';
  const ci = !!cfg.caseInsensitive;
  const nullsFirst = cfg.nulls === 'first';
  const keyExpr = by ? `(x.get(${by!}) if isinstance(x, dict) else x)` : `x`;
  const ciWrap = ci ? `((str(v).lower()) if v is not None else v)` : `v`;
  // Python sort key: tuple to enforce nulls position then value
  return `# SortArray\n${varName}${arr} = sorted(list(${varName}${arr} or []), key=lambda x: ((0 if ${keyExpr} is None else 1) if ${nullsFirst} else (1 if ${keyExpr} is None else 0), ${ciWrap.replace(/v/g, keyExpr)}), reverse=${reverse})`;
}
