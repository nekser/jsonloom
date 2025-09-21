type Cfg = { path: string; by?: string };

export default function UniqueArray(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const by = cfg.by ? JSON.stringify(cfg.by) : null;
  return `// UniqueArray\nif arr, ok := getPath(${varName}, ${p}).([]any); ok {\n  seen := map[string]struct{}{}\n  out := []any{}\n  for _, it := range arr {\n    var key any = it\n    if ${by ? "true" : "false"} { key = getPath(it, ${by ?? "\"\""}) }\n    ks := "__undefined__"\n    if key != nil { ks = fmt.Sprintf("%v", key) }\n    if _, has := seen[ks]; has { continue }\n    seen[ks] = struct{}{}\n    out = append(out, it)\n  }\n  setPath(&${varName}, ${p}, out)\n}`;
}
