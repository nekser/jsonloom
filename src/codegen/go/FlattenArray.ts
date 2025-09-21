type Cfg = { path: string; depth?: number | "infinity" };

export default function FlattenArray(cfg: Cfg, varName: string): string {
  const p = JSON.stringify(cfg.path || "");
  const depth = cfg.depth === "infinity" ? -1 : (cfg.depth ?? 1);
  return `// FlattenArray\nif arr, ok := getPath(${varName}, ${p}).([]any); ok {\n  out := []any{}\n  var walk func(a []any, d int)
  walk = func(a []any, d int) {
    for _, v := range a {
      if sub, ok := v.([]any); ok && (${depth} < 0 || d < ${depth}) { walk(sub, d+1) } else { out = append(out, v) }
    }
  }
  walk(arr, 0)
  setPath(&${varName}, ${p}, out)
}`;
}
