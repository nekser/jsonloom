type Cfg = { path: string; to: "string"|"number"|"boolean"|"object"|"array"; fallback?: unknown };

export default function CoerceType(cfg: Cfg, varName: string): string {
  const path = cfg.path;
  const tgt = `${varName}${path.split('.').map(s=>`['${s}']`).join('')}`;
  const fb = cfg.fallback !== undefined ? JSON.stringify(cfg.fallback) : "None";
  const to = cfg.to;
  const conv = {
    string: `str(${tgt}) if ${tgt} is not None else ${fb}`,
    number: `float(${tgt}) if ${tgt} not in (None, '') else ${fb}`,
    boolean: `bool(${tgt}) if ${tgt} is not None else ${fb}`,
    object: `dict(${tgt}) if isinstance(${tgt}, dict) else ${fb}`,
    array: `list(${tgt}) if isinstance(${tgt}, (list, tuple)) else ${fb}`,
  } as const;
  const expr = conv[to];
  return `${tgt} = ${expr}`;
}
