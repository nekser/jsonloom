type Cfg = { path: string; delimiter?: string; maxDepth?: number };

export default function FlattenObject(cfg: Cfg, varName: string): string {
  const delim = JSON.stringify(cfg.delimiter ?? ".");
  const depth = cfg.maxDepth ?? -1;
  const p = JSON.stringify(cfg.path || "");
  return `// FlattenObject\nif m, ok := getPath(${varName}, ${p}).(map[string]any); ok {\n  out := map[string]any{}\n  var walk func(map[string]any, string, int)
  walk = func(cur map[string]any, prefix string, d int) {
    for k, v := range cur {
      nk := k
      if prefix != "" { nk = prefix + ${delim} + k }
      if sub, ok := v.(map[string]any); ok && (${depth} < 0 || d < ${depth}) { walk(sub, nk, d+1) } else { out[nk] = v }
    }
  }
  walk(m, "", 0)
  setPath(&${varName}, ${p}, out)
}`;
}
