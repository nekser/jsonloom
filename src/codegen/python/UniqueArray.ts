type Cfg = { path: string; by?: string };

export default function UniqueArray(cfg: Cfg, varName: string): string {
  const access = (cfg.path||"").split('.').map(s=>`[${JSON.stringify(s)}]`).join('');
  const by = cfg.by ? JSON.stringify(cfg.by) : undefined;
  const keyExpr = by ? `(it.get(${by!}) if isinstance(it, dict) else it)` : `it`;
  return `# UniqueArray\n__seen = set()\n__out = []\nfor it in (${varName}${access} or []):\n  __k = __import__('json').dumps(${keyExpr}) if ${keyExpr} is not None else '__undefined__'\n  if __k in __seen: continue\n  __seen.add(__k)\n  __out.append(it)\n${varName}${access} = __out`;
}
