type Cfg = { from: string; to: string };

export default function RenameKey(cfg: Cfg, varName: string): string {
  const from = JSON.stringify(cfg.from || "");
  const to = JSON.stringify(cfg.to || "");
  return `# RenameKey ${from} -> ${to}
def __rk(v):
  if isinstance(v, list):
    return [__rk(x) for x in v]
  if isinstance(v, dict):
    out = {}
    for k, val in v.items():
      nk = ${to} if k == ${from} else k
      out[nk] = __rk(val)
    return out
  return v

${varName} = __rk(${varName})`;
}
