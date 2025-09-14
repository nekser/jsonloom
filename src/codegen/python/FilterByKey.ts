type Cfg = { mode: "keep" | "remove"; keys: string[] };

export default function FilterByKey(cfg: Cfg, varName: string): string {
  const keep = cfg.mode === "keep";
  const keys = JSON.stringify(cfg.keys || []);
  return `# FilterByKey (${keep ? "keep" : "remove"}) keys ${keys}
__fbk_keys = set(${keys})
def __fbk(v):
  if isinstance(v, list):
    return [__fbk(x) for x in v]
  if isinstance(v, dict):
    out = {}
    for k, val in v.items():
      cond = (k in __fbk_keys) if ${keep ? "True" : "False"} else (k not in __fbk_keys)
      if cond:
        out[k] = __fbk(val)
    return out
  return v

${varName} = __fbk(${varName})`;
}
