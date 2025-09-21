type Cfg = { mode: "keep" | "remove"; keys: string[] };

export default function FilterByKey(cfg: Cfg, varName: string): string {
  const keys = cfg.keys || [];
  const keep = cfg.mode === "keep";
  return `// FilterByKey (${keep ? "keep" : "remove"})\nvar __set = map[string]struct{}{${keys.map((k)=>JSON.stringify(k)+":{}" as string).join(", ")}}
var __fbk func(v any) any
__fbk = func(v any) any {
  switch t := v.(type) {
  case []any:
    out := make([]any, len(t))
    for i, it := range t { out[i] = __fbk(it) }
    return out
  case map[string]any:
    out := map[string]any{}
    for k, val := range t {
      _, has := __set[k]
      cond := has
      if ${keep ? "false" : "true"} { cond = !has }
      if cond { out[k] = __fbk(val) }
    }
    return out
  default:
    return v
  }
}
${varName} = __fbk(${varName})`;
}
