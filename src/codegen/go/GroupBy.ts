type Cfg = { path: string; by: string; collect?: "array" | "count" | "sum"; sumPath?: string };

export default function GroupBy(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const by = JSON.stringify(cfg.by || "");
  const collect = cfg.collect || "array";
  const sumPath = cfg.sumPath ? JSON.stringify(cfg.sumPath) : undefined;
  return `// GroupBy\nif arr, ok := getPath(${varName}, ${p}).([]any); ok {\n  groups := map[string][]any{}\n  for _, it := range arr {\n    var key any\n    if m, ok := it.(map[string]any); ok { key = m[${by}] }\n    ks := "__undefined__"\n    if key != nil { ks = fmt.Sprintf("%v", key) }\n    groups[ks] = append(groups[ks], it)\n  }\n  out := []any{}\n  for k, g := range groups {\n    switch ${JSON.stringify(collect)} {\n    case "count": out = append(out, map[string]any{"key": k, "count": float64(len(g))})\n    case "sum": {\n      total := float64(0)\n      for _, it := range g { if m, ok := it.(map[string]any); ok { if n, ok := m[${sumPath!=='undefined'?sumPath:'""'}].(float64); ok { total += n } } }\n      out = append(out, map[string]any{"key": k, "sum": total})\n    }\n    default: out = append(out, map[string]any{"key": k, "items": g})\n    }\n  }\n  setPath(&${varName}, ${p}, out)\n}`;
}
