type Cfg = { from: string; to: string };

export default function RenameKey(cfg: Cfg, varName: string): string {
  const from = JSON.stringify(cfg.from || "");
  const to = JSON.stringify(cfg.to || "");
  return `// RenameKey ${cfg.from} -> ${cfg.to}\nvar __rk func(v any) any\n__rk = func(v any) any {\n  switch t := v.(type) {\n  case []any:\n    out := make([]any, len(t))\n    for i:=range t { out[i] = __rk(t[i]) }\n    return out\n  case map[string]any:\n    out := map[string]any{}\n    for k, val := range t {\n      nk := k\n      if k == ${from} { nk = ${to} }\n      out[nk] = __rk(val)\n    }\n    return out\n  default:\n    return v\n  }\n}\n${varName} = __rk(${varName})`;
}
